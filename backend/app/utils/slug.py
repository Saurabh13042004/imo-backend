"""Slug generation utilities."""
import re
from typing import Optional


def generate_slug(text: str) -> str:
    """
    Generate a URL-friendly slug from text.
    
    Args:
        text: Text to convert to slug
        
    Returns:
        URL-friendly slug
        
    Example:
        "How to Choose the Perfect E-commerce Platform" 
        -> "how-to-choose-perfect-ecommerce-platform"
    """
    # Convert to lowercase
    slug = text.lower()
    
    # Replace spaces with hyphens
    slug = re.sub(r'\s+', '-', slug)
    
    # Remove special characters except hyphens
    slug = re.sub(r'[^a-z0-9\-]', '', slug)
    
    # Remove multiple consecutive hyphens
    slug = re.sub(r'-+', '-', slug)
    
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    
    # Limit to 200 characters
    slug = slug[:200]
    
    return slug


async def generate_unique_slug(
    base_slug: str,
    existing_slugs: list[str],
    max_attempts: int = 100
) -> Optional[str]:
    """
    Generate a unique slug by appending numbers if needed.
    
    Args:
        base_slug: Base slug to make unique
        existing_slugs: List of existing slugs to check against
        max_attempts: Maximum number of attempts
        
    Returns:
        Unique slug or None if unable to generate
        
    Example:
        base_slug = "how-to-choose"
        existing_slugs = ["how-to-choose", "how-to-choose-1"]
        -> "how-to-choose-2"
    """
    if base_slug not in existing_slugs:
        return base_slug
    
    for i in range(1, max_attempts):
        candidate = f"{base_slug}-{i}"
        if candidate not in existing_slugs:
            return candidate
    
    return None
