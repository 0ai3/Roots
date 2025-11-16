# Newsletter System Documentation

## Overview
Complete newsletter subscription system for Roots application with Gmail integration.

## Features
- ✅ Newsletter subscription with welcome email
- ✅ Beautiful HTML email templates
- ✅ Unsubscribe functionality
- ✅ Admin notifications for new subscriptions/unsubscriptions
- ✅ Responsive signup component
- ✅ Error handling and validation

## Setup

### 1. Environment Variables (Already Configured)
Your `.env` file already contains:
```env
GMAIL_USER=sp1rlet.hey@gmail.com
GMAIL_APP_PASSWORD=yfnkclyxypigitem
GMAIL_CLIENT_ID=240826695438-rqjopssic0n503o7n71577a02pa9gqa7.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=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
```

### 2. Optional: Add App URL
Add to `.env` for production:
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Files Created

### API Routes
1. **`/app/api/newsletter/subscribe/route.ts`**
   - Handles newsletter subscriptions
   - Sends welcome email to subscriber
   - Sends notification to admin
   - POST endpoint: `/api/newsletter/subscribe`
   - Body: `{ email: string, name?: string }`

2. **`/app/api/newsletter/unsubscribe/route.ts`**
   - Handles unsubscribe requests
   - Sends goodbye email
   - Sends notification to admin
   - POST endpoint: `/api/newsletter/unsubscribe`
   - Body: `{ email: string }`

### Components
3. **`/app/components/NewsletterSignup.tsx`**
   - Newsletter signup form component
   - Can be used anywhere in the app
   - Handles form state and API calls
   - Success/error states with animations

### Pages
4. **`/app/unsubscribe/page.tsx`**
   - Dedicated unsubscribe page
   - Accessible at `/unsubscribe`
   - Auto-fills email from URL parameter
   - Example: `/unsubscribe?email=user@example.com`

## Usage

### Using the Signup Component
Already added to your landing page! You can also add it to other pages:

```tsx
import NewsletterSignup from "@/app/components/NewsletterSignup";

export default function YourPage() {
  return (
    <div>
      <NewsletterSignup />
    </div>
  );
}
```

### API Endpoints

#### Subscribe
```javascript
const response = await fetch('/api/newsletter/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe' // optional
  })
});
```

#### Unsubscribe
```javascript
const response = await fetch('/api/newsletter/unsubscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com'
  })
});
```

## Email Templates

### Welcome Email Features
- 🎨 Beautiful gradient design with lime theme
- 📱 Responsive for all devices
- ✨ Highlights key benefits:
  - Authentic Recipes
  - Cultural Stories
  - Hidden Gems
  - Interactive Challenges
- 🔗 Call-to-action button to dashboard
- 📧 Unsubscribe link in footer

### Unsubscribe Email
- Simple confirmation message
- Resubscribe link
- Clean, minimal design

## Gmail Configuration

Your Gmail account is already configured with:
- App Password for SMTP authentication
- OAuth 2.0 credentials (Client ID & Secret)

**Important:** Make sure 2-Step Verification is enabled on your Gmail account for App Passwords to work.

## Admin Notifications

You'll receive emails at `sp1rlet.hey@gmail.com` for:
- New subscriptions (with subscriber email and name)
- Unsubscribe requests (with timestamp)

## Testing

### Test Subscription
1. Go to your homepage
2. Scroll to the newsletter section
3. Enter email and optional name
4. Click "Subscribe to Newsletter"
5. Check your inbox for welcome email
6. Check admin email for notification

### Test Unsubscribe
1. Visit `/unsubscribe` or click unsubscribe link in email
2. Enter email address
3. Click "Unsubscribe"
4. Check inbox for confirmation

## Customization

### Modify Email Templates
Edit the HTML in:
- `/app/api/newsletter/subscribe/route.ts` (lines 32-175)
- `/app/api/newsletter/unsubscribe/route.ts` (lines 32-90)

### Change Colors
Current theme: Lime (#84cc16)
To change:
1. Update gradient colors in email templates
2. Update component styles in `NewsletterSignup.tsx`

### Add More Features
Consider adding:
- MongoDB integration to store subscribers
- Email preferences/categories
- Send actual newsletters endpoint
- Analytics tracking
- GDPR compliance features

## Troubleshooting

### Emails Not Sending
1. Check environment variables are loaded
2. Verify Gmail App Password is correct
3. Ensure 2-Step Verification is enabled
4. Check console logs for errors

### 401 Authentication Error
- Regenerate Gmail App Password
- Update `GMAIL_APP_PASSWORD` in `.env`

### Rate Limiting
Gmail has sending limits:
- 500 emails/day for free accounts
- 2,000 emails/day for Google Workspace

## Security Notes

⚠️ **Important Security Practices:**
1. Never commit `.env` files to git
2. Keep App Password secure
3. Use environment variables in production
4. Implement rate limiting for production
5. Add CAPTCHA for public forms
6. Validate email addresses server-side

## Next Steps

1. ✅ Test the subscription flow
2. ✅ Test the unsubscribe flow
3. 📝 Consider adding database storage for subscribers
4. 📊 Add analytics tracking
5. 🔒 Add CAPTCHA protection
6. 📧 Create actual newsletter sending functionality
7. 🎨 Customize email templates to your brand

## Support

For issues or questions:
- Check console logs for errors
- Verify environment variables
- Test with different email providers
- Check Gmail SMTP settings

---

Built with ❤️ for Roots - Connecting Cultures, Preserving Heritage
