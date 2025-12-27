"""Admin email template and sending routes."""

import logging
from typing import List, Optional, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import Profile
from app.models.email_template import EmailTemplate
from app.api.dependencies import get_db, get_current_user
from app.services.mail_service import send_templated_email, send_email, get_template_from_db, render_template
from fastapi_mail import NameEmail

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin/email", tags=["admin-email"])


# ==================== Authentication & Authorization ====================

async def admin_required(
    current_user: Optional[Profile] = Depends(get_current_user),
) -> Profile:
    """Dependency to ensure user is admin."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    if current_user.access_level != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access admin endpoints"
        )
    return current_user


# ==================== Schemas ====================

class EmailTemplateCreate(BaseModel):
    """Schema for creating an email template."""
    name: str = Field(..., description="Template name (e.g., 'payment_success')")
    subject: str = Field(..., description="Email subject (supports Jinja2 variables)")
    body_html: str = Field(..., description="HTML email body (Jinja2 template)")
    body_text: Optional[str] = Field(None, description="Plain text email body (optional)")
    description: Optional[str] = Field(None, description="Template description")
    is_active: bool = Field(True, description="Whether template is active")


class EmailTemplateUpdate(BaseModel):
    """Schema for updating an email template."""
    subject: Optional[str] = None
    body_html: Optional[str] = None
    body_text: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class EmailTemplateResponse(BaseModel):
    """Schema for email template response."""
    id: str
    name: str
    subject: str
    body_html: str
    body_text: Optional[str]
    description: Optional[str]
    is_active: bool
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class SendEmailRequest(BaseModel):
    """Schema for sending an email."""
    template_name: Optional[str] = Field(None, description="Template name to use (if using template)")
    recipients: List[EmailStr] = Field(..., description="List of recipient email addresses")
    subject: Optional[str] = Field(None, description="Email subject (required if not using template)")
    body_html: Optional[str] = Field(None, description="HTML body (required if not using template)")
    body_text: Optional[str] = Field(None, description="Plain text body (optional)")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Template context variables")
    recipients_with_names: Optional[List[Dict[str, str]]] = Field(
        None,
        description="List of recipients with names: [{'name': 'John Doe', 'email': 'john@example.com'}]"
    )


class SendEmailResponse(BaseModel):
    """Schema for send email response."""
    success: bool
    message: str
    recipients_count: int


# ==================== Template Management Routes ====================

@router.post("/templates", response_model=EmailTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    template_data: EmailTemplateCreate,
    db: AsyncSession = Depends(get_db),
    admin: Profile = Depends(admin_required),
):
    """Create a new email template."""
    try:
        # Check if template with same name already exists
        existing = await db.execute(
            select(EmailTemplate).where(EmailTemplate.name == template_data.name)
        )
        if existing.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Template with name '{template_data.name}' already exists"
            )
        
        # Create new template
        template = EmailTemplate(
            name=template_data.name,
            subject=template_data.subject,
            body_html=template_data.body_html,
            body_text=template_data.body_text,
            description=template_data.description,
            is_active=template_data.is_active,
        )
        
        db.add(template)
        await db.commit()
        await db.refresh(template)
        
        logger.info(f"Admin {admin.id} created email template: {template_data.name}")
        
        return EmailTemplateResponse(
            id=str(template.id),
            name=template.name,
            subject=template.subject,
            body_html=template.body_html,
            body_text=template.body_text,
            description=template.description,
            is_active=template.is_active,
            created_at=template.created_at.isoformat(),
            updated_at=template.updated_at.isoformat(),
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create template"
        )


@router.get("/templates", response_model=List[EmailTemplateResponse])
async def list_templates(
    db: AsyncSession = Depends(get_db),
    admin: Profile = Depends(admin_required),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    active_only: bool = Query(False, description="Filter to active templates only"),
):
    """List all email templates."""
    try:
        query = select(EmailTemplate)
        
        if active_only:
            query = query.where(EmailTemplate.is_active == True)
        
        result = await db.execute(
            query.order_by(EmailTemplate.name).offset(skip).limit(limit)
        )
        templates = result.scalars().all()
        
        return [
            EmailTemplateResponse(
                id=str(t.id),
                name=t.name,
                subject=t.subject,
                body_html=t.body_html,
                body_text=t.body_text,
                description=t.description,
                is_active=t.is_active,
                created_at=t.created_at.isoformat(),
                updated_at=t.updated_at.isoformat(),
            )
            for t in templates
        ]
    except Exception as e:
        logger.error(f"Error listing templates: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list templates"
        )


@router.get("/templates/{template_id}", response_model=EmailTemplateResponse)
async def get_template(
    template_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: Profile = Depends(admin_required),
):
    """Get a specific email template."""
    try:
        result = await db.execute(
            select(EmailTemplate).where(EmailTemplate.id == template_id)
        )
        template = result.scalars().first()
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        return EmailTemplateResponse(
            id=str(template.id),
            name=template.name,
            subject=template.subject,
            body_html=template.body_html,
            body_text=template.body_text,
            description=template.description,
            is_active=template.is_active,
            created_at=template.created_at.isoformat(),
            updated_at=template.updated_at.isoformat(),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get template"
        )


@router.get("/templates/name/{template_name}", response_model=EmailTemplateResponse)
async def get_template_by_name(
    template_name: str,
    db: AsyncSession = Depends(get_db),
    admin: Profile = Depends(admin_required),
):
    """Get a template by name."""
    try:
        template = await get_template_from_db(db, template_name)
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template '{template_name}' not found"
            )
        
        return EmailTemplateResponse(
            id=str(template.id),
            name=template.name,
            subject=template.subject,
            body_html=template.body_html,
            body_text=template.body_text,
            description=template.description,
            is_active=template.is_active,
            created_at=template.created_at.isoformat(),
            updated_at=template.updated_at.isoformat(),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting template by name: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get template"
        )


@router.put("/templates/{template_id}", response_model=EmailTemplateResponse)
async def update_template(
    template_id: UUID,
    template_data: EmailTemplateUpdate,
    db: AsyncSession = Depends(get_db),
    admin: Profile = Depends(admin_required),
):
    """Update an email template."""
    try:
        result = await db.execute(
            select(EmailTemplate).where(EmailTemplate.id == template_id)
        )
        template = result.scalars().first()
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        # Update fields
        if template_data.subject is not None:
            template.subject = template_data.subject
        if template_data.body_html is not None:
            template.body_html = template_data.body_html
        if template_data.body_text is not None:
            template.body_text = template_data.body_text
        if template_data.description is not None:
            template.description = template_data.description
        if template_data.is_active is not None:
            template.is_active = template_data.is_active
        
        await db.commit()
        await db.refresh(template)
        
        logger.info(f"Admin {admin.id} updated email template: {template.name}")
        
        return EmailTemplateResponse(
            id=str(template.id),
            name=template.name,
            subject=template.subject,
            body_html=template.body_html,
            body_text=template.body_text,
            description=template.description,
            is_active=template.is_active,
            created_at=template.created_at.isoformat(),
            updated_at=template.updated_at.isoformat(),
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update template"
        )


@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: UUID,
    db: AsyncSession = Depends(get_db),
    admin: Profile = Depends(admin_required),
):
    """Delete an email template."""
    try:
        result = await db.execute(
            select(EmailTemplate).where(EmailTemplate.id == template_id)
        )
        template = result.scalars().first()
        
        if not template:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        await db.delete(template)
        await db.commit()
        
        logger.info(f"Admin {admin.id} deleted email template: {template.name}")
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete template"
        )


# ==================== Email Sending Routes ====================

@router.post("/send", response_model=SendEmailResponse)
async def send_email_endpoint(
    email_data: SendEmailRequest,
    db: AsyncSession = Depends(get_db),
    admin: Profile = Depends(admin_required),
):
    """Send an email (with or without template)."""
    try:
        # Prepare recipients with names if provided
        recipients_with_names = None
        if email_data.recipients_with_names:
            recipients_with_names = [
                NameEmail(name=r["name"], email=r["email"])
                for r in email_data.recipients_with_names
            ]
        
        # If using template
        if email_data.template_name:
            success = await send_templated_email(
                db=db,
                template_name=email_data.template_name,
                recipients=email_data.recipients,
                context=email_data.context or {},
                recipients_with_names=recipients_with_names
            )
            
            if success:
                logger.info(f"Admin {admin.id} sent templated email '{email_data.template_name}' to {len(email_data.recipients)} recipients")
                return SendEmailResponse(
                    success=True,
                    message=f"Email sent successfully using template '{email_data.template_name}'",
                    recipients_count=len(email_data.recipients)
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to send email"
                )
        
        # If sending without template
        else:
            if not email_data.subject or not email_data.body_html:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Subject and body_html are required when not using a template"
                )
            
            success = await send_email(
                recipients=email_data.recipients,
                subject=email_data.subject,
                body_html=email_data.body_html,
                body_text=email_data.body_text,
                recipients_with_names=recipients_with_names
            )
            
            if success:
                logger.info(f"Admin {admin.id} sent custom email to {len(email_data.recipients)} recipients")
                return SendEmailResponse(
                    success=True,
                    message="Email sent successfully",
                    recipients_count=len(email_data.recipients)
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to send email"
                )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )


@router.post("/send/test/{template_name}", response_model=SendEmailResponse)
async def send_test_email(
    template_name: str,
    test_email: EmailStr = Body(..., embed=True, description="Test email address"),
    context: Dict[str, Any] = Body(default_factory=dict, embed=True, description="Template context variables"),
    db: AsyncSession = Depends(get_db),
    admin: Profile = Depends(admin_required),
):
    """Send a test email using a template."""
    try:
        success = await send_templated_email(
            db=db,
            template_name=template_name,
            recipients=[test_email],
            context=context
        )
        
        if success:
            logger.info(f"Admin {admin.id} sent test email using template '{template_name}' to {test_email}")
            return SendEmailResponse(
                success=True,
                message=f"Test email sent successfully using template '{template_name}'",
                recipients_count=1
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send test email"
            )
    except Exception as e:
        logger.error(f"Error sending test email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send test email: {str(e)}"
        )

