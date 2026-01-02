"""Error logging utility for storing errors in the database."""
import logging
import traceback
from typing import Optional, Any, Dict
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert

from app.models.analytics import ErrorLog

logger = logging.getLogger(__name__)


async def log_error(
    db: AsyncSession,
    function_name: str,
    error: Exception,
    error_type: str = "exception",
    query_context: Optional[str] = None,
    user_id: Optional[UUID] = None,
    error_details: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Log an error to the error_logs table.
    
    Args:
        db: AsyncSession database session
        function_name: Name of the function where error occurred
        error: The exception that was raised
        error_type: Type of error (e.g., "exception", "validation_error", "auth_error")
        query_context: Optional context about the query or request
        user_id: Optional user ID associated with the error
        error_details: Optional dictionary with additional error details
    
    Returns:
        bool: True if logged successfully, False otherwise
    
    Example:
        try:
            some_operation()
        except Exception as e:
            await log_error(
                db=session,
                function_name="sign_up",
                error=e,
                error_type="auth_error",
                user_id=user_id,
                query_context=f"Email: {email}"
            )
    """
    try:
        error_message = str(error)
        
        # Build error details with traceback
        details = error_details or {}
        details["traceback"] = traceback.format_exc()
        details["error_class"] = error.__class__.__name__
        
        # Create error log record
        stmt = insert(ErrorLog).values(
            function_name=function_name,
            error_type=error_type,
            error_message=error_message,
            error_details=details,
            query_context=query_context,
            user_id=user_id
        )
        
        await db.execute(stmt)
        await db.commit()
        
        logger.debug(
            f"Error logged: {function_name} | Type: {error_type} | Message: {error_message}"
        )
        return True
        
    except Exception as log_error_exception:
        await log_error(
            db=db,
            function_name="log_error",
            error=log_error_exception,
            error_type="exception"
        )
        # Log the error logging failure but don't crash the application
        logger.error(
            f"Failed to log error: {str(log_error_exception)}", 
            exc_info=True
        )
        return False
