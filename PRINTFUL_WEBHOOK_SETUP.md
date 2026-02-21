# Printful Webhook Setup for Shipping Notifications

This guide will help you set up automatic shipping notification emails to customers when Printful ships their orders.

## How It Works

1. When a customer places an order, it's saved to Firestore with their email address
2. When Printful ships the order, they send a webhook to your server
3. Your server looks up the customer email and sends them a shipping notification email
4. The customer receives an email with tracking information

## Step 1: Set Up Resend (Email Service)

### 1.1 Create Resend Account
1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account (free tier includes 3,000 emails/month)
3. Verify your email address

### 1.2 Get API Key
1. Go to [Resend API Keys](https://resend.com/api-keys)
2. Click **"Create API Key"**
3. Give it a name (e.g., "Average Dad Athletics")
4. Copy the API key (starts with `re_...`)

### 1.3 Verify Your Domain (Recommended)
1. Go to [Resend Domains](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter your domain (e.g., `averagedadathletics.com`)
4. Follow the DNS setup instructions to verify your domain
5. Once verified, you can send from `noreply@averagedadathletics.com`

**Note:** If you don't verify a domain, you can use Resend's test domain, but emails may go to spam.

## Step 2: Configure Environment Variables

### 2.1 Local Development (.env.local)
Add these to your `.env.local` file:

```env
# Resend Email Configuration
RESEND_API_KEY=re_your-resend-api-key-here
RESEND_FROM_EMAIL=Average Dad Athletics <noreply@averagedadathletics.com>

# Printful Webhook Secret (optional but recommended)
PRINTFUL_WEBHOOK_SECRET=your-printful-webhook-secret
```

### 2.2 Production (Vercel)
1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add the variables above
4. Make sure to set them for **Production**, **Preview**, and **Development** environments

## Step 3: Set Up Printful Webhook

### 3.1 Get Your Webhook URL
Your webhook URL will be:
- **Production**: `https://yourdomain.com/api/printful/webhook`
- **Local Testing**: Use a tool like [ngrok](https://ngrok.com) to expose your local server

### 3.2 Configure Webhook in Printful
1. Go to [Printful Dashboard](https://www.printful.com/dashboard)
2. Navigate to **Settings** > **Webhooks**
3. Click **"Add Webhook"** or **"Create Webhook"**
4. Enter your webhook URL: `https://yourdomain.com/api/printful/webhook`
5. Select the event: **"Package Shipped"**
6. (Optional) Copy the webhook secret if provided
7. Click **"Save"** or **"Create"**

### 3.3 Test the Webhook
1. Place a test order
2. Wait for Printful to ship it (or manually mark it as shipped in Printful dashboard)
3. Check your server logs to see if the webhook was received
4. Check the customer's email inbox for the shipping notification

## Step 4: Verify It's Working

### 4.1 Check Server Logs
When an order ships, you should see logs like:
```
📦 Printful webhook received: { type: 'package_shipped', ... }
✅ Shipping notification email sent to: customer@example.com
✅ Order status updated in Firestore
```

### 4.2 Check Customer Email
The customer should receive an email with:
- Order number
- List of items
- Tracking number (if available)
- Tracking URL (if available)
- Carrier information

### 4.3 Check Firestore
The order document in Firestore should be updated with:
- `status: 'shipped'`
- `shippedAt: timestamp`
- `trackingNumber: '...'`
- `trackingUrl: '...'`
- `carrier: '...'`

## Troubleshooting

### No Email Received
1. **Check Resend Dashboard**
   - Go to [Resend Emails](https://resend.com/emails)
   - See if the email was sent and if there were any errors

2. **Check Spam Folder**
   - Shipping notification emails might go to spam
   - Ask customers to check their spam/junk folder

3. **Verify API Key**
   - Make sure `RESEND_API_KEY` is set correctly
   - Check that it's the right key (not expired or revoked)

4. **Check From Email**
   - Make sure `RESEND_FROM_EMAIL` is a verified domain in Resend
   - Or use Resend's test domain for development

### Webhook Not Received
1. **Check Webhook URL**
   - Make sure the URL is correct in Printful dashboard
   - Verify it's accessible (not blocked by firewall)

2. **Check Server Logs**
   - Look for webhook requests in your server logs
   - Check for any errors

3. **Test Webhook Manually**
   - Use a tool like [Postman](https://www.postman.com) to send a test webhook
   - Or use Printful's webhook test feature (if available)

### Order Not Found
1. **Check External ID**
   - Make sure orders are being saved to Firestore with `printfulExternalId`
   - Verify the external ID matches what Printful sends

2. **Check Printful Order ID**
   - If external ID doesn't match, the system tries to find by Printful order ID
   - Make sure `printfulOrderId` is saved correctly

### Email Service Errors
1. **Check Resend Limits**
   - Free tier: 3,000 emails/month
   - Check if you've exceeded the limit

2. **Check API Key Permissions**
   - Make sure the API key has permission to send emails
   - Check if the key is restricted to specific domains

## Email Template Customization

The email template is in `lib/email-helpers.ts`. You can customize:
- Email subject
- HTML template
- Text template
- Branding colors
- Company information

## Security Notes

- **Webhook Secret**: If Printful provides a webhook secret, set `PRINTFUL_WEBHOOK_SECRET` to verify webhook authenticity
- **API Key Security**: Never commit your Resend API key to git
- **Domain Verification**: Always verify your domain in Resend to avoid spam issues

## Need Help?

If you're having issues:
1. Check server logs for detailed error messages
2. Check Resend dashboard for email delivery status
3. Verify all environment variables are set correctly
4. Test the webhook manually to see if it's being received
