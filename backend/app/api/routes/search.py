"""Search routes."""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas import SearchRequest, SearchResponse, ErrorResponse
from app.services import SearchService
from app.services.search_limit_service import SearchLimitService
from app.api.dependencies import get_db, get_optional_user
from app.models.user import Profile
from app.utils.error_logger import log_error
from app.config import settings
from app.utils.validators import validate_search_query

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["search"])

search_service = SearchService()
search_limit_service = SearchLimitService()


@router.post(
    "/search",
    response_model=SearchResponse,
    responses={400: {"model": ErrorResponse}, 403: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def search_products(
    request: SearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[Profile] = Depends(get_optional_user),
    x_session_id: Optional[str] = Header(None)
):
    """
    Search for products globally with geo-targeting.

    **Parameters:**
    - **keyword**: Search keyword (required, 2-200 characters)
    - **country**: Country for search results (default: "United States")
    - **city**: Optional city for narrower location targeting
    - **language**: Language code for search interface (default: "en")
    - **zipcode**: Legacy field, not used for SerpAPI geo-targeting
    - **x_session_id**: (Header) Session ID for guest tracking
    
    **Search Limits:**
    - Guest users (no account): 3 free searches total
    - Free registered users: 5 searches per day
    - Premium/Trial users: Unlimited searches
    
    **Error Codes:**
    - 400: Invalid search query
    - 403: Search limit exceeded
    - 500: Internal server error
    """
    try:
        # Step 1: Validate search query
        if not validate_search_query(request.keyword):
            logger.warning(f"[Search] Invalid keyword: {request.keyword}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid search keyword. Must be 2-200 characters."
            )

        # Prepare user identification
        user_id = str(current_user.id) if current_user else None
        session_id = x_session_id or None
        user_type = "registered" if user_id else "guest"
        
        logger.info(
            f"[Search] {'='*70}\n"
            f"  User Type: {user_type}\n"
            f"  User ID: {user_id or 'None'}\n"
            f"  Session ID: {session_id or 'None'}\n"
            f"  Keyword: {request.keyword}\n"
            f"  Country: {request.country}\n"
            f"  City: {request.city}\n"
            f"  Store: {request.store or 'All Stores'}"
        )

        # Step 2: Check search access BEFORE performing the search
        has_access, remaining, message = await search_limit_service.check_search_access(
            db=db,
            user_id=user_id,
            session_id=session_id
        )

        if not has_access:
            logger.warning(f"[Search] Access DENIED - {message}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=message
            )

        logger.info(f"[Search] Access GRANTED - {message}")

        # Step 3: Perform the search
        logger.info(f"[Search] Executing search for keyword: {request.keyword}")
        results, total_count = await search_service.search_all_sources(db, request)
        logger.info(f"[Search] Search completed - {total_count} results found")

        # Step 4: Increment search count AFTER successful search
        increment_success = await search_limit_service.increment_search_count(
            db=db,
            user_id=user_id,
            session_id=session_id
        )
        
        if not increment_success:
            logger.error("[Search] Failed to increment search count (non-fatal)")
            # Don't fail the search because of a count increment error
        else:
            logger.info(f"[Search] Search count incremented for {user_type}")

        # Step 5: Determine result limit based on user type
        is_premium = user_id and remaining == -1  # -1 = unlimited (premium)
        result_limit = search_limit_service.get_result_limit(
            is_premium=is_premium,
            is_registered=user_id is not None
        )

        # Step 6: Apply result limit if needed
        if result_limit > 0 and len(results) > result_limit:
            logger.info(f"[Search] Limiting results from {len(results)} to {result_limit}")
            results = results[:result_limit]
            total_count = min(total_count, result_limit)

        # Step 7: Calculate remaining searches for next request
        new_remaining = remaining - 1 if remaining > 0 else remaining

        logger.info(
            f"[Search] Response ready\n"
            f"  Results: {total_count}\n"
            f"  Remaining: {new_remaining}\n"
            f"  Message: {message}"
        )

        return SearchResponse(
            success=True,
            keyword=request.keyword,
            zipcode=request.zipcode,
            country=request.country,
            city=request.city,
            language=request.language,
            store=request.store,
            total_results=total_count,
            results=results,
            remaining_searches=new_remaining if new_remaining >= 0 else None,
            search_limit_message=message if remaining > 0 else None
        )

    except HTTPException:
        # Re-raise HTTP exceptions (validation errors, limit errors, etc.)
        raise
    except Exception as e:
        await log_error(
            db=db,
            function_name="search_products",
            error=e,
            error_type="search_error",
            user_id=str(current_user.id) if current_user else None,
            query_context=f"Keyword: {request.keyword}, Country: {request.country}"
        )
        logger.error(f"[Search] UNEXPECTED ERROR: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Search failed. Please try again later."
        )


@router.get("/search/limits")
async def get_search_limits(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[Profile] = Depends(get_optional_user),
    x_session_id: Optional[str] = Header(None)
):
    """
    Get current search limits and remaining searches for the user.
    
    **Query Parameters:**
    - **x_session_id**: (Header) Session ID for guest tracking
    
    Returns information about:
    - Whether user has search access
    - Remaining searches (or None if unlimited)
    - Whether user has unlimited access
    - User type (premium, registered, guest)
    - Daily limit for their tier
    """
    try:
        user_id = str(current_user.id) if current_user else None
        session_id = x_session_id or None
        
        has_access, remaining, message = await search_limit_service.check_search_access(
            db=db,
            user_id=user_id,
            session_id=session_id
        )

        # Determine user tier
        if remaining == -1:
            tier = "premium"
            daily_limit = None
        elif user_id:
            tier = "registered"
            daily_limit = 3
        else:
            tier = "guest"
            daily_limit = 1

        return {
            "has_access": has_access,
            "remaining_searches": remaining if remaining >= 0 else None,
            "is_unlimited": remaining == -1,
            "message": message,
            "user_type": tier,
            "daily_limit": daily_limit,
            "user_id": user_id,
            "session_id": session_id
        }

    except Exception as e:
        await log_error(
            db=db,
            function_name="get_search_limits",
            error=e,
            error_type="search_limits_error",
            user_id=str(current_user.id) if current_user else None,
            query_context="Get search limits"
        )
        logger.error(f"[Search Limits] ERROR: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get search limits"
        )
