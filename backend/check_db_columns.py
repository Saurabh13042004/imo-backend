"""
Check database columns in payment_transactions table
Run with: python check_db_columns.py
"""
import asyncio
import asyncpg
import os

async def check_columns():
    # Get database URL from environment
    db_url = os.getenv("DATABASE_URL", "postgresql://postgres:Saurabh130420@139.84.139.74:5432/imo_db")
    
    if db_url.startswith("postgresql+asyncpg://"):
        db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
    
    print(f"Connecting to database...")
    conn = await asyncpg.connect(db_url)
    
    try:
        print("=" * 60)
        print("PAYMENT_TRANSACTIONS TABLE COLUMNS")
        print("=" * 60)
        
        # Get all columns in payment_transactions
        result = await conn.fetch("""
            SELECT 
                column_name, 
                data_type, 
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'payment_transactions'
            ORDER BY ordinal_position
        """)
        
        if result:
            print(f"\nFound {len(result)} columns:\n")
            for row in result:
                print(f"  • {row['column_name']:<25} {row['data_type']:<15} nullable={row['is_nullable']}")
        else:
            print("\n❌ Table 'payment_transactions' not found or has no columns!")
        
        print("\n" + "=" * 60)
        print("CHECKING FOR SPECIFIC COLUMNS")
        print("=" * 60)
        
        required_columns = ['subscription_id', 'currency', 'stripe_payment_intent_id', 'stripe_session_id']
        
        for col in required_columns:
            exists = await conn.fetchval("""
                SELECT COUNT(*) 
                FROM information_schema.columns 
                WHERE table_name = 'payment_transactions' 
                AND column_name = $1
            """, col)
            
            if exists:
                col_type = await conn.fetchval("""
                    SELECT data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'payment_transactions' 
                    AND column_name = $1
                """, col)
                print(f"  ✅ {col:<30} exists (type: {col_type})")
            else:
                print(f"  ❌ {col:<30} MISSING!")
        
        print("\n" + "=" * 60)
        print("SERVER TIMEZONE INFO")
        print("=" * 60)
        
        timezone = await conn.fetchval("SHOW TIMEZONE")
        current_time_utc = await conn.fetchval("SELECT NOW() AT TIME ZONE 'UTC'")
        current_time_local = await conn.fetchval("SELECT NOW()")
        
        print(f"\n  Database timezone: {timezone}")
        print(f"  Current time (UTC): {current_time_utc}")
        print(f"  Current time (Local): {current_time_local}")
        
        # Check what the logs show
        print(f"\n  Log timestamp: 2025-12-23 21:42:30 (UTC)")
        print(f"  Current time: {current_time_utc} (UTC)")
        print(f"\n  Note: Yes, the error logs are from Dec 23 in UTC timezone!")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_columns())
