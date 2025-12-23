-- Fix subscription_id column type in payment_transactions table
-- Run this SQL directly in your PostgreSQL database

-- Step 1: Check if column exists and drop it if it's the wrong type
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' 
        AND column_name = 'subscription_id'
    ) THEN
        -- Drop the column if it exists
        ALTER TABLE payment_transactions DROP COLUMN IF EXISTS subscription_id;
    END IF;
END $$;

-- Step 2: Add subscription_id as UUID with proper foreign key
ALTER TABLE payment_transactions 
ADD COLUMN subscription_id UUID;

-- Step 3: Add foreign key constraint
ALTER TABLE payment_transactions
ADD CONSTRAINT fk_payment_transactions_subscription_id
FOREIGN KEY (subscription_id) REFERENCES subscriptions(id);

-- Step 4: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription_id 
ON payment_transactions(subscription_id);
