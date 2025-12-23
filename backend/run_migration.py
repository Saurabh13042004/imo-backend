"""
Run database migration to fix subscription_id column type.
"""
import asyncio
import asyncpg
from app.config import get_settings

async def run_migration():
    settings = get_settings()
    
    # Parse database URL
    db_url = settings.database_url
    if db_url.startswith("postgresql+asyncpg://"):
        db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
    
    # Connect to database
    conn = await asyncpg.connect(db_url)
    
    try:
        print("Checking subscription_id column...")
        
        # Check if column exists
        result = await conn.fetchval("""
            SELECT COUNT(*) 
            FROM information_schema.columns 
            WHERE table_name = 'payment_transactions' 
            AND column_name = 'subscription_id'
        """)
        
        if result > 0:
            print("Dropping existing subscription_id column...")
            await conn.execute("ALTER TABLE payment_transactions DROP COLUMN subscription_id")
        
        print("Adding subscription_id as UUID...")
        await conn.execute("ALTER TABLE payment_transactions ADD COLUMN subscription_id UUID")
        
        print("Adding foreign key constraint...")
        await conn.execute("""
            ALTER TABLE payment_transactions
            ADD CONSTRAINT fk_payment_transactions_subscription_id
            FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
        """)
        
        print("Creating index...")
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription_id 
            ON payment_transactions(subscription_id)
        """)
        
        print("✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(run_migration())
