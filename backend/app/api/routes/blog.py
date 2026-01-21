"""Blog management API routes."""

import logging
import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import Profile
from app.models.blog import Blog
from app.schemas.blog import (
    BlogCreate, BlogUpdate, BlogResponse, BlogListResponse, 
    BlogDeleteResponse, BlogUploadResponse
)
from app.api.dependencies import get_db, get_current_user
from app.services.blog_service import BlogService
from app.services.s3_service import S3Service
from app.utils.error_logger import log_error

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/blogs", tags=["blogs"])

# Max file size: 50MB
MAX_FILE_SIZE = 50 * 1024 * 1024
ALLOWED_MIME_TYPES = {
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'video/mp4', 'video/webm'
}

s3_service = S3Service()


def _is_admin(user: Profile) -> bool:
    """Check if user is admin."""
    return user.subscription_tier == "admin" or user.access_level == "admin"


async def admin_required(
    current_user: Optional[Profile] = Depends(get_current_user),
) -> Profile:
    """Dependency to ensure user is admin."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    if not _is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can manage blogs"
        )
    return current_user


@router.post("/", response_model=BlogResponse, status_code=status.HTTP_201_CREATED)
async def create_blog(
    blog_data: BlogCreate,
    db: AsyncSession = Depends(get_db),
    admin: Profile = Depends(admin_required)
):
    """Create a new blog post."""
    try:
        blog = await BlogService.create_blog(db, admin.id, blog_data)
        await db.commit()
        
        # Refetch to ensure relationships are properly loaded
        blog = await BlogService.get_blog(db, blog.id)
        return blog
    except Exception as e:
        await db.rollback()
        log_error(f"Error creating blog: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create blog"
        )


@router.get("/{blog_slug}", response_model=BlogResponse)
async def get_blog(
    blog_slug: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a blog post by slug (public)."""
    try:
        blog = await BlogService.get_blog_by_slug(db, blog_slug)
        if not blog:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Blog not found"
            )
        return blog
    except Exception as e:
        log_error(f"Error fetching blog: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch blog"
        )


@router.get("/admin/list/all", response_model=dict)
async def list_admin_blogs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    admin: Profile = Depends(admin_required)
):
    """List all blogs for admin."""
    try:
        blogs, total = await BlogService.get_user_blogs(db, admin.id, skip, limit)
        # Convert ORM objects to Pydantic schemas
        blogs_data = [BlogResponse.model_validate(blog) for blog in blogs]
        return {
            "blogs": blogs_data,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        logger.error(f"Error listing blogs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list blogs"
        )


@router.get("/public/list", response_model=dict)
async def list_published_blogs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """List published blogs."""
    try:
        blogs, total = await BlogService.get_all_published_blogs(
            db, skip, limit, category
        )
        # Convert ORM objects to Pydantic schemas
        blogs_data = [BlogResponse.model_validate(blog) for blog in blogs]
        return {
            "blogs": blogs_data,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        log_error(f"Error listing published blogs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list blogs"
        )


@router.put("/{blog_id}", response_model=BlogResponse)
async def update_blog(
    blog_id: str,
    blog_data: BlogUpdate,
    db: AsyncSession = Depends(get_db),
    admin: Profile = Depends(admin_required)
):
    """Update a blog post."""
    try:
        # Check if blog exists and belongs to admin
        blog = await BlogService.get_blog(db, blog_id)
        if not blog:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Blog not found"
            )
        if blog.user_id != admin.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this blog"
            )
        
        updated_blog = await BlogService.update_blog(db, blog_id, blog_data)
        await db.commit()
        
        # Refetch to ensure relationships are properly loaded
        updated_blog = await BlogService.get_blog(db, blog_id)
        return updated_blog
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        log_error(f"Error updating blog: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update blog"
        )


@router.delete("/{blog_id}", response_model=BlogDeleteResponse)
async def delete_blog(
    blog_id: str,
    db: AsyncSession = Depends(get_db),
    admin: Profile = Depends(admin_required)
):
    """Delete a blog post."""
    try:
        # Check if blog exists and belongs to admin
        blog = await BlogService.get_blog(db, blog_id)
        if not blog:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Blog not found"
            )
        if blog.user_id != admin.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this blog"
            )
        
        # Delete S3 folder with attachments
        await s3_service.delete_blog_folder(str(blog_id))
        
        # Delete blog from database
        success = await BlogService.delete_blog(db, blog_id)
        await db.commit()
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Blog not found"
            )
        
        return {
            "message": "Blog deleted successfully",
            "blog_id": blog_id
        }
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        log_error(f"Error deleting blog: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete blog"
        )


@router.post("/{blog_id}/upload", response_model=BlogUploadResponse)
async def upload_blog_attachment(
    blog_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    admin: Profile = Depends(admin_required)
):
    """Upload an attachment for a blog post."""
    try:
        # Verify blog exists and belongs to admin
        blog = await BlogService.get_blog(db, blog_id)
        if not blog:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Blog not found"
            )
        if blog.user_id != admin.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to upload to this blog"
            )
        
        # Validate file type
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_MIME_TYPES)}"
            )
        
        # Read file content
        file_content = await file.read()
        
        # Validate file size
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_PAYLOAD_TOO_LARGE,
                detail=f"File size exceeds maximum of {MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        # Upload to S3
        s3_response = await s3_service.upload_blog_attachment(
            file_content=file_content,
            file_name=file.filename,
            file_type=file.content_type,
            blog_id=str(blog_id),
            user_id=str(admin.id)
        )
        
        # Save attachment record to database
        await BlogService.add_attachment(
            db,
            blog_id,
            file.filename,
            file.content_type,
            len(file_content),
            s3_response.get('cloudfront_url', s3_response['s3_url']),
            s3_response['s3_key']
        )
        
        await db.commit()
        
        return {
            "file_name": file.filename,
            "file_type": file.content_type,
            "file_size": len(file_content),
            "cloudfront_url": s3_response.get('cloudfront_url'),
            "s3_url": s3_response['s3_url'],
            "s3_key": s3_response['s3_key']
        }
    
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error uploading attachment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload file"
        )
