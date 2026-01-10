"""Babywise Prelaunch schemas."""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from uuid import UUID


class BabywisePrelaunchCreate(BaseModel):
    """Schema for creating a new babywise prelaunch signup."""
    email: EmailStr
    user_agent: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        }


class BabywisePrelaunchResponse(BaseModel):
    """Schema for babywise prelaunch signup response."""
    id: UUID
    email: str
    user_agent: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BabywisePrelaunchList(BaseModel):
    """Schema for listing babywise prelaunch signups."""
    total: int
    items: list[BabywisePrelaunchResponse]

    class Config:
        from_attributes = True
