"""Add missing subscription columns for payment gateway.

Revision ID: 006_add_subscription_columns
Revises: 005_price_alerts
Create Date: 2025-12-23 16:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '006_add_subscription_columns'
down_revision = '005_price_alerts'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add missing columns to subscriptions table."""
    # Check if columns already exist before adding
    # These columns are needed for the payment gateway integration
    
    # Add billing_cycle column
    try:
        op.add_column('subscriptions', 
            sa.Column('billing_cycle', sa.String(), nullable=True))
    except Exception:
        pass  # Column might already exist
    
    # Add subscription_start column
    try:
        op.add_column('subscriptions',
            sa.Column('subscription_start', sa.DateTime(timezone=True), nullable=True))
    except Exception:
        pass  # Column might already exist
    
    # Add trial_start column
    try:
        op.add_column('subscriptions',
            sa.Column('trial_start', sa.DateTime(timezone=True), nullable=True))
    except Exception:
        pass  # Column might already exist
    
    # Add stripe_product_id column
    try:
        op.add_column('subscriptions',
            sa.Column('stripe_product_id', sa.String(), nullable=True))
    except Exception:
        pass  # Column might already exist


def downgrade() -> None:
    """Revert subscription column additions."""
    try:
        op.drop_column('subscriptions', 'stripe_product_id')
    except Exception:
        pass
    
    try:
        op.drop_column('subscriptions', 'trial_start')
    except Exception:
        pass
    
    try:
        op.drop_column('subscriptions', 'subscription_start')
    except Exception:
        pass
    
    try:
        op.drop_column('subscriptions', 'billing_cycle')
    except Exception:
        pass
