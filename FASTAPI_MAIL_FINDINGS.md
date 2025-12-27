# FastAPI-Mail MessageSchema Documentation & Plain Text Email Handling

## Summary
Based on comprehensive workspace analysis of the IMO backend implementation, here are the findings about `MessageSchema` from `fastapi_mail` and how to properly handle plain text emails.

---

## 1. MessageSchema Valid Fields

### Standard Fields Accepted by MessageSchema:
```python
MessageSchema(
    subject: str,              # Email subject line
    recipients: List[str] | List[NameEmail],  # Email recipients
    body: str,                 # HTML or plain text body (primary content)
    subtype: MessageType,      # MessageType.html or MessageType.plain
    body_text: Optional[str],  # Plain text alternative body (optional)
    cc: Optional[List[str]],   # Carbon copy recipients (optional)
    bcc: Optional[List[str]],  # Blind carbon copy recipients (optional)
    reply_to: Optional[str],   # Reply-to address (optional)
    attachments: Optional[List] # File attachments (optional)
)
```

### Key Points:
- **`body`**: The main email body content. Type depends on `subtype` parameter.
- **`subtype`**: Controls how body is interpreted:
  - `MessageType.html` - body is treated as HTML
  - `MessageType.plain` - body is treated as plain text
- **`body_text`**: Optional alternative text version of the email (for multipart/alternative emails)
- **Recipients can be**: Plain email strings `"user@example.com"` OR `NameEmail` objects `NameEmail(name="John", email="john@example.com")`

---

## 2. How to Send Plain Text Emails

### Method 1: Plain Text Only (Simple)
```python
from fastapi_mail import MessageSchema, MessageType

message = MessageSchema(
    subject="Hello",
    recipients=["user@example.com"],
    body="This is plain text email content",
    subtype=MessageType.plain  # Key: set subtype to plain
)

await fm.send_message(message)
```

### Method 2: HTML with Plain Text Alternative (Recommended)
```python
message = MessageSchema(
    subject="Hello",
    recipients=["user@example.com"],
    body="<h1>Hello</h1><p>This is HTML content</p>",
    subtype=MessageType.html,
    body_text="Hello\n\nThis is HTML content"  # Plain text alternative
)

await fm.send_message(message)
```

This sends a **multipart/alternative** email that includes both HTML and plain text versions, allowing email clients to choose which to display.

### Method 3: With Named Recipients
```python
from fastapi_mail import NameEmail

recipients = [
    NameEmail(name="John Doe", email="john@example.com"),
    NameEmail(name="Jane Smith", email="jane@example.com")
]

message = MessageSchema(
    subject="Hello",
    recipients=recipients,
    body="Email content",
    subtype=MessageType.html
)

await fm.send_message(message)
```

---

## 3. Implementation in Your Codebase

### Current Implementation Location
The implementation is in [app/services/mail_service.py](../app/services/mail_service.py):

```python
async def send_email(
    recipients: List[str],
    subject: str,
    body_html: str,
    body_text: Optional[str] = None,
    recipients_with_names: Optional[List[NameEmail]] = None
) -> bool:
    """Send email using FastMail."""
    try:
        if recipients_with_names:
            recipient_list = recipients_with_names
        else:
            recipient_list = recipients
        
        message = MessageSchema(
            subject=subject,
            recipients=recipient_list,
            body=body_html,
            subtype=MessageType.html  # HTML emails with optional plain text
        )
        
        if body_text:
            message.body_text = body_text  # Add plain text alternative
        
        await fm.send_message(message)
        return True
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False
```

### Database Model Support
The [EmailTemplate model](../app/models/email_template.py) includes:
```python
body_html: Column(Text, nullable=False)   # Jinja2 template (HTML)
body_text: Column(Text, nullable=True)    # Plain text version (optional)
```

### Usage in Template Service
The [send_templated_email](../app/services/mail_service.py#L119) function:
1. Retrieves template from database
2. Renders both `body_html` and `body_text` with Jinja2 context
3. Calls `send_email()` with both bodies
4. Results in multipart/alternative emails

---

## 4. Alternative/Plain Text Field Naming

### In FastAPI-Mail:
- **NOT** `alternative_body` 
- **NOT** `body_text_alternative`
- **IS** `body_text` ✓

### Assignment Pattern:
```python
# Direct attribute assignment after creation
message = MessageSchema(...)
message.body_text = "plain text version"

# Or pass during initialization (some versions)
message = MessageSchema(body_text="plain text version", ...)
```

---

## 5. Multipart Email Structure

When you provide both `body` (HTML) and `body_text`:
```
From: sender@example.com
To: recipient@example.com
Subject: Test
Content-Type: multipart/alternative; boundary="boundary123"

--boundary123
Content-Type: text/plain; charset="utf-8"

Plain text version here
--boundary123
Content-Type: text/html; charset="utf-8"

<h1>HTML version here</h1>
--boundary123--
```

Email clients will display the HTML version by default, falling back to plain text if needed.

---

## 6. Current Codebase Email Features

### Admin Email API ([admin_email.py](../app/api/routes/admin_email.py#L78))
Supports both template-based and custom emails:

```python
class SendEmailRequest(BaseModel):
    template_name: Optional[str]          # Use existing template
    recipients: List[EmailStr]            # Recipients
    subject: Optional[str]                # Custom subject
    body_html: Optional[str]              # Custom HTML
    body_text: Optional[str]              # Custom plain text
    context: Optional[Dict[str, Any]]     # Template variables
    recipients_with_names: Optional[List] # Named recipients
```

### Email Templates Created/Used
- `imo_new_user_onboarding` - Welcome email
- `imo_payment_success` - Payment confirmation
- `imo_payment_cancelled` - Payment cancellation
- `imo_price_alert` - Price alert notification

Each template includes optional `body_text` field for plain text alternatives.

---

## 7. FastAPI-Mail Version Info

From [requirements.txt](../requirements.txt):
- **Package**: `fastapi-mail`
- **Version**: Not pinned (latest compatible version)
- This codebase uses the modern async/await API

---

## Quick Reference Table

| Feature | Support | Implementation |
|---------|---------|-----------------|
| HTML emails | ✓ | `body=html_content, subtype=MessageType.html` |
| Plain text emails | ✓ | `body=text_content, subtype=MessageType.plain` |
| Multipart (HTML + Text) | ✓ | `body=html, body_text=plaintext, subtype=MessageType.html` |
| Named recipients | ✓ | `recipients=[NameEmail(...), ...]` |
| Email strings | ✓ | `recipients=["user@example.com", ...]` |
| CC/BCC | ✓ | `cc=[], bcc=[]` |
| Attachments | ✓ | `attachments=[]` |
| Jinja2 templates | ✓ | Via custom rendering + database |

---

## Recommendations

1. **Always provide `body_text`** for important emails to ensure compatibility with:
   - Text-only email clients
   - Screen readers
   - Email forwarding
   - Plain text preferences

2. **Current implementation is correct** - Your codebase properly:
   - Accepts optional `body_text` parameter
   - Sets `message.body_text` when provided
   - Supports multipart emails

3. **For database templates**, consider:
   - Auto-generating `body_text` from `body_html` if not provided
   - Or requiring both fields for important notifications

4. **Use `NameEmail`** objects when you have recipient names to display nicely as:
   - "John Doe <john@example.com>" instead of just "john@example.com"
