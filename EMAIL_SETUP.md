# Email Setup Guide

To fix the email not sending issue, you need to configure the following environment variables:

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here

# Gym Information
GYM_EMAIL=your_gym_email@gmail.com
GYM_NAME=Your Gym Name
GYM_CONTACT=+1234567890
GYM_ADDRESS=Your Gym Address
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `SMTP_PASS`

## Alternative Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

### Custom SMTP Server
```env
SMTP_HOST=your_smtp_server.com
SMTP_PORT=587
```

## Testing Email Configuration

After setting up the environment variables:

1. Restart your development server
2. Check the console logs for email configuration status
3. Try creating a new BMI record to trigger email sending
4. Check the console for detailed error messages

## Common Issues

1. **"Authentication failed"**: Check your SMTP credentials
2. **"Connection timeout"**: Check your SMTP host and port
3. **"Missing environment variables"**: Ensure all required variables are set
4. **"Email not found"**: Make sure the member has a valid email address

## Debug Information

The application now includes detailed logging. Check your console for:
- Email configuration status
- PDF generation progress
- SMTP connection verification
- Detailed error messages 