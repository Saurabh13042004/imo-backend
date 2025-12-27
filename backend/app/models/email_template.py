"""Email template model."""

from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.models import Base


class EmailTemplate(Base):
    """Email template database model."""

    __tablename__ = "email_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)  # e.g., 'payment_success', 'payment_cancelled', 'new_user_onboarding'
    subject = Column(String(500), nullable=False)
    body_html = Column(Text, nullable=False)  # Jinja2 template
    body_text = Column(Text, nullable=True)  # Plain text version (optional)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<EmailTemplate(id={self.id}, name={self.name})>"

