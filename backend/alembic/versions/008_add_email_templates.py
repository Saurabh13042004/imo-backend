"""Add email templates table.

Revision ID: 008
Revises: 007_fix_subscription_id_type
Create Date: 2025-12-27 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '008'
down_revision = '007_fix_subscription_id_type'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create email_templates table."""
    op.create_table(
        'email_templates',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False, unique=True),
        sa.Column('subject', sa.String(500), nullable=False),
        sa.Column('body_html', sa.Text(), nullable=False),
        sa.Column('body_text', sa.Text(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    
    # Create index on name for faster lookups
    op.create_index('ix_email_templates_name', 'email_templates', ['name'])
    op.create_index('ix_email_templates_is_active', 'email_templates', ['is_active'])


def downgrade() -> None:
    """Drop email_templates table."""
    op.drop_index('ix_email_templates_is_active', table_name='email_templates')
    op.drop_index('ix_email_templates_name', table_name='email_templates')
    op.drop_table('email_templates')

