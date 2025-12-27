# IMO Email Templates & Service Setup Guide

## Overview
This guide explains how to use the IMO-branded email templates and services to send emails to users.

## Templates Included

### 1. **imo_new_user_onboarding**
- **Purpose**: Sent to new users after signup
- **Subject**: "Welcome to IMO - AI That Reads Every Review! 🎯"
- **Includes**:
  - Welcome message with IMO tagline
  - Trial activation info (7-day free trial)
  - IMO stats (5K+ reviews, 276+ video sources, 55+ retailers)
  - Feature cards (Smart Search, IMO Score, Review Summaries, Video Reviews)
  - CTA to start exploring
  - Contact information

### 2. **imo_payment_success**
- **Purpose**: Sent after successful payment
- **Subject**: "Payment Successful! Welcome to IMO Premium ✓"
- **Includes**:
  - Success message with checkmark icon
  - Transaction details (ID, plan, amount, date, next billing date)
  - Complete list of premium features
  - Next steps guide
  - Auto-renewal information
  - Support contact info

### 3. **imo_payment_cancelled**
- **Purpose**: Sent when payment is cancelled
- **Subject**: "Payment Cancelled - No Charges ⚠️"
- **Includes**:
  - Reassurance that no charges were made
  - Transaction details (ID, plan, amount, cancellation date, reason)
  - Options to continue with free tier or retry
  - Premium benefits highlight
  - CTA to retry payment
  - Support contact info

## Setup Instructions

### Step 1: Seed Templates to Database

Run the seeder script to populate templates:

```bash
cd backend
python seed_imo_email_templates.py
```

You should see output like:
```
INFO:__main__:Starting email template seeding...
INFO:__main__:✓ Created template: imo_new_user_onboarding
INFO:__main__:✓ Created template: imo_payment_success
INFO:__main__:✓ Created template: imo_payment_cancelled
INFO:__main__:✅ Email templates seeded successfully!
INFO:__main__:Total templates in database: 3
```

### Step 2: Configure Email Settings

Ensure your `.env` file has proper mail configuration:

```env
# Email Configuration
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@informedmarketopinions.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_STARTTLS=true
MAIL_SSL_TLS=false
USE_CREDENTIALS=true
VALIDATE_CERTS=true

# Frontend URL for email links
FRONTEND_URL=https://informedmarketopinions.com
```

## Usage Examples

### Example 1: Send New User Onboarding Email

```python
from app.services.imo_mail_service import IMOMailService
from app.database import AsyncSessionLocal

async def on_user_signup(user_email: str, user_name: str):
    async with AsyncSessionLocal() as db:
        success = await IMOMailService.send_new_user_onboarding_email(
            db=db,
            user_email=user_email,
            user_name=user_name,
            has_trial=True,
            trial_days=7
        )
        return success
```

### Example 2: Send Payment Success Email

```python
from app.services.imo_mail_service import IMOMailService
from app.database import AsyncSessionLocal
from datetime import datetime, timedelta

async def on_payment_success(
    user_email: str,
    user_name: str,
    transaction_id: str,
    amount: str,
    plan_type: str
):
    async with AsyncSessionLocal() as db:
        next_billing = (datetime.utcnow() + timedelta(days=30)).strftime("%B %d, %Y")
        
        success = await IMOMailService.send_payment_success_email(
            db=db,
            user_email=user_email,
            user_name=user_name,
            transaction_id=transaction_id,
            amount=amount,
            plan_type=plan_type,
            payment_date=datetime.utcnow().strftime("%B %d, %Y at %I:%M %p"),
            next_billing_date=next_billing
        )
        return success
```

### Example 3: Send Payment Cancelled Email

```python
from app.services.imo_mail_service import IMOMailService
from app.database import AsyncSessionLocal
from datetime import datetime

async def on_payment_cancelled(
    user_email: str,
    user_name: str,
    transaction_id: str,
    amount: str,
    reason: str = None
):
    async with AsyncSessionLocal() as db:
        success = await IMOMailService.send_payment_cancelled_email(
            db=db,
            user_email=user_email,
            user_name=user_name,
            transaction_id=transaction_id,
            amount=amount,
            plan_type="Premium Unlimited",
            cancellation_date=datetime.utcnow().strftime("%B %d, %Y at %I:%M %p"),
            reason=reason
        )
        return success
```

### Example 4: Integration in Auth Service

Update your auth service signup method:

