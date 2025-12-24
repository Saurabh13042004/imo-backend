#!/usr/bin/env python3
"""
Script to create an admin user in the database.

Usage:
    python create_admin_user.py

This script will:
1. Create a Profile with email: admin@imo.com
2. Create a UserRole entry with role: admin
3. Hash the password securely
"""

import asyncio
import sys
from uuid import uuid4

# Add backend to path
sys.path.insert(0, '/app')

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.models import Base
from app.models.user import Profile, UserRole
from app.utils.auth import hash_password
from app.config import settings


async def create_admin_user():
    """Create an admin user with predefined credentials."""
    
    # Create async engine
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        future=True,
    )
    
    # Create session factory
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        try:
            # Check if admin user already exists
            stmt = select(Profile).where(Profile.email == "admin@imo.com")
            result = await session.execute(stmt)
            existing_user = result.scalars().first()
            
            if existing_user:
                print("❌ Admin user already exists!")
                print(f"   Email: {existing_user.email}")
                print(f"   ID: {existing_user.id}")
                return False
            
            # Create admin profile
            admin_id = uuid4()
            admin_user = Profile(
                id=admin_id,
                email="admin@imo.com",
                full_name="Admin User",
                password_hash=hash_password("admin@123"),
                subscription_tier="premium",
                access_level="admin",
            )
            
            session.add(admin_user)
            await session.flush()  # Flush to get the ID
            
            # Create admin role
            admin_role = UserRole(
                user_id=admin_id,
                role="admin",
            )
            
            session.add(admin_role)
            
            # Commit the transaction
            await session.commit()
            
            print("✅ Admin user created successfully!")
            print()
            print("📋 Admin User Details:")
            print("=" * 50)
            print(f"Email:           admin@imo.com")
            print(f"Password:        admin@123")
            print(f"User ID:         {admin_id}")
            print(f"Subscription:    premium")
            print(f"Access Level:    admin")
            print(f"Role:            admin")
            print("=" * 50)
            print()
            print("🔐 Login at: https://yourdomain.com/auth")
            print("🎛️  Access admin panel at: https://yourdomain.com/admin")
            print()
            
            return True
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Error creating admin user: {e}")
            import traceback
            traceback.print_exc()
            return False
        finally:
            await engine.dispose()


async def verify_admin_user():
    """Verify that the admin user was created successfully."""
    
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        future=True,
    )
    
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        try:
            # Check if admin user exists
            stmt = select(Profile).where(Profile.email == "admin@imo.com")
            result = await session.execute(stmt)
            admin_user = result.scalars().first()
            
            if not admin_user:
                print("❌ Admin user not found!")
                return False
            
            # Check if admin role exists
            from sqlalchemy import and_
            role_stmt = select(UserRole).where(
                and_(
                    UserRole.user_id == admin_user.id,
                    UserRole.role == "admin"
                )
            )
            role_result = await session.execute(role_stmt)
            admin_role = role_result.scalars().first()
            
            if not admin_role:
                print("❌ Admin role not found!")
                return False
            
            print("✅ Admin user verified!")
            print(f"   Email: {admin_user.email}")
            print(f"   Name: {admin_user.full_name}")
            print(f"   Role: {admin_role.role}")
            return True
            
        except Exception as e:
            print(f"❌ Error verifying admin user: {e}")
            return False
        finally:
            await engine.dispose()


async def main():
    """Main entry point."""
    print()
    print("🔧 IMO Admin User Creation Script")
    print("=" * 50)
    print()
    
    # Create admin user
    success = await create_admin_user()
    
    if success:
        print("⏳ Verifying admin user creation...")
        print()
        await verify_admin_user()
    else:
        print("⚠️  Failed to create admin user")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
