"""Email service for sending templated emails."""

import logging
from typing import List, Optional, Dict, Any
from jinja2 import Template, Environment
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType, NameEmail
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.models.email_template import EmailTemplate
from app.utils.error_logger import log_error

logger = logging.getLogger(__name__)

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=settings.USE_CREDENTIALS,
    VALIDATE_CERTS=settings.VALIDATE_CERTS,
    TEMPLATE_FOLDER="app/templates/email",  # Optional: for file-based templates
)

# Initialize FastMail
fm = FastMail(conf)

# Jinja2 environment for template rendering (for database templates)
jinja_env = Environment(
    autoescape=True
)


async def get_template_from_db(
    db: AsyncSession,
    template_name: str
) -> Optional[EmailTemplate]:
    """Get email template from database."""
    try:
        result = await db.execute(
            select(EmailTemplate).where(
                EmailTemplate.name == template_name,
                EmailTemplate.is_active == True
            )
        )
        return result.scalars().first()
    except Exception as e:
        logger.error(f"Error fetching template {template_name}: {e}")
        return None


def render_template(template_content: str, context: Dict[str, Any]) -> str:
    """Render Jinja2 template with context."""
    try:
        template = Template(template_content)
        return template.render(**context)
    except Exception as e:
        logger.error(f"Error rendering template: {e}")
        raise


async def send_email(
    recipients: List[str],
    subject: str,
    body_html: str,
    body_text: Optional[str] = None,
    recipients_with_names: Optional[List[NameEmail]] = None
) -> bool:
    """
    Send email using FastMail.
    
    Args:
        recipients: List of email addresses
        subject: Email subject
        body_html: HTML email body
        body_text: Plain text email body (optional)
        recipients_with_names: List of NameEmail objects for "Name <email>" format
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Use NameEmail format if provided, otherwise use plain email strings
        if recipients_with_names:
            recipient_list = recipients_with_names
        else:
            # Use email strings directly - MessageSchema accepts both strings and NameEmail objects
            recipient_list = recipients
        
        message = MessageSchema(
            subject=subject,
            recipients=recipient_list,
            body=body_html,
            subtype=MessageType.html,
            body_text=body_text
        )
        
        await fm.send_message(message)
        logger.info(f"Email sent successfully to {len(recipients)} recipient(s)")
        return True
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False


async def send_templated_email(
    db: AsyncSession,
    template_name: str,
    recipients: List[str],
    context: Dict[str, Any],
    recipients_with_names: Optional[List[NameEmail]] = None
) -> bool:
    """
    Send email using a template from the database.
    
    Args:
        db: Database session
        template_name: Name of the template (e.g., 'payment_success')
        recipients: List of email addresses
        context: Dictionary of variables to pass to the template
        recipients_with_names: List of NameEmail objects for "Name <email>" format
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Get template from database
        template = await get_template_from_db(db, template_name)
        
        if not template:
            logger.error(f"Template '{template_name}' not found or inactive")
            return False
        
        # Render template with context
        rendered_html = render_template(template.body_html, context)
        rendered_text = None
        if template.body_text:
            rendered_text = render_template(template.body_text, context)
        
        # Render subject with context (in case it has variables)
        rendered_subject = render_template(template.subject, context)
        
        # Send email
        return await send_email(
            recipients=recipients,
            subject=rendered_subject,
            body_html=rendered_html,
            body_text=rendered_text,
            recipients_with_names=recipients_with_names
        )
    except Exception as e:
        logger.error(f"Error sending templated email: {e}")
        return False

