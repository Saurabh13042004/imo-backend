"""Add blog slug field.

Revision ID: 010_add_blog_slug
Revises: 009_add_cascade_delete
Create Date: 2026-01-21 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '010_add_blog_slug'
down_revision = '009_add_cascade_delete'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add slug column to blogs table."""
    # Add slug column as nullable first
    op.add_column('blogs', sa.Column('slug', sa.String(500), nullable=True, unique=False))
    
    # Create index on slug
    op.create_index('ix_blogs_slug', 'blogs', ['slug'], unique=False)
    
    # Generate slugs for existing blogs
    connection = op.get_bind()
    
    # Get all blogs
    result = connection.execute(
        sa.text("SELECT id, title FROM blogs ORDER BY created_at DESC")
    )
    
    import re
    
    def generate_slug(text):
        """Generate URL slug from text."""
        slug = text.lower()
        slug = re.sub(r'\s+', '-', slug)
        slug = re.sub(r'[^a-z0-9\-]', '', slug)
        slug = re.sub(r'-+', '-', slug)
        slug = slug.strip('-')
        return slug[:200] if slug else 'blog'
    
    # Track existing slugs
    existing_slugs = set()
    
    for row in result:
        blog_id, title = row
        base_slug = generate_slug(title)
        
        # Make slug unique
        slug = base_slug
        counter = 1
        while slug in existing_slugs:
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        existing_slugs.add(slug)
        
        # Update blog with slug
        connection.execute(
            sa.text("UPDATE blogs SET slug = :slug WHERE id = :id"),
            {"slug": slug, "id": blog_id}
        )
    
    # Make slug column NOT NULL and unique
    op.alter_column('blogs', 'slug', existing_type=sa.String(500), nullable=False)
    op.create_unique_constraint('uq_blogs_slug', 'blogs', ['slug'])


def downgrade() -> None:
    """Remove slug column from blogs table."""
    op.drop_constraint('uq_blogs_slug', 'blogs', type_='unique')
    op.drop_index('ix_blogs_slug', table_name='blogs')
    op.drop_column('blogs', 'slug')
