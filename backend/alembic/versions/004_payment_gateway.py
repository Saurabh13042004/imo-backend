"""Update subscription model with payment gateway fields.

Revision ID: 004
Revises: 003_add_password_hash
Create Date: 2024-12-23 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003_add_password_hash'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add payment gateway fields to subscription and payment_transactions tables."""
    # Update subscriptions table
    op.add_column('subscriptions', sa.Column('plan_type', sa.String(), nullable=False, server_default='free'))
    op.add_column('subscriptions', sa.Column('billing_cycle', sa.String(), nullable=True))
    op.add_column('subscriptions', sa.Column('subscription_start', sa.DateTime(timezone=True), nullable=True))
    op.add_column('subscriptions', sa.Column('trial_start', sa.DateTime(timezone=True), nullable=True))
    op.add_column('subscriptions', sa.Column('stripe_product_id', sa.String(), nullable=True))
    
    # Update payment_transactions table
    op.add_column('payment_transactions', sa.Column('subscription_id', sa.String(), nullable=True))
    op.add_column('payment_transactions', sa.Column('currency', sa.String(), nullable=False, server_default='usd'))
    op.add_column('payment_transactions', sa.Column('stripe_payment_intent_id', sa.String(), unique=True, nullable=True))
    op.add_column('payment_transactions', sa.Column('metadata_json', sa.String(), nullable=True))


def downgrade() -> None:
    """Revert payment gateway fields."""
    # Remove from subscriptions table
    op.drop_column('subscriptions', 'stripe_product_id')
    op.drop_column('subscriptions', 'trial_start')
    op.drop_column('subscriptions', 'subscription_start')
    op.drop_column('subscriptions', 'billing_cycle')
    op.drop_column('subscriptions', 'plan_type')
    
    # Remove from payment_transactions table
    op.drop_column('payment_transactions', 'metadata_json')
    op.drop_column('payment_transactions', 'stripe_payment_intent_id')
    op.drop_column('payment_transactions', 'currency')
    op.drop_column('payment_transactions', 'subscription_id')
