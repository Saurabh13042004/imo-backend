"""Contact form routes."""

import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, status, Depends

from app.database import get_db
from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactResponse
from app.utils.error_logger import log_error

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/contact", tags=["contact"])


@router.post(
    "/submit",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"description": "Validation error"},
        500: {"description": "Internal server error"}
    }
)
async def submit_contact_form(
    contact_data: ContactCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Submit a contact form message.
    
    Args:
        contact_data: Contact form data (name, email, subject, message)
        db: Database session
    
    Returns:
        ContactResponse: Confirmation with contact submission details
    
    Raises:
        HTTPException: If validation fails or database error occurs
    
    Example:
        POST /api/v1/contact/submit
        {
            "name": "John Doe",
            "email": "john@example.com",
            "subject": "Bug Report",
            "message": "I found a bug..."
        }
    """
    try:
        # Validate input
        if not contact_data.name or not contact_data.name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Name cannot be empty"
            )
        
        if not contact_data.message or not contact_data.message.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message cannot be empty"
            )
        
        if not contact_data.subject or not contact_data.subject.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Subject cannot be empty"
            )
        
        # Create contact record
        contact = Contact(
            name=contact_data.name.strip(),
            email=contact_data.email,
            subject=contact_data.subject.strip(),
            message=contact_data.message.strip()
        )
        
        db.add(contact)
        await db.commit()
        await db.refresh(contact)
        
        logger.info(f"Contact form submitted: {contact.id} from {contact.email}")
        
        return ContactResponse.from_orm(contact)
        
    except HTTPException:
        raise
    except Exception as e:
        await log_error(
            db=db,
            function_name="submit_contact_form",
            error=e,
            error_type="contact_submission_error",
            user_id=None,
            query_context=f"Submitting contact form from {contact_data.email} with subject '{contact_data.subject}'"
        )
        logger.error(f"Error submitting contact form: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit contact form"
        )


@router.get(
    "/submissions",
    response_model=list[ContactResponse],
    responses={
        401: {"description": "Unauthorized"},
        500: {"description": "Internal server error"}
    }
)
async def get_contact_submissions(
    db: AsyncSession = Depends(get_db)
):
    """
    Get all contact form submissions (admin only - can add authentication later).
    
    Args:
        db: Database session
    
    Returns:
        list[ContactResponse]: List of all contact submissions
    
    Note: This endpoint should be protected with admin authentication in production
    """
    try:
        # TODO: Add admin authentication check
        from sqlalchemy import select
        
        result = await db.execute(select(Contact).order_by(Contact.created_at.desc()))
        contacts = result.scalars().all()
        
        return [ContactResponse.from_orm(contact) for contact in contacts]
        
    except Exception as e:
        await log_error(
            db=db,
            function_name="get_contact_submissions",
            error=e,
            error_type="contact_fetch_error",
            user_id=None,
            query_context="Fetching all contact form submissions"
        )
        logger.error(f"Error fetching contact submissions: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch contact submissions"
        )
