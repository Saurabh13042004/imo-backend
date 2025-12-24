# Create Admin User - Quick Start Guide

## Overview
This script creates an admin user in the IMO database with the following credentials:
- **Email**: admin@imo.com
- **Password**: admin@123
- **Role**: admin
- **Subscription**: premium

## Prerequisites
Make sure you have:
1. Database running (PostgreSQL)
2. All Python dependencies installed
3. `.env` file configured with `DATABASE_URL`

## Usage

### Option 1: Direct Python (Recommended for Docker)
```bash
# From the backend directory
cd backend

# Run the script
python create_admin_user.py
```

### Option 2: From Docker Container
```bash
# If running in Docker Compose
docker-compose exec api python create_admin_user.py
```

### Option 3: Using Poetry
```bash
cd backend
poetry run python create_admin_user.py
```

## Expected Output
```
🔧 IMO Admin User Creation Script
==================================================

✅ Admin user created successfully!

📋 Admin User Details:
==================================================
Email:           admin@imo.com
Password:        admin@123
User ID:         [UUID]
Subscription:    premium
Access Level:    admin
Role:            admin
==================================================

🔐 Login at: https://yourdomain.com/auth
🎛️  Access admin panel at: https://yourdomain.com/admin
```

## What It Does

### Step 1: Checks for Existing Admin
- Verifies admin@imo.com doesn't already exist
- Prevents duplicate admin accounts

### Step 2: Creates Profile
- Email: admin@imo.com
- Full name: Admin User
- Password: Securely hashed using bcrypt
- Subscription tier: premium
- Access level: admin

### Step 3: Creates Admin Role
- Links the Profile to "admin" role
- Enables admin panel access

### Step 4: Verification
- Confirms user was created
- Displays admin credentials

## Accessing the Admin Panel

1. **Login**:
   - Go to `/auth`
   - Enter email: `admin@imo.com`
   - Enter password: `admin@123`

2. **Navigate to Admin**:
   - Once logged in, visit `/admin`
   - Full dashboard with stats, users, subscriptions, URLs

## Security Notes

⚠️ **IMPORTANT**: 
- Change the admin password after first login
- Don't share these credentials
- Use strong, unique passwords in production
- Consider using OAuth/SSO for additional security

## Troubleshooting

### "Admin user already exists"
The admin user is already in the database. To reset:
```sql
-- Delete existing admin role
DELETE FROM user_roles WHERE role = 'admin';

-- Delete admin user
DELETE FROM profiles WHERE email = 'admin@imo.com';
```

### "Database connection error"
Check:
- Database is running
- DATABASE_URL in .env is correct
- PostgreSQL service is accessible

### "Import errors"
Make sure:
- You're in the `/backend` directory
- All dependencies are installed
- Python 3.11+ is being used

## Additional Admin Users

To create more admin users, modify the script:
```python
# Change these lines
admin_user = Profile(
    id=admin_id,
    email="another_admin@imo.com",  # Change this
    full_name="Another Admin",       # Change this
    password_hash=hash_password("secure_password"),  # Change this
    subscription_tier="premium",
    access_level="admin",
)
```

## Environment Variables

Make sure these are set in your `.env`:
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost/imo_db
```

## Support

If you encounter issues:
1. Check database connection
2. Verify .env configuration
3. Review console output for error messages
4. Check database logs

---

**Script Location**: `backend/create_admin_user.py`
**Last Updated**: 2024-12-24
