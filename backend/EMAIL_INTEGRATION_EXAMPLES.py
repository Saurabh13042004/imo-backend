"""
Example usage of IMO email services in various endpoints.
This file demonstrates how the email service is integrated with auth and payment routes.
"""

# ============================================================================
# EXAMPLE 1: SENDING EMAIL ON NEW USER REGISTRATION
# ============================================================================
# Location: app/api/routes/auth.py - sign_up endpoint

"""
@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def sign_up(
    request: SignUpRequest,
    session: AsyncSession = Depends(get_db)
):
    # ... existing code ...
    
    profile, access_token, refresh_token = await AuthService.sign_up(
        session=session,
        email=request.email,
        password=request.password,
        full_name=request.full_name
    )
    
    # SEND WELCOME EMAIL
    try:
        await IMOMailService.send_new_user_onboarding_email(
            db=session,
            user_email=profile.email,
            user_name=profile.full_name,
            has_trial=True,
            trial_days=7
        )
        logger.info(f"Welcome email sent to {profile.email}")
    except Exception as email_error:
        logger.error(f"Failed to send welcome email: {email_error}")
        # Don't fail the signup if email fails
    
    # ... rest of code ...
"""


# ============================================================================
# EXAMPLE 2: SENDING EMAIL ON PAYMENT SUCCESS
# ============================================================================
# Location: app/api/routes/payments.py - checkout_complete endpoint

"""
@router.post("/checkout-complete")
async def checkout_complete(
    request: CheckoutCallbackRequest,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # ... existing code ...
    
    success = await StripeService.handle_checkout_complete(
        session_id=request.session_id,
        user_id=str(current_user.id),
        session=db,
    )
    
    # SEND PAYMENT SUCCESS EMAIL
    try:
        next_billing = (datetime.utcnow() + timedelta(days=30)).strftime("%B %d, %Y")
        await IMOMailService.send_payment_success_email(
            db=db,
            user_email=current_user.email,
            user_name=current_user.full_name,
            transaction_id=request.session_id,
            amount="$9.99",
            plan_type="Premium Unlimited",
            payment_date=datetime.utcnow().strftime("%B %d, %Y at %I:%M %p"),
            next_billing_date=next_billing
        )
        logger.info(f"Payment success email sent to {current_user.email}")
    except Exception as email_error:
        logger.error(f"Failed to send payment success email: {email_error}")
        # Don't fail the payment if email fails
    
    # ... rest of code ...
"""


# ============================================================================
# EXAMPLE 3: SENDING EMAIL ON PAYMENT CANCELLED/FAILED
# ============================================================================
# Location: app/api/routes/payments.py - stripe_webhook handler

"""
elif event['type'] == 'checkout.session.expired':
    session_obj = event['data']['object']
    user_id = session_obj['metadata'].get('user_id')
    session_id = session_obj['id']
    
    # ... existing code ...
    
    # SEND PAYMENT CANCELLED EMAIL
    if user_id:
        try:
            # Get user details
            user_stmt = select(Profile).where(Profile.id == user_id)
            user_result = await db.execute(user_stmt)
            user = user_result.scalars().first()
            
            if user:
                await IMOMailService.send_payment_cancelled_email(
                    db=db,
                    user_email=user.email,
                    user_name=user.full_name,
                    transaction_id=session_id,
                    amount="$9.99",
                    plan_type="Premium Unlimited",
                    cancellation_date=datetime.utcnow().strftime("%B %d, %Y at %I:%M %p"),
                    reason="Checkout session expired"
                )
                logger.info(f"Payment cancelled email sent to {user.email}")
        except Exception as email_error:
            logger.error(f"Failed to send payment cancelled email: {email_error}")

elif event['type'] == 'charge.failed':
    charge = event['data']['object']
    user_id = charge['metadata'].get('user_id')
    transaction_id = charge['id']
    amount = charge['amount'] / 100
    
    # ... existing code ...
    
    # SEND PAYMENT FAILED EMAIL
    if user_id:
        try:
            user_stmt = select(Profile).where(Profile.id == user_id)
            user_result = await db.execute(user_stmt)
            user = user_result.scalars().first()
            
            if user:
                await IMOMailService.send_payment_cancelled_email(
                    db=db,
                    user_email=user.email,
                    user_name=user.full_name,
                    transaction_id=transaction_id,
                    amount=f"${amount:.2f}",
                    plan_type="Premium Unlimited",
                    cancellation_date=datetime.utcnow().strftime("%B %d, %Y at %I:%M %p"),
                    reason=charge.get('failure_message', 'Payment processing failed')
                )
                logger.info(f"Payment failed email sent to {user.email}")
        except Exception as email_error:
            logger.error(f"Failed to send payment failed email: {email_error}")
"""


