"""Seed initial email templates into the database."""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import init_db, AsyncSessionLocal
from app.models.email_template import EmailTemplate
from sqlalchemy import select


async def seed_templates():
    """Seed initial email templates."""
    await init_db()
    
    async with AsyncSessionLocal() as session:
        try:
            # Read template files
            templates_dir = Path(__file__).parent / "app" / "templates" / "email"
            
            templates_data = [
                {
                    "name": "payment_success",
                    "subject": "Payment Successful - Transaction {{ transaction_id }}",
                    "description": "Email sent when a payment is successfully processed",
                    "file": "payment_success.html"
                },
                {
                    "name": "payment_cancelled",
                    "subject": "Payment Cancelled - Transaction {{ transaction_id }}",
                    "description": "Email sent when a payment is cancelled",
                    "file": "payment_cancelled.html"
                },
                {
                    "name": "new_user_onboarding",
                    "subject": "Welcome to Our Platform, {{ user_name|default('there') }}!",
                    "description": "Welcome email sent to new users after signup",
                    "file": "new_user_onboarding.html"
                }
            ]
            
            for template_info in templates_data:
                # Check if template already exists
                result = await session.execute(
                    select(EmailTemplate).where(EmailTemplate.name == template_info["name"])
                )
                existing = result.scalars().first()
                
                if existing:
                    print(f"Template '{template_info['name']}' already exists, skipping...")
                    continue
                
                # Read template file
                template_file = templates_dir / template_info["file"]
                if not template_file.exists():
                    print(f"Warning: Template file {template_file} not found, skipping...")
                    continue
                
                body_html = template_file.read_text(encoding="utf-8")
                
                # Create template
                template = EmailTemplate(
                    name=template_info["name"],
                    subject=template_info["subject"],
                    body_html=body_html,
                    body_text=None,  # Can be added later if needed
                    description=template_info["description"],
                    is_active=True
                )
                
                session.add(template)
                print(f"Created template: {template_info['name']}")
            
            await session.commit()
            print("\n✅ Email templates seeded successfully!")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Error seeding templates: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(seed_templates())

