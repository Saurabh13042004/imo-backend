"""Fix subscription_id type in payment_transactions.

Revision ID: 007
Revises: 006_add_subscription_columns
Create Date: 2025-12-24 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '007'
down_revision = '006_add_subscription_columns'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Fix subscription_id column type from String to UUID."""
    # Drop the existing column if it exists as String
    try:
        op.drop_column('payment_transactions', 'subscription_id')
    except Exception:
        pass
    
    # Add subscription_id as UUID with proper foreign key
    op.add_column(
        'payment_transactions',
        sa.Column('subscription_id', postgresql.UUID(as_uuid=True), nullable=True)
    )
    
    # Add foreign key constraint
    op.create_foreign_key(
        'fk_payment_transactions_subscription_id',
        'payment_transactions',
        'subscriptions',
        ['subscription_id'],
        ['id']
    )


def downgrade() -> None:
    """Revert subscription_id back to String."""
    # Drop foreign key constraint
    op.drop_constraint('fk_payment_transactions_subscription_id', 'payment_transactions', type_='foreignkey')
    
    # Drop UUID column
    op.drop_column('payment_transactions', 'subscription_id')
    
    # Add back as String
    op.add_column('payment_transactions', sa.Column('subscription_id', sa.String(), nullable=True))
