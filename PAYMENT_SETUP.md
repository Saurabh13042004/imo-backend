# Payment Gateway Setup Guide

## Overview

IMO now has a complete payment gateway integration with Stripe supporting:
- **Free Users**: Unlimited search with limits on products per search
- **Trial Users**: 7-day free trial with full premium features
- **Premium Users**: Monthly or yearly subscription with unlimited access

## Database Models

### Updated Schema

The subscription model now tracks three user types:

```
User Types:
├── free_user
│   └── subscription_tier = 'free'
│       is_active = false
│       plan_type = 'free'
│
├── trial_user
│   └── subscription_tier = 'trial'
│       is_active = true (within trial period)
│       plan_type = 'trial'
│       trial_end = current_time + 7 days
│
└── premium_user
    └── subscription_tier = 'premium'
        is_active = true (within subscription period)
        plan_type = 'premium'
        billing_cycle = 'monthly' | 'yearly'
        subscription_end = auto-renewal date
```

### Subscription Table Updates

New fields added:
- `plan_type`: Enum (free, trial, premium)
- `billing_cycle`: Enum (monthly, yearly, null for trial)
- `subscription_start`: DateTime when subscription starts
- `trial_start`: DateTime when trial starts
- `stripe_product_id`: Stripe product ID
- `stripe_subscription_id`: Stripe subscription ID for recurring payments

### PaymentTransaction Table Updates

New fields added:
- `subscription_id`: ForeignKey to Subscription
- `currency`: Payment currency (usd, etc.)
- `stripe_payment_intent_id`: Stripe payment intent ID
- `metadata`: JSON metadata for additional tracking

## API Endpoints

### 1. Create Checkout Session
```
POST /api/v1/payments/create-checkout-session
Authentication: Required (JWT)

Request:
{
  "plan_type": "trial" | "premium",
  "billing_cycle": "monthly" | "yearly",  // null for trial
  "success_url": "https://yourapp.com/success",
  "cancel_url": "https://yourapp.com/cancel"
}

Response:
{
  "success": true,
  "session_id": "cs_live_...",
  "url": "https://checkout.stripe.com/pay/..."
}
```

### 2. Checkout Complete Callback
```
POST /api/v1/payments/checkout-complete
Authentication: Required (JWT)

Request:
{
  "session_id": "cs_live_..."
}

Response:
{
  "success": true,
  "message": "Subscription activated successfully"
}
```

### 3. Start 7-Day Trial
```
POST /api/v1/payments/start-trial
Authentication: Required (JWT)

Response:
{
  "success": true,
  "message": "Trial subscription started. You have 7 days of premium access!"
}
```

### 4. Get Subscription Details
```
GET /api/v1/payments/subscription
Authentication: Required (JWT)

Response:
{
  "plan_type": "trial" | "premium" | "free",
  "billing_cycle": "monthly" | "yearly" | null,
  "is_active": true | false,
  "subscription_start": "2024-12-23T10:00:00Z",
  "subscription_end": "2024-12-30T10:00:00Z",
  "trial_start": "2024-12-23T10:00:00Z",
  "trial_end": "2024-12-30T10:00:00Z",
  "is_trial": true | false,
  "days_remaining": 7
}
```

### 5. Stripe Webhook
```
POST /api/v1/payments/webhook
No authentication (Stripe signature verification)

Handles events:
- checkout.session.completed
- customer.subscription.updated
- customer.subscription.deleted
```

## Frontend Integration

### 1. Start Trial Flow
```tsx
const startTrial = async () => {
  const response = await fetch('/api/v1/payments/start-trial', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  // User now has 7-day trial access
};
```

### 2. Subscribe to Premium
```tsx
const subscribePremium = async (billingCycle = 'monthly') => {
  const response = await fetch('/api/v1/payments/create-checkout-session', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      plan_type: 'premium',
      billing_cycle: billingCycle,
      success_url: 'https://yourapp.com/dashboard',
      cancel_url: 'https://yourapp.com/pricing'
    })
  });
  const { url } = await response.json();
  // Redirect to Stripe Checkout
  window.location.href = url;
};
```

