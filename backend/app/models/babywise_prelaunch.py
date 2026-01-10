"""Babywise Prelaunch model for storing prelaunch signups."""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.models import Base


class BabywisePrelaunch(Base):
    """Model for storing babywise prelaunch signups."""
    
    __tablename__ = "babywise_prelaunch"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False, index=True, unique=False)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<BabywisePrelaunch(id={self.id}, email={self.email}, created_at={self.created_at})>"
