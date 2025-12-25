"""Contact form schemas."""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from uuid import UUID


class ContactCreate(BaseModel):
    """Schema for creating a new contact submission."""
    name: str
    email: EmailStr
    subject: str
    message: str

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "subject": "Bug Report",
                "message": "I found a bug in the search feature..."
            }
        }


class ContactResponse(BaseModel):
    """Schema for contact submission response."""
    id: UUID
    name: str
    email: str
    subject: str
    message: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