```python
from app.services.imo_mail_service import IMOMailService

@staticmethod
async def sign_up(
    session: AsyncSession,
    email: str,
    password: str,
    full_name: str
) -> Tuple[Profile, str, str]:
    """Register a new user with email and password."""
    # ... existing code ...
    
    # Send welcome email
    try:
        await IMOMailService.send_new_user_onboarding_email(
            db=session,
            user_email=email.lower(),
            user_name=full_name,
            has_trial=True,
            trial_days=7
        )
    except Exception as e:
        logger.error(f"Failed to send onboarding email: {e}")
    
    return profile, access_token, refresh_token
```

### Example 5: Integration in Payment Service

```python
from app.services.imo_mail_service import IMOMailService

async def process_payment(user_id: str, amount: float, plan_type: str):
    """Process payment and send email."""
    db = AsyncSessionLocal()
    
    try:
        # Process payment with Stripe
        charge = stripe.Charge.create(
            amount=int(amount * 100),
            currency='usd',
            source='tok_visa',
            description=f'IMO {plan_type} subscription'
        )
        
        # Get user info
        user = await get_user(user_id)
        
        # Send success email
        await IMOMailService.send_payment_success_email(
            db=db,
            user_email=user.email,
            user_name=user.full_name,
            transaction_id=charge.id,
            amount=f"${amount:.2f}",
            plan_type=plan_type
        )
        
        return True
    except Exception as e:
        # Send cancelled email
        user = await get_user(user_id)
        await IMOMailService.send_payment_cancelled_email(
            db=db,
            user_email=user.email,
            user_name=user.full_name,
            transaction_id="unknown",
            amount=f"${amount:.2f}",
            plan_type=plan_type,
            reason=str(e)
        )
        return False
    finally:
        await db.close()
```

## Template Variables Reference

### New User Onboarding
```
- user_name: User's full name
- user_email: User's email address
- has_trial: Boolean - whether user has trial
- trial_days: Number of trial days (default: 7)
- signup_date: Formatted signup date
- current_year: Current year
- dashboard_url: URL to dashboard
- pricing_url: URL to pricing page
```

### Payment Success
```
- user_name: User's full name
- user_email: User's email address
- transaction_id: Payment transaction ID
- amount: Amount charged (e.g., "$9.99")
- plan_type: Type of plan (e.g., "Premium Unlimited")
- payment_date: Formatted payment date
- next_billing_date: Formatted next billing date
- current_year: Current year
- dashboard_url: URL to dashboard
```

### Payment Cancelled
```
- user_name: User's full name
- user_email: User's email address
- transaction_id: Failed transaction ID
- amount: Attempted amount (e.g., "$9.99")
- plan_type: Type of plan (e.g., "Premium Unlimited")
- cancellation_date: Formatted cancellation date
- reason: Reason for cancellation (optional)
- current_year: Current year
- upgrade_url: URL to upgrade/pricing page
- pricing_url: URL to pricing page
```

## Troubleshooting

### Issue: Templates Not Found
**Solution**: Make sure template files are in `app/templates/email/` directory
```
✓ app/templates/email/imo_new_user_onboarding.html
✓ app/templates/email/imo_payment_success.html
✓ app/templates/email/imo_payment_cancelled.html
```

### Issue: Email Not Sending
**Solution**: Check email configuration in `.env` and enable "Less secure apps" for Gmail

### Issue: Templates Not in Database
**Solution**: Run the seeder script:
```bash
python seed_imo_email_templates.py
```

### Issue: Template Variables Not Rendering
**Solution**: Make sure you're passing all required context variables to the service methods

## Design Features

All templates include:
- ✅ IMO brand colors (blue: #0066cc)
- ✅ Responsive design (works on mobile & desktop)
- ✅ Professional gradient headers
- ✅ Feature cards with icons
- ✅ Clear CTAs
- ✅ Footer with company info
- ✅ Plain text fallback versions
- ✅ Jinja2 template variable support

## File Locations

```
backend/
├── app/
│   ├── templates/
│   │   └── email/
│   │       ├── imo_new_user_onboarding.html
│   │       ├── imo_payment_success.html
│   │       └── imo_payment_cancelled.html
│   └── services/
│       ├── mail_service.py          # Base mail service
│       └── imo_mail_service.py      # IMO-specific service
├── models/
│   └── email_template.py            # Template model
└── seed_imo_email_templates.py      # Seeder script
```

## Next Steps

1. Run seeder: `python seed_imo_email_templates.py`
2. Configure email in `.env`
3. Import `IMOMailService` in your auth/payment services
4. Call appropriate methods on user actions
5. Test by creating a test user and checking your email

---

**Questions or Issues?**
Contact: imhollc27@gmail.com
Website: https://informedmarketopinions.com
