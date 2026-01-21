"""Blog schemas for API validation."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from uuid import UUID


class BlogAttachmentResponse(BaseModel):
    """Response model for blog attachments."""
    id: UUID
    file_name: str
    file_type: str
    file_size: int
    s3_url: str
    created_at: datetime

    class Config:
        from_attributes = True


class BlogCreate(BaseModel):
    """Schema for creating a blog post."""
    title: str = Field(..., min_length=1, max_length=500)
    excerpt: Optional[str] = Field(None, max_length=1000)
    content: str = Field(..., min_length=1)
    category: Optional[str] = Field(None, max_length=100)
    read_time: Optional[int] = Field(None, ge=1)
    tags: Optional[List[str]] = None
    published: Optional[bool] = False


class BlogUpdate(BaseModel):
    """Schema for updating a blog post."""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    excerpt: Optional[str] = Field(None, max_length=1000)
    content: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = Field(None, max_length=100)
    read_time: Optional[int] = Field(None, ge=1)
    tags: Optional[List[str]] = None
    published: Optional[bool] = None
    featured_image: Optional[str] = None
    featured_video: Optional[str] = None


class BlogResponse(BaseModel):
    """Response model for blog posts."""
    id: UUID
    user_id: UUID
    title: str
    slug: Optional[str] = None
    excerpt: Optional[str]
    content: str
    category: Optional[str]
    featured_image: Optional[str]
    featured_video: Optional[str]
    read_time: Optional[int]
    tags: Optional[List[str]]
    published: bool
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]
    attachments: Optional[List[BlogAttachmentResponse]] = None

    class Config:
        from_attributes = True


class BlogListResponse(BaseModel):
    """List response model for blog posts."""
    id: UUID
    title: str
    slug: Optional[str] = None
    excerpt: Optional[str]
    category: Optional[str]
    featured_image: Optional[str]
    read_time: Optional[int]
    published: bool
    created_at: datetime
    published_at: Optional[datetime]

    class Config:
        from_attributes = True


class BlogDeleteResponse(BaseModel):
    """Response model for blog deletion."""
    message: str
    blog_id: UUID


class BlogUploadResponse(BaseModel):
    """Response model for file uploads."""
    file_name: str
    file_type: str
    file_size: int
    cloudfront_url: Optional[str] = None
    s3_url: str
    s3_key: str
