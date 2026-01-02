"""Service for managing search limits for users."""
import logging
from datetime import date, datetime
from typing import Optional, Tuple
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subscription import DailySearchUsage, Subscription
from app.models.user import Profile

logger = logging.getLogger(__name__)

# Search limits configuration
GUEST_USER_SEARCH_LIMIT = 1           # Guest (no account): 1 search total
FREE_REGISTERED_USER_DAILY_LIMIT = 3  # Registered free user: 3 searches per day
GUEST_USER_RESULT_LIMIT = 5           # Results shown to guest users
FREE_REGISTERED_USER_RESULT_LIMIT = 10  # Results shown to free registered users
PREMIUM_USER_RESULT_LIMIT = -1        # Unlimited results for premium users


class SearchLimitService:
    """
    Service for managing search limits based on user type and subscription status.
    
    Limits:
    - Guest users (session_id only, no user_id): 1 search total (not per day)
    - Free registered users (user_id): 3 searches per day
    - Premium/Trial users: Unlimited searches
    """

    @staticmethod
    async def check_search_access(
        db: AsyncSession,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> Tuple[bool, int, str]:
        """
        Check if user/session has search access.
        
        Args:
            db: Database session
            user_id: User UUID (if logged in)
            session_id: Session ID (for guests or tracking)
            
        Returns:
            Tuple[has_access, remaining_searches, message]
            - has_access: Whether the user can perform a search
            - remaining_searches: Number of searches left (-1 for unlimited)
            - message: Human-readable message about their status
        """
        try:
            # Case 1: Registered user with user_id
            if user_id:
                logger.info(f"[Search Access] Checking user: {user_id}")
                
                # Check for active premium/trial subscription
                subscription = await db.execute(
                    select(Subscription).where(
                        Subscription.user_id == user_id,
                        Subscription.is_active == True,
                        Subscription.plan_type.in_(['premium', 'trial'])
                    )
                )
                subscription = subscription.scalar_one_or_none()
                
                if subscription:
                    logger.info(
                        f"[Search Access] User {user_id} has {subscription.plan_type} subscription - UNLIMITED"
                    )
                    return True, -1, f"Unlimited searches - {subscription.plan_type.title()} subscription"
                
                # Check daily search count for free registered users
                today = date.today()
                # Use aggregation to handle multiple rows for same user/date
                result = await db.execute(
                    select(func.sum(DailySearchUsage.search_count)).where(
                        DailySearchUsage.user_id == user_id,
                        DailySearchUsage.search_date == today
                    )
                )
                current_count = result.scalar() or 0
                remaining = FREE_REGISTERED_USER_DAILY_LIMIT - current_count
                
                if remaining <= 0:
                    logger.warning(
                        f"[Search Access] User {user_id} DAILY LIMIT REACHED ({current_count}/{FREE_REGISTERED_USER_DAILY_LIMIT})"
                    )
                    return False, 0, (
                        f"Daily search limit reached ({current_count}/{FREE_REGISTERED_USER_DAILY_LIMIT}). "
                        "Upgrade to Premium for unlimited searches."
                    )
                
                logger.info(
                    f"[Search Access] User {user_id} FREE TIER - {remaining} searches remaining today"
                )
                return True, remaining, f"{remaining} of {FREE_REGISTERED_USER_DAILY_LIMIT} searches remaining today"
            
            # Case 2: Guest user (session_id only, no user_id)
            elif session_id:
                logger.info(f"[Search Access] Checking guest session: {session_id}")
                
                today = date.today()
                # Use aggregation to handle multiple rows for same session/date
                result = await db.execute(
                    select(func.sum(DailySearchUsage.search_count)).where(
                        DailySearchUsage.session_id == session_id,
                        DailySearchUsage.search_date == today
                    )
                )
                current_count = result.scalar() or 0
                remaining = GUEST_USER_SEARCH_LIMIT - current_count
                
                if remaining <= 0:
                    logger.warning(
                        f"[Search Access] Guest {session_id} GUEST LIMIT REACHED ({current_count}/{GUEST_USER_SEARCH_LIMIT})"
                    )
                    return False, 0, (
                        f"You've used your {GUEST_USER_SEARCH_LIMIT} free search. "
                        f"Sign up to get {FREE_REGISTERED_USER_DAILY_LIMIT} free searches per day!"
                    )
                
                logger.info(f"[Search Access] Guest {session_id} - {remaining} search(es) remaining")
                return True, remaining, f"{remaining} of {GUEST_USER_SEARCH_LIMIT} free search remaining"
            
            # Case 3: No user_id or session_id provided
            logger.warning("[Search Access] No user_id or session_id provided - access denied")
            return False, 0, "Session information required to perform search"
        
        except Exception as e:
            logger.error(f"[Search Access] ERROR checking access: {str(e)}", exc_info=True)
            # Fail open on error - allow search but log it
            return True, -1, "Access granted (system error - bypassed limit check)"

    @staticmethod
    async def increment_search_count(
        db: AsyncSession,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> bool:
        """
        Increment search count for user or guest session.
        
        Args:
            db: Database session
            user_id: User UUID (if logged in)
            session_id: Session ID (for guests)
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            today = date.today()
            
            if user_id:
                logger.info(f"[Search Count] Incrementing for user: {user_id}")
                
                # Find existing records for user (might be multiple from past operations)
                result = await db.execute(
                    select(DailySearchUsage).where(
                        DailySearchUsage.user_id == user_id,
                        DailySearchUsage.search_date == today
                    )
                )
                usage_records = result.scalars().all()
                
                if usage_records:
                    # Sum up existing records and consolidate to first one
                    total_count = sum(u.search_count for u in usage_records)
                    first_record = usage_records[0]
                    first_record.search_count = total_count + 1
                    
                    # Delete other records if multiple exist
                    for record in usage_records[1:]:
                        await db.delete(record)
                    
                    logger.info(f"[Search Count] User {user_id} consolidated and incremented to {first_record.search_count}")
                else:
                    usage = DailySearchUsage(
                        user_id=user_id,
                        session_id=None,
                        search_date=today,
                        search_count=1
                    )
                    db.add(usage)
                    logger.info(f"[Search Count] Created new record for user {user_id}")
                
            elif session_id:
                logger.info(f"[Search Count] Incrementing for guest session: {session_id}")
                
                # Find existing records for session (might be multiple from past operations)
                result = await db.execute(
                    select(DailySearchUsage).where(
                        DailySearchUsage.session_id == session_id,
                        DailySearchUsage.search_date == today
                    )
                )
                usage_records = result.scalars().all()
                
                if usage_records:
                    # Sum up existing records and consolidate to first one
                    total_count = sum(u.search_count for u in usage_records)
                    first_record = usage_records[0]
                    first_record.search_count = total_count + 1
                    
                    # Delete other records if multiple exist
                    for record in usage_records[1:]:
                        await db.delete(record)
                    
                    logger.info(f"[Search Count] Session {session_id} consolidated and incremented to {first_record.search_count}")
                else:
                    usage = DailySearchUsage(
                        user_id=None,
                        session_id=session_id,
                        search_date=today,
                        search_count=1
                    )
                    db.add(usage)
                    logger.info(f"[Search Count] Created new record for session {session_id}")
            
            else:
                logger.error("[Search Count] No user_id or session_id provided")
                return False
            
            await db.commit()
            return True
        
        except Exception as e:
            logger.error(f"[Search Count] ERROR incrementing count: {str(e)}", exc_info=True)
            await db.rollback()
            return False

    @staticmethod
    async def migrate_guest_session_to_user(
        db: AsyncSession,
        session_id: str,
        user_id: str
    ) -> bool:
        """
        When a guest logs in/registers, migrate their session record to their new user account.
        This keeps their search history intact.
        
        Args:
            db: Database session
            session_id: Guest session ID
            user_id: New user's UUID
            
        Returns:
            bool: True if successful
        """
        try:
            logger.info(f"[Session Migration] Migrating session {session_id} to user {user_id}")
            
            today = date.today()
            
            # Find all guest usage records for today (might be multiple)
            result = await db.execute(
                select(DailySearchUsage).where(
                    DailySearchUsage.session_id == session_id,
                    DailySearchUsage.search_date == today
                )
            )
            guest_records = result.scalars().all()
            
            if guest_records:
                # Sum up all guest usage
                total_guest_count = sum(u.search_count for u in guest_records)
                
                # Check if user already has a record for today
                result = await db.execute(
                    select(DailySearchUsage).where(
                        DailySearchUsage.user_id == user_id,
                        DailySearchUsage.search_date == today
                    )
                )
                user_records = result.scalars().all()
                
                if user_records:
                    # Sum up user records and merge with guest count (capped at daily limit)
                    total_user_count = sum(u.search_count for u in user_records)
                    combined_count = min(
                        total_user_count + total_guest_count,
                        FREE_REGISTERED_USER_DAILY_LIMIT
                    )
                    
                    # Update first user record with combined count
                    first_user_record = user_records[0]
                    first_user_record.search_count = combined_count
                    
                    # Delete other user records
                    for record in user_records[1:]:
                        await db.delete(record)
                    
                    logger.info(
                        f"[Session Migration] Merged guest ({total_guest_count}) + user ({total_user_count}) = {combined_count}"
                    )
                else:
                    # Move all guest usage to first record and update it to user
                    first_guest_record = guest_records[0]
                    first_guest_record.user_id = user_id
                    first_guest_record.session_id = None
                    first_guest_record.search_count = total_guest_count
                    
                    logger.info(f"[Session Migration] Transferred guest usage ({total_guest_count}) to user {user_id}")
                
                # Delete all other guest records
                for record in guest_records[1:]:
                    await db.delete(record)
            
            await db.commit()
            return True
        
        except Exception as e:
            logger.error(f"[Session Migration] ERROR: {str(e)}", exc_info=True)
            await db.rollback()
            return False

    @staticmethod
    def get_result_limit(
        is_premium: bool = False,
        is_registered: bool = False
    ) -> int:
        """
        Get the maximum number of results to return based on user type.
        
        Args:
            is_premium: Whether user has premium/trial subscription
            is_registered: Whether user is registered
            
        Returns:
            int: Max results to return (-1 = unlimited)
        """
        if is_premium:
            return PREMIUM_USER_RESULT_LIMIT  # -1 (unlimited)
        elif is_registered:
            return FREE_REGISTERED_USER_RESULT_LIMIT  # 10
        else:
            return GUEST_USER_RESULT_LIMIT  # 10
