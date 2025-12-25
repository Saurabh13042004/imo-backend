"""Database connection and session management."""

import logging
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.pool import NullPool
from sqlalchemy import text

from app.config import settings

logger = logging.getLogger(__name__)

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DATABASE_ECHO,
    poolclass=NullPool if settings.DEBUG else None,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={"timeout": settings.HTTP_TIMEOUT},
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error: {str(e)}", exc_info=True)
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database tables."""
    from app.models import Base

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized")
    
    # Add missing columns if they don't exist
    async with engine.begin() as conn:
        try:
            # Check and add password_hash column
            await conn.execute(text("""
                ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash VARCHAR;
            """))
            logger.info("password_hash column added or already exists")
        except Exception as e:
            logger.debug(f"password_hash column: {e}")
        
        try:
            # Check and add oauth_provider column
            await conn.execute(text("""
                ALTER TABLE profiles ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR;
            """))
            logger.info("oauth_provider column added or already exists")
        except Exception as e:
            logger.debug(f"oauth_provider column: {e}")
        
        try:
            # Check and add oauth_provider_id column
            await conn.execute(text("""
                ALTER TABLE profiles ADD COLUMN IF NOT EXISTS oauth_provider_id VARCHAR;
            """))
            logger.info("oauth_provider_id column added or already exists")
        except Exception as e:
            logger.debug(f"oauth_provider_id column: {e}")
        
        # Add missing subscription columns for payment gateway
        try:
            await conn.execute(text("""
                ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR;
            """))
            logger.info("billing_cycle column added or already exists")
        except Exception as e:
            logger.debug(f"billing_cycle column: {e}")
        
        try:
            await conn.execute(text("""
                ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMP WITH TIME ZONE;
            """))
            logger.info("subscription_start column added or already exists")
        except Exception as e:
            logger.debug(f"subscription_start column: {e}")
        
        try:
            await conn.execute(text("""
                ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_start TIMESTAMP WITH TIME ZONE;
            """))
            logger.info("trial_start column added or already exists")
        except Exception as e:
            logger.debug(f"trial_start column: {e}")
        
        try:
            await conn.execute(text("""
                ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR;
            """))
            logger.info("stripe_product_id column added or already exists")
        except Exception as e:
            logger.debug(f"stripe_product_id column: {e}")
        
        # Add missing payment_transactions columns
        try:
            await conn.execute(text("""
                ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS currency VARCHAR DEFAULT 'usd';
            """))
            logger.info("currency column added or already exists")
        except Exception as e:
            logger.debug(f"currency column: {e}")
        
        try:
            await conn.execute(text("""
                ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR UNIQUE;
            """))
            logger.info("stripe_payment_intent_id column added or already exists")
        except Exception as e:
            logger.debug(f"stripe_payment_intent_id column: {e}")
        
        try:
            await conn.execute(text("""
                ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR;
            """))
            logger.info("stripe_session_id column added or already exists")
        except Exception as e:
            logger.debug(f"stripe_session_id column: {e}")
        
        try:
            await conn.execute(text("""
                ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS metadata_json VARCHAR;
            """))
            logger.info("metadata_json column added or already exists")
        except Exception as e:
            logger.debug(f"metadata_json column: {e}")
        
        # Fix subscription_id column type in payment_transactions (UUID instead of String)
        try:
            # Check if column exists and what type it is
            result = await conn.execute(text("""
                SELECT data_type 
                FROM information_schema.columns 
                WHERE table_name = 'payment_transactions' 
                AND column_name = 'subscription_id'
            """))
            existing_type = result.scalar_one_or_none()
            
            if existing_type and existing_type != 'uuid':
                logger.info("Fixing subscription_id column type from String to UUID...")
                # Drop the column and recreate as UUID
                await conn.execute(text("""
                    ALTER TABLE payment_transactions DROP COLUMN IF EXISTS subscription_id CASCADE;
                """))
                await conn.execute(text("""
                    ALTER TABLE payment_transactions ADD COLUMN subscription_id UUID;
                """))
                await conn.execute(text("""
                    ALTER TABLE payment_transactions
                    ADD CONSTRAINT fk_payment_transactions_subscription_id
                    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id);
                """))
                await conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription_id 
                    ON payment_transactions(subscription_id);
                """))
                logger.info("subscription_id column fixed as UUID with foreign key")
            elif not existing_type:
                # Column doesn't exist, add it
                await conn.execute(text("""
                    ALTER TABLE payment_transactions ADD COLUMN subscription_id UUID;
                """))
                await conn.execute(text("""
                    ALTER TABLE payment_transactions
                    ADD CONSTRAINT fk_payment_transactions_subscription_id
                    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id);
                """))
                await conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription_id 
                    ON payment_transactions(subscription_id);
                """))
                logger.info("subscription_id column added as UUID")
            else:
                logger.info("subscription_id column already exists as UUID")
        except Exception as e:
            logger.debug(f"subscription_id column fix: {e}")
        
        # Add contacts table if it doesn't exist
        try:
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS contacts (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    subject VARCHAR(500) NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            """))
            # Create indexes
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email)
            """))
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at)
            """))
            logger.info("contacts table created or already exists")
        except Exception as e:
            logger.debug(f"contacts table: {e}")


async def close_db():
    """Close database connection."""
    await engine.dispose()
    logger.info("Database connection closed")
