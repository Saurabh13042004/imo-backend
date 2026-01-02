"""Update script to refresh email templates in the database with new professional versions."""

import asyncio
import logging
from pathlib import Path
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.email_template import EmailTemplate

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Template configurations
TEMPLATES = [
    {
        "name": "imo_new_user_onboarding",
        "subject": "Welcome to IMO - Smart Shopping Made Simple",
        "description": "Sent to new users after signup. Includes trial activation and feature overview.",
        "file": "imo_new_user_onboarding.html"
    },
    {
        "name": "imo_payment_success",
        "subject": "Payment Successful - Welcome to IMO Premium",
        "description": "Sent after successful payment. Includes receipt and premium features list.",
        "file": "imo_payment_success.html"
    },
    {
        "name": "imo_payment_cancelled",
        "subject": "Payment Cancelled - No Charges Made",
        "description": "Sent when payment is cancelled. Reassures user and offers retry option.",
        "file": "imo_payment_cancelled.html"
    },
    {
        "name": "imo_price_alert",
        "subject": "Price Alert Active - We'll Monitor {{ product_name }}",
        "description": "Sent when user creates a price alert. Includes product, current price, and target price.",
        "file": "imo_price_alert.html"
    },
    {
        "name": "imo_password_reset",
        "subject": "Reset Your IMO Password",
        "description": "Sent when user requests password reset. Includes reset link valid for 24 hours.",
        "file": "imo_password_reset.html"
    }
]


async def read_template_file(filename: str) -> str:
    """Read template HTML file."""
    template_path = Path(__file__).parent / "app" / "templates" / "email" / filename
    if not template_path.exists():
        raise FileNotFoundError(f"Template file not found: {template_path}")
    
    logger.debug(f"Reading template from: {template_path}")
    with open(template_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    logger.info(f"✓ Read {filename} ({len(content)} bytes)")
    return content


async def update_email_templates():
    """Update email templates in the database with new versions."""
    async with AsyncSessionLocal() as session:
        try:
            logger.info("=" * 70)
            logger.info("Starting email template update...")
            logger.info("=" * 70)
            
            updated_count = 0
            failed_count = 0
            
            for template_config in TEMPLATES:
                name = template_config["name"]
                logger.info(f"\nProcessing: {name}")
                
                try:
                    # Check if template exists
                    result = await session.execute(
                        select(EmailTemplate).where(EmailTemplate.name == name)
                    )
                    existing = result.scalars().first()
                    
                    if not existing:
                        logger.warning(f"  ⚠ Template '{name}' not found in database (skipping)")
                        continue
                    
                    # Read new HTML template
                    body_html = await read_template_file(template_config["file"])
                    
                    # Update template
                    existing.subject = template_config["subject"]
                    existing.body_html = body_html
                    existing.description = template_config["description"]
                    existing.is_active = True
                    
                    # Merge changes
                    await session.merge(existing)
                    logger.info(f"  ✓ Updated: {name}")
                    updated_count += 1
                    
                except FileNotFoundError as e:
                    logger.error(f"  ✗ File not found: {e}")
                    failed_count += 1
                except Exception as e:
                    logger.error(f"  ✗ Error updating template: {e}", exc_info=True)
                    failed_count += 1
            
            # Commit changes
            logger.info("\nCommitting changes to database...")
            await session.commit()
            
            # Print summary
            logger.info("\n" + "=" * 70)
            logger.info("UPDATE SUMMARY")
            logger.info("=" * 70)
            logger.info(f"✓ Successfully updated: {updated_count} template(s)")
            logger.info(f"✗ Failed: {failed_count} template(s)")
            
            # Verify and display updated templates
            logger.info("\nVerifying database state:")
            result = await session.execute(select(EmailTemplate))
            templates = result.scalars().all()
            
            for template in templates:
                status = "✓ ACTIVE" if template.is_active else "✗ INACTIVE"
                html_size = len(template.body_html) if template.body_html else 0
                logger.info(f"  {status} | {template.name:<30} | {html_size:>8} bytes")
            
            logger.info("\n" + "=" * 70)
            logger.info("✅ Email template update completed successfully!")
            logger.info("=" * 70)
            
            return updated_count, failed_count
            
        except Exception as e:
            logger.error(f"❌ Error during update: {e}", exc_info=True)
            await session.rollback()
            raise


async def main():
    """Main entry point."""
    try:
        updated, failed = await update_email_templates()
        
        if failed > 0:
            exit(1)
        
    except Exception as e:
        logger.error(f"❌ Update failed: {e}")
        exit(1)


if __name__ == "__main__":
    asyncio.run(main())
