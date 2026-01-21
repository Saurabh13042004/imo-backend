"""Blog management service."""
import logging
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload

from app.models.blog import Blog, BlogAttachment
from app.schemas.blog import BlogCreate, BlogUpdate
from app.utils.slug import generate_slug, generate_unique_slug

logger = logging.getLogger(__name__)


class BlogService:
    """Service for blog CRUD operations."""
    
    @staticmethod
    async def create_blog(
        db: AsyncSession,
        user_id: UUID,
        blog_data: BlogCreate
    ) -> Blog:
        """Create a new blog post."""
        # Generate slug from title
        base_slug = generate_slug(blog_data.title)
        
        # Check for existing slugs to ensure uniqueness
        existing_count = await db.execute(
            select(func.count()).select_from(Blog).where(Blog.slug.like(f"{base_slug}%"))
        )
        count = existing_count.scalar() or 0
        
        # Generate unique slug if needed
        slug = base_slug if count == 0 else f"{base_slug}-{count}"
        
        blog = Blog(
            user_id=user_id,
            title=blog_data.title,
            slug=slug,
            excerpt=blog_data.excerpt,
            content=blog_data.content,
            category=blog_data.category,
            read_time=blog_data.read_time,
            tags=blog_data.tags,
            published=blog_data.published,
            published_at=datetime.utcnow() if blog_data.published else None
        )
        
        db.add(blog)
        await db.flush()
        
        # Refresh with eager loading of relationships
        await db.refresh(blog, ['attachments'])
        
        logger.info(f"Blog created: {blog.id} ({blog.slug}) by user {user_id}")
        return blog
    
    @staticmethod
    async def get_blog(db: AsyncSession, blog_id: UUID) -> Optional[Blog]:
        """Get a blog post by ID."""
        stmt = select(Blog).where(Blog.id == blog_id).options(
            selectinload(Blog.attachments)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_blog_by_slug(db: AsyncSession, slug: str) -> Optional[Blog]:
        """Get a published blog post by slug."""
        stmt = select(Blog).where(
            (Blog.slug == slug) & (Blog.published == True)
        ).options(
            selectinload(Blog.attachments)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_user_blogs(
        db: AsyncSession,
        user_id: UUID,
        skip: int = 0,
        limit: int = 20,
        published_only: bool = False
    ) -> tuple[List[Blog], int]:
        """Get blogs for a specific user."""
        query = select(Blog).where(Blog.user_id == user_id)
        
        if published_only:
            query = query.where(Blog.published == True)
        
        # Get total count
        count_query = select(func.count()).select_from(Blog).where(Blog.user_id == user_id)
        if published_only:
            count_query = count_query.where(Blog.published == True)
        
        count_result = await db.execute(count_query)
        total = count_result.scalar() or 0
        
        # Get paginated results
        stmt = query.order_by(desc(Blog.created_at)).offset(skip).limit(limit).options(
            selectinload(Blog.attachments)
        )
        result = await db.execute(stmt)
        blogs = result.scalars().all()
        
        return blogs, total
    
    @staticmethod
    async def get_all_published_blogs(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 20,
        category: Optional[str] = None
    ) -> tuple[List[Blog], int]:
        """Get all published blog posts."""
        query = select(Blog).where(Blog.published == True)
        
        if category:
            query = query.where(Blog.category == category)
        
        # Get total count
        count_query = select(func.count()).select_from(Blog).where(Blog.published == True)
        if category:
            count_query = count_query.where(Blog.category == category)
        
        count_result = await db.execute(count_query)
        total = count_result.scalar() or 0
        
        # Get paginated results
        stmt = query.order_by(desc(Blog.published_at)).offset(skip).limit(limit).options(
            selectinload(Blog.attachments)
        )
        result = await db.execute(stmt)
        blogs = result.scalars().all()
        
        return blogs, total
    
    @staticmethod
    async def update_blog(
        db: AsyncSession,
        blog_id: UUID,
        blog_data: BlogUpdate
    ) -> Optional[Blog]:
        """Update a blog post."""
        blog = await BlogService.get_blog(db, blog_id)
        if not blog:
            return None
        
        # Update fields if provided
        if blog_data.title is not None:
            blog.title = blog_data.title
            # Auto-regenerate slug if title changes
            base_slug = generate_slug(blog_data.title)
            
            # Check for existing slugs (excluding current blog's slug)
            existing_count = await db.execute(
                select(func.count()).select_from(Blog).where(
                    (Blog.slug.like(f"{base_slug}%")) & (Blog.id != blog_id)
                )
            )
            count = existing_count.scalar() or 0
            
            # Generate unique slug if needed
            blog.slug = base_slug if count == 0 else f"{base_slug}-{count}"
            logger.info(f"Blog slug auto-updated to: {blog.slug}")
        
        if blog_data.excerpt is not None:
            blog.excerpt = blog_data.excerpt
        if blog_data.content is not None:
            blog.content = blog_data.content
        if blog_data.category is not None:
            blog.category = blog_data.category
        if blog_data.read_time is not None:
            blog.read_time = blog_data.read_time
        if blog_data.tags is not None:
            blog.tags = blog_data.tags
        if blog_data.featured_image is not None:
            blog.featured_image = blog_data.featured_image
        if blog_data.featured_video is not None:
            blog.featured_video = blog_data.featured_video
        
        # Handle publish/unpublish
        if blog_data.published is not None:
            blog.published = blog_data.published
            if blog_data.published and not blog.published_at:
                blog.published_at = datetime.utcnow()
        
        blog.updated_at = datetime.utcnow()
        
        await db.flush()
        await db.refresh(blog, ['attachments'])
        
        logger.info(f"Blog updated: {blog_id}")
        return blog
    
    @staticmethod
    async def delete_blog(db: AsyncSession, blog_id: UUID) -> bool:
        """Delete a blog post and its attachments."""
        blog = await BlogService.get_blog(db, blog_id)
        if not blog:
            return False
        
        # Attachments will be cascade deleted
        await db.delete(blog)
        await db.flush()
        
        logger.info(f"Blog deleted: {blog_id}")
        return True
    
    @staticmethod
    async def add_attachment(
        db: AsyncSession,
        blog_id: UUID,
        file_name: str,
        file_type: str,
        file_size: int,
        s3_url: str,
        s3_key: str
    ) -> BlogAttachment:
        """Add an attachment to a blog post."""
        attachment = BlogAttachment(
            blog_id=blog_id,
            file_name=file_name,
            file_type=file_type,
            file_size=file_size,
            s3_url=s3_url,
            s3_key=s3_key
        )
        
        db.add(attachment)
        await db.flush()
        await db.refresh(attachment)
        
        logger.info(f"Attachment added to blog {blog_id}: {s3_key}")
        return attachment
    
    @staticmethod
    async def delete_attachment(db: AsyncSession, attachment_id: UUID) -> bool:
        """Delete an attachment."""
        stmt = select(BlogAttachment).where(BlogAttachment.id == attachment_id)
        result = await db.execute(stmt)
        attachment = result.scalar_one_or_none()
        
        if not attachment:
            return False
        
        await db.delete(attachment)
        await db.flush()
        
        logger.info(f"Attachment deleted: {attachment_id}")
        return True
