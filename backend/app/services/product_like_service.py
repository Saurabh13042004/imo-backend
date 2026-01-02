"""Service for managing product likes."""
import logging
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.product_meta import ProductLike
from app.models.product import Product

logger = logging.getLogger(__name__)


class ProductLikeService:
    """Service for product like operations."""

    @staticmethod
    async def toggle_like(
        session: AsyncSession,
        user_id: str,
        product_id: str,
        product_data: dict = None
    ) -> Tuple[bool, int]:
        """Toggle like status for a product.
        Auto-creates or updates product if product_data is provided.
        
        Args:
            session: Database session
            user_id: User UUID
            product_id: Product UUID
            product_data: Optional dict with product info (title, image_url, price, etc.)
            
        Returns:
            Tuple of (is_liked, total_likes)
        """
        # Check if product exists
        product_result = await session.execute(
            select(Product).where(Product.id == product_id)
        )
        product = product_result.scalars().first()
        
        if not product:
            # Auto-create product with provided data or minimal entry
            if product_data:
                product = Product(
                    id=product_id,
                    title=product_data.get('title', f'Product {product_id[:8]}'),
                    image_url=product_data.get('image_url'),
                    price=product_data.get('price'),
                    currency=product_data.get('currency', 'USD'),
                    source=product_data.get('source'),
                    source_id=product_data.get('source_id'),
                    brand=product_data.get('brand'),
                    description=product_data.get('description'),
                    url=product_data.get('url'),
                    category=product_data.get('category'),
                    availability=product_data.get('availability')
                )
            else:
                # Minimal placeholder if no data provided
                product = Product(
                    id=product_id,
                    title=f"Product {product_id[:8]}",
                    description="Auto-created from like action"
                )
            session.add(product)
            await session.flush()
        elif product_data:
            # Update existing product with new data if provided
            for key, value in product_data.items():
                if value is not None and hasattr(product, key):
                    setattr(product, key, value)
            await session.flush()

        # Check if user already liked this product
        like_result = await session.execute(
            select(ProductLike).where(
                ProductLike.user_id == user_id,
                ProductLike.product_id == product_id
            )
        )
        existing_like = like_result.scalars().first()

        if existing_like:
            # Unlike
            await session.delete(existing_like)
            is_liked = False
        else:
            # Like
            new_like = ProductLike(
                user_id=user_id,
                product_id=product_id
            )
            session.add(new_like)
            is_liked = True

        await session.flush()
        
        # Get total likes for this product
        count_result = await session.execute(
            select(func.count(ProductLike.id)).where(
                ProductLike.product_id == product_id
            )
        )
        total_likes = count_result.scalar() or 0
        
        await session.commit()
        
        return is_liked, total_likes

    @staticmethod
    async def get_like_status(
        session: AsyncSession,
        user_id: str,
        product_id: str
    ) -> Tuple[bool, int]:
        """Get like status and count for a product.
        
        Args:
            session: Database session
            user_id: User UUID
            product_id: Product UUID
            
        Returns:
            Tuple of (is_liked_by_user, total_likes)
        """
        # Check if user liked this product
        like_result = await session.execute(
            select(ProductLike).where(
                ProductLike.user_id == user_id,
                ProductLike.product_id == product_id
            )
        )
        is_liked = like_result.scalars().first() is not None

        # Get total likes
        count_result = await session.execute(
            select(func.count(ProductLike.id)).where(
                ProductLike.product_id == product_id
            )
        )
        total_likes = count_result.scalar() or 0

        return is_liked, total_likes

    @staticmethod
    async def get_user_liked_products(
        session: AsyncSession,
        user_id: str,
        limit: int = 100,
        offset: int = 0
    ) -> Tuple[list, int]:
        """Get all products liked by a user.
        
        Args:
            session: Database session
            user_id: User UUID
            limit: Number of products to return
            offset: Pagination offset
            
        Returns:
            Tuple of (liked_products, total_count)
        """
        # Get total count
        count_result = await session.execute(
            select(func.count(ProductLike.id)).where(
                ProductLike.user_id == user_id
            )
        )
        total_count = count_result.scalar() or 0

        # Get paginated results
        result = await session.execute(
            select(ProductLike)
            .where(ProductLike.user_id == user_id)
            .order_by(ProductLike.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        likes = result.scalars().all()

        # Get associated products
        product_ids = [like.product_id for like in likes]
        if not product_ids:
            return [], total_count

        products_result = await session.execute(
            select(Product).where(Product.id.in_(product_ids))
        )
        products = products_result.scalars().all()

        # Sort products by their like order
        product_map = {p.id: p for p in products}
        sorted_products = [product_map[pid] for pid in product_ids if pid in product_map]

        return sorted_products, total_count

    @staticmethod
    async def get_like_count(
        session: AsyncSession,
        product_id: str
    ) -> int:
        """Get total likes for a product.
        
        Args:
            session: Database session
            product_id: Product UUID
            
        Returns:
            Total like count
        """
        result = await session.execute(
            select(func.count(ProductLike.id)).where(
                ProductLike.product_id == product_id
            )
        )
        return result.scalar() or 0