# ============================================================================
# INTEGRATION CHECKLIST
# ============================================================================
"""
✅ NEW USER REGISTRATION EMAIL:
   - Triggered: When user signs up
   - Endpoint: POST /api/v1/auth/signup
   - Status: INTEGRATED
   - Template: imo_new_user_onboarding
   - File: app/api/routes/auth.py

✅ PAYMENT SUCCESS EMAIL:
   - Triggered: When payment is successful
   - Endpoint: POST /api/v1/payments/checkout-complete
   - Status: INTEGRATED
   - Template: imo_payment_success
   - File: app/api/routes/payments.py

✅ PAYMENT CANCELLED EMAIL:
   - Triggered: When payment is cancelled or failed
   - Webhook: checkout.session.expired, charge.failed
   - Endpoint: POST /api/v1/payments/webhook
   - Status: INTEGRATED
   - Template: imo_payment_cancelled
   - File: app/api/routes/payments.py
"""


# ============================================================================
# TESTING THE EMAIL INTEGRATION
# ============================================================================
"""
1. TEST NEW USER REGISTRATION EMAIL:
   POST /api/v1/auth/signup
   {
       "email": "test@example.com",
       "password": "TestPassword123",
       "full_name": "Test User"
   }
   
   Expected: Welcome email sent to test@example.com

2. TEST PAYMENT SUCCESS EMAIL:
   - Complete a Stripe checkout successfully
   - Check email for payment success confirmation
   
3. TEST PAYMENT CANCELLED EMAIL:
   - Cancel a checkout or let it expire
   - Check email for payment cancelled notification
"""


# ============================================================================
# EMAIL TEMPLATES AVAILABLE
# ============================================================================
"""
1. imo_new_user_onboarding
   - Subject: Welcome to IMO - AI That Reads Every Review! 🎯
   - Used for: New user registrations
   - Variables: user_name, user_email, has_trial, trial_days, signup_date

2. imo_payment_success
   - Subject: Payment Successful! Welcome to IMO Premium ✓
   - Used for: Successful payments
   - Variables: user_name, transaction_id, amount, plan_type, payment_date, next_billing_date

3. imo_payment_cancelled
   - Subject: Payment Cancelled - No Charges ⚠️
   - Used for: Failed/cancelled payments
   - Variables: user_name, transaction_id, amount, plan_type, cancellation_date, reason
"""


# ============================================================================
# TROUBLESHOOTING
# ============================================================================
"""
If emails are not sending:

1. Check email configuration in .env:
   - MAIL_USERNAME
   - MAIL_PASSWORD
   - MAIL_FROM
   - MAIL_SERVER
   - MAIL_PORT
   - MAIL_STARTTLS
   - MAIL_SSL_TLS

2. Verify templates are in database:
   python seed_imo_email_templates.py

3. Check logs for errors:
   - Look for "Failed to send" messages
   - Check IMOMailService error logs

4. Test email sending manually:
   python -m pytest tests/test_email_service.py

5. Check SMTP credentials:
   - Username and password are correct
   - App password (not account password) for Gmail
   - Less secure apps enabled for Gmail
"""


# ============================================================================
# EMAIL FLOW DIAGRAM
# ============================================================================
"""
USER REGISTRATION FLOW:
┌─────────────────────┐
│  User Signs Up      │
└──────────┬──────────┘
           │
           ├─→ AuthService.sign_up() ✓
           │
           └─→ IMOMailService.send_new_user_onboarding_email()
                  └─→ Render template from database
                  └─→ Send via FastMail (SMTP)
                  └─→ Email to user's inbox


PAYMENT SUCCESS FLOW:
┌──────────────────────┐
│  Stripe Webhook:     │
│ checkout.session.    │
│ completed            │
└──────────┬───────────┘
           │
           ├─→ StripeService.handle_checkout_complete() ✓
           │
           └─→ IMOMailService.send_payment_success_email()
                  └─→ Render template from database
                  └─→ Send via FastMail (SMTP)
                  └─→ Email to user's inbox


PAYMENT CANCELLED FLOW:
┌──────────────────────┐
│  Stripe Webhook:     │
│ checkout.session.    │
│ expired OR           │
│ charge.failed        │
└──────────┬───────────┘
           │
           ├─→ StripeService.create_or_update_payment_transaction() ✓
           │
           └─→ IMOMailService.send_payment_cancelled_email()
                  └─→ Render template from database
                  └─→ Send via FastMail (SMTP)
                  └─→ Email to user's inbox
"""
