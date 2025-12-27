"""Add CASCADE delete constraints to user foreign keys.

Revision ID: 009
Revises: 008_add_email_templates
Create Date: 2025-12-28 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '009'
down_revision = '008_add_email_templates'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade: Add CASCADE delete constraints to subscriptions and payment_transactions."""
    # Drop old foreign keys and create new ones with CASCADE
    
    # For Subscriptions table
    op.drop_constraint('subscriptions_user_id_fkey', 'subscriptions', type_='foreignkey')
    op.create_foreign_key(
        'subscriptions_user_id_fkey',
        'subscriptions',
        'profiles',
        ['user_id'],
        ['id'],
        ondelete='CASCADE'
    )
    
    # For PaymentTransaction table
    op.drop_constraint('payment_transactions_user_id_fkey', 'payment_transactions', type_='foreignkey')
    op.create_foreign_key(
        'payment_transactions_user_id_fkey',
        'payment_transactions',
        'profiles',
        ['user_id'],
        ['id'],
        ondelete='CASCADE'
    )
    
    # For SearchUnlock table
    op.drop_constraint('search_unlocks_user_id_fkey', 'search_unlocks', type_='foreignkey')
    op.create_foreign_key(
        'search_unlocks_user_id_fkey',
        'search_unlocks',
        'profiles',
        ['user_id'],
        ['id'],
        ondelete='CASCADE'
    )
    
    # For DailySearchUsage table
    op.drop_constraint('daily_search_usage_user_id_fkey', 'daily_search_usage', type_='foreignkey')
    op.create_foreign_key(
        'daily_search_usage_user_id_fkey',
        'daily_search_usage',
        'profiles',
        ['user_id'],
        ['id'],
        ondelete='CASCADE'
    )
    
    # For PriceAlert table
    op.drop_constraint('price_alerts_user_id_fkey', 'price_alerts', type_='foreignkey')
    op.create_foreign_key(
        'price_alerts_user_id_fkey',
        'price_alerts',
        'profiles',
        ['user_id'],
        ['id'],
        ondelete='CASCADE'
    )


def downgrade() -> None:
    """Downgrade: Remove CASCADE delete constraints."""
    # For Subscriptions table
    op.drop_constraint('subscriptions_user_id_fkey', 'subscriptions', type_='foreignkey')
    op.create_foreign_key(
        'subscriptions_user_id_fkey',
        'subscriptions',
        'profiles',
        ['user_id'],
        ['id']
    )
    
    # For PaymentTransaction table
    op.drop_constraint('payment_transactions_user_id_fkey', 'payment_transactions', type_='foreignkey')
    op.create_foreign_key(
        'payment_transactions_user_id_fkey',
        'payment_transactions',
        'profiles',
        ['user_id'],
        ['id']
    )
    
    # For SearchUnlock table
    op.drop_constraint('search_unlocks_user_id_fkey', 'search_unlocks', type_='foreignkey')
    op.create_foreign_key(
        'search_unlocks_user_id_fkey',
        'search_unlocks',
        'profiles',
        ['user_id'],
        ['id']
    )
    
    # For DailySearchUsage table
    op.drop_constraint('daily_search_usage_user_id_fkey', 'daily_search_usage', type_='foreignkey')
    op.create_foreign_key(
        'daily_search_usage_user_id_fkey',
        'daily_search_usage',
        'profiles',
        ['user_id'],
        ['id']
    )
    
    # For PriceAlert table
    op.drop_constraint('price_alerts_user_id_fkey', 'price_alerts', type_='foreignkey')
    op.create_foreign_key(
        'price_alerts_user_id_fkey',
        'price_alerts',
        'profiles',
        ['user_id'],
        ['id']
    )