### 3. Check Subscription Status
```tsx
const getSubscriptionStatus = async () => {
  const response = await fetch('/api/v1/payments/subscription', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

## Backend Service Methods

### StripeService Methods

#### create_checkout_session()
Creates a Stripe checkout session for trial or premium plans.

#### handle_checkout_complete()
Processes successful checkout:
- Creates/updates Stripe customer
- Creates/updates subscription record
- Records payment transaction
- Updates user tier

#### create_trial_subscription()
Directly creates a trial subscription (for onboarding):
- No payment required
- Trial period = 7 days
- Automatic expiry after 7 days

#### handle_subscription_updated()
Webhook handler for Stripe subscription updates:
- Syncs subscription status with database
- Updates expiry dates

#### handle_subscription_deleted()
Webhook handler for subscription cancellation:
- Marks subscription as inactive
- Reverts user to 'free' tier

#### get_user_subscription()
Returns user's current subscription details and days remaining.

## Stripe Setup Instructions

### 1. Get Stripe Credentials
1. Create a Stripe account at https://stripe.com
2. Go to Developers > API Keys
3. Copy your Secret Key and Publishable Key

### 2. Environment Configuration
```env
STRIPE_SECRET_KEY=sk_live_...  # Your Stripe Secret Key
STRIPE_PUBLISHABLE_KEY=pk_live_...  # Your Stripe Publishable Key
STRIPE_WEBHOOK_SECRET=whsec_...  # From webhook endpoint settings
TRIAL_PERIOD_DAYS=7
PREMIUM_MONTHLY_PRICE=999  # $9.99 in cents
PREMIUM_YEARLY_PRICE=6999  # $69.99 in cents
```

### 3. Create Products in Stripe Dashboard
1. Go to Products > Add Product
2. Create two products:
   - **Premium Monthly** ($9.99/month)
   - **Premium Yearly** ($69.99/year)
3. Record the Product IDs for setup

### 4. Setup Webhook
1. Go to Developers > Webhooks
2. Add new endpoint
3. URL: `https://yourdomain.com/api/v1/payments/webhook`
4. Select events:
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
5. Copy Webhook Secret to STRIPE_WEBHOOK_SECRET

## Database Migrations

Run Alembic migrations:
```bash
# Navigate to backend directory
cd backend

# Run migrations
alembic upgrade head
```

Migration 004 will:
- Add new columns to subscriptions table
- Add new columns to payment_transactions table
- Update constraints and relationships

## Real-Time Sync with Stripe

The system uses Stripe webhooks for real-time synchronization:

1. **Checkout Complete**: Immediately creates subscription record
2. **Subscription Updated**: Keeps expiry dates in sync
3. **Subscription Deleted**: Removes access immediately

### Webhook Event Flow
```
Stripe Event → POST /api/v1/payments/webhook
    ↓
Verify Signature (using STRIPE_WEBHOOK_SECRET)
    ↓
Route to handler based on event type
    ↓
Update database with new state
    ↓
User subscription instantly updated
```

## Testing

### Test Stripe Cards
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure Required**: 4000 0025 0000 3155

### Development Mode
Use Stripe Test Keys (starts with `sk_test_`) in development.

## User Tier Logic

### Access Control
```python
async def check_premium_access(user: Profile) -> bool:
    # Returns True if:
    # 1. User is premium OR
    # 2. User is in active trial period
    
    subscription = await get_user_subscription(user.id)
    return subscription['is_active'] and subscription['plan_type'] in ['premium', 'trial']
```

### Search Limits
```
free_user:      10 searches/month, 5 products per search
trial_user:     Unlimited searches, unlimited products (7 days)
premium_user:   Unlimited searches, unlimited products (monthly/yearly)
```

## Monitoring

### Key Metrics to Track
1. Trial to Premium Conversion Rate
2. Subscription Churn Rate
3. Payment Success Rate
4. Average Subscription Duration

### Logs
All payment operations are logged in `app.services.stripe_service`:
- Session creation
- Payment success/failure
- Webhook processing
- Subscription updates

## Troubleshooting

### Common Issues

**Issue**: Webhook not received
- Verify webhook secret in Stripe dashboard matches .env
- Check Stripe webhook logs in dashboard
- Ensure server is accessible from internet

**Issue**: Subscription not activated after payment
- Check payment transaction status
- Verify webhook was processed
- Check browser console for errors

**Issue**: Trial not starting
- Verify TRIAL_PERIOD_DAYS is set (default: 7)
- Check user doesn't already have active subscription
- Verify database connection

## Next Steps

1. Test payment flow with Stripe test keys
2. Configure webhook in Stripe dashboard
3. Set up email notifications for subscription events
4. Implement subscription management UI
5. Add invoice generation
6. Set up dunning process for failed payments

## Support

For issues with:
- **Stripe**: https://support.stripe.com
- **Database**: Check Alembic migrations
- **API**: Check FastAPI logs at LOG_LEVEL=DEBUG
