"""Babywise Prelaunch routes."""

import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from fastapi import APIRouter, HTTPException, status, Depends, Header, Query

from app.database import get_db
from app.models.babywise_prelaunch import BabywisePrelaunch
from app.schemas.babywise_prelaunch import (
    BabywisePrelaunchCreate,
    BabywisePrelaunchResponse,
    BabywisePrelaunchList
)
from app.utils.error_logger import log_error
from app.api.dependencies import get_current_user
from app.models.user import Profile

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/babywise", tags=["babywise"])


@router.post(
    "/prelaunch",
    response_model=BabywisePrelaunchResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"description": "Validation error"},
        500: {"description": "Internal server error"}
    }
)
async def submit_babywise_prelaunch(
    prelaunch_data: BabywisePrelaunchCreate,
    user_agent: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit a babywise prelaunch signup.
    
    Args:
        prelaunch_data: Prelaunch signup data (email, user_agent)
        user_agent: User agent from request headers
        db: Database session
    
    Returns:
        BabywisePrelaunchResponse: Confirmation with prelaunch signup details
    
    Raises:
        HTTPException: If validation fails or database error occurs
    
    Example:
        POST /api/v1/babywise/prelaunch
        {
            "email": "user@example.com",
            "user_agent": "Mozilla/5.0..."
        }
    """
    try:
        # Validate input
        if not prelaunch_data.email or not prelaunch_data.email.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email cannot be empty"
            )
        
        # Use provided user_agent or get from headers
        agent = prelaunch_data.user_agent or user_agent or "Unknown"
        
        # Create prelaunch record
        prelaunch = BabywisePrelaunch(
            email=prelaunch_data.email.strip().lower(),
            user_agent=agent
        )
        
        db.add(prelaunch)
        await db.commit()
        await db.refresh(prelaunch)
        
        logger.info(f"Babywise prelaunch signup: {prelaunch.id} from {prelaunch.email}")
        
        return BabywisePrelaunchResponse.from_orm(prelaunch)
        
    except HTTPException:
        raise
    except Exception as e:
        await log_error(
            db=db,
            function_name="submit_babywise_prelaunch",
            error=e,
            error_type="babywise_prelaunch_error",
            user_id=None,
            query_context=f"Submitting babywise prelaunch from {prelaunch_data.email}"
        )
        logger.error(f"Error submitting babywise prelaunch: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit prelaunch signup"
        )


@router.get(
    "/prelaunch/list",
    response_model=BabywisePrelaunchList,
    status_code=status.HTTP_200_OK,
    responses={
        401: {"description": "Not authenticated"},
        403: {"description": "Not authorized"},
        500: {"description": "Internal server error"}
    }
)
async def get_babywise_prelaunch_list(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of items to return"),
    current_user: Optional[Profile] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of babywise prelaunch signups (admin only).
    
    Args:
        skip: Number of items to skip for pagination
        limit: Number of items to return
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        BabywisePrelaunchList: List of prelaunch signups with total count
    
    Raises:
        HTTPException: If not authenticated or not admin
    """
    try:
        # Check admin access
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        if current_user.access_level != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this resource"
            )
        
        # Get total count
        count_query = select(BabywisePrelaunch)
        total_result = await db.execute(count_query)
        total = len(total_result.scalars().all())
        
        # Get paginated results
        query = select(BabywisePrelaunch).order_by(
            desc(BabywisePrelaunch.created_at)
        ).offset(skip).limit(limit)
        
        result = await db.execute(query)
        prelaunch_items = result.scalars().all()
        
        logger.info(f"Retrieved {len(prelaunch_items)} babywise prelaunch signups for admin {current_user.id}")
        
        return BabywisePrelaunchList(
            total=total,
            items=[BabywisePrelaunchResponse.from_orm(item) for item in prelaunch_items]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        await log_error(
            db=db,
            function_name="get_babywise_prelaunch_list",
            error=e,
            error_type="babywise_prelaunch_list_error",
            user_id=str(current_user.id) if current_user else None,
            query_context=f"Getting prelaunch list with skip={skip}, limit={limit}"
        )
        logger.error(f"Error retrieving babywise prelaunch list: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve prelaunch signups"
        )


@router.get(
    "/prelaunch/stats",
    status_code=status.HTTP_200_OK,
    responses={
        401: {"description": "Not authenticated"},
        403: {"description": "Not authorized"},
        500: {"description": "Internal server error"}
    }
)
async def get_babywise_prelaunch_stats(
    current_user: Optional[Profile] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get statistics about babywise prelaunch signups (admin only).
    
    Args:
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        dict: Statistics including total count
    
    Raises:
        HTTPException: If not authenticated or not admin
    """
    try:
        # Check admin access
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )
        
        if current_user.access_level != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this resource"
            )
        
        # Get total count
        query = select(BabywisePrelaunch)
        result = await db.execute(query)
        total = len(result.scalars().all())
        
        logger.info(f"Retrieved babywise prelaunch stats for admin {current_user.id}: total={total}")
        
        return {
            "total_signups": total,
            "status": "success"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await log_error(
            db=db,
            function_name="get_babywise_prelaunch_stats",
            error=e,
            error_type="babywise_prelaunch_stats_error",
            user_id=str(current_user.id) if current_user else None,
            query_context="Getting prelaunch stats"
        )
        logger.error(f"Error retrieving babywise prelaunch stats: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve prelaunch stats"
        )
