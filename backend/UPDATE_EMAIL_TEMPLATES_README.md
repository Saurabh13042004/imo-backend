# Email Template Update Script

## Overview
This script updates all email templates in the database with the new professional versions. It reads the HTML templates from files and syncs them to the database.

## Files Included
- `update_email_templates.py` - Main update script
- Templates directory: `app/templates/email/`
  - `imo_new_user_onboarding.html`
  - `imo_payment_success.html`
  - `imo_payment_cancelled.html`
  - `imo_price_alert.html`
  - `imo_password_reset.html`

## New Design Features
✓ **Professional Color Scheme**: Dark navy (#003d99) and charcoal (#1a1a1a)  
✓ **Minimal & Clean**: Removed all colorful gradients and emojis  
✓ **Logo Integration**: IMO logo (https://d3tmtixqwd7vky.cloudfront.net/logo.jpg)  
✓ **Corporate Typography**: Professional fonts and sizing  
✓ **Optimized Spacing**: Clean, readable layouts  

## Usage

### Option 1: Direct Python Execution
```bash
cd backend
python update_email_templates.py
```

### Option 2: From Project Root
```bash
python backend/update_email_templates.py
```

### Option 3: With Logging Output
```bash
# On Windows (PowerShell)
python backend/update_email_templates.py 2>&1 | Tee-Object -FilePath update_log.txt

# On Linux/Mac
python backend/update_email_templates.py | tee update_log.txt
```

## Database Connection
The script uses the existing database configuration from:
- `app.database` module (AsyncSessionLocal)
- Environment variables for database credentials

Ensure the following are configured:
- `DATABASE_URL` or `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Database must be accessible and running

## What It Does

1. **Connects to Database**: Uses AsyncSessionLocal to establish connection
2. **Reads Templates**: Loads HTML files from `app/templates/email/`
3. **Updates Existing**: If template exists, updates with new HTML and subject
4. **Activates**: Ensures all templates are marked as active
5. **Commits**: Saves all changes to database
6. **Verifies**: Lists all templates and their status

## Output Example
```
======================================================================
Starting email template update...
======================================================================

Processing: imo_new_user_onboarding
Reading template from: /path/to/imo_new_user_onboarding.html
✓ Read imo_new_user_onboarding.html (8532 bytes)
✓ Updated: imo_new_user_onboarding

Processing: imo_payment_success
✓ Read imo_payment_success.html (7821 bytes)
✓ Updated: imo_payment_success

...

======================================================================
UPDATE SUMMARY
======================================================================
✓ Successfully updated: 5 template(s)
✗ Failed: 0 template(s)

Verifying database state:
✓ ACTIVE | imo_new_user_onboarding    | 8532 bytes
✓ ACTIVE | imo_payment_success        | 7821 bytes
✓ ACTIVE | imo_payment_cancelled      | 6543 bytes
✓ ACTIVE | imo_price_alert            | 8234 bytes
✓ ACTIVE | imo_password_reset         | 5432 bytes

======================================================================
✅ Email template update completed successfully!
======================================================================
```

## Error Handling
The script includes comprehensive error handling:
- **File Not Found**: Logs warning and skips that template
- **Database Connection**: Raises exception with details
- **Update Failures**: Rolls back changes and logs errors
- **Exit Code**: Returns 1 on failure, 0 on success

## Troubleshooting

### "Template file not found"
- Ensure you're running from the `backend/` directory
- Check that HTML files exist in `app/templates/email/`

### "Database connection failed"
- Verify database is running
- Check DATABASE_URL environment variable
- Ensure credentials are correct

### "No module named 'app'"
- Run from `backend/` directory
- Ensure Python path includes project root

## Rollback
If something goes wrong:
1. Check the database for template changes
2. Can manually revert in database if needed
3. Run the original `seed_imo_email_templates.py` if full reset needed

## Next Steps
After running the update:
1. ✅ Verify templates in database
2. ✅ Send test emails to confirm rendering
3. ✅ Check email client compatibility (Outlook, Gmail, etc.)
4. ✅ Monitor email delivery metrics

## Support
For issues or questions:
- Check logs for detailed error messages
- Verify file permissions on template files
- Test database connection separately
