"""Blog content management models."""
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models import Base


class Blog(Base):
    """Blog posts/articles."""
    __tablename__ = 'blogs'

    id = Column(PG_UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # Content fields
    title = Column(String(500), nullable=False, index=True)
    slug = Column(String(500), nullable=False, unique=True, index=True)  # SEO-friendly URL slug
    excerpt = Column(String(1000), nullable=True)
    content = Column(Text, nullable=False)  # Rich HTML content
    category = Column(String(100), nullable=True)  # Blog, Case Studies, News, Videos, Whitepapers
    
    # Media
    featured_image = Column(String, nullable=True)  # AWS S3 URL
    featured_video = Column(String, nullable=True)  # AWS S3 URL
    
    # Metadata (renamed from 'metadata' which is reserved in SQLAlchemy)
    meta = Column(JSON, nullable=True)  # Store additional metadata
    read_time = Column(Integer, nullable=True)  # In minutes
    tags = Column(JSON, nullable=True)  # Array of tags
    
    # Status
    published = Column(Boolean, default=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    author = relationship('Profile', backref='blogs')


class BlogAttachment(Base):
    """File attachments for blog posts."""
    __tablename__ = 'blog_attachments'
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    blog_id = Column(PG_UUID(as_uuid=True), ForeignKey('blogs.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # File info
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # e.g., 'image/jpeg', 'application/pdf'
    file_size = Column(Integer, nullable=False)  # In bytes
    
    # AWS S3 details
    s3_url = Column(String, nullable=False)
    s3_key = Column(String, nullable=False, unique=True)  # Full path in S3
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    blog = relationship('Blog', backref='attachments')
