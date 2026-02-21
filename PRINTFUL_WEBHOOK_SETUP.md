# Printful Webhook Setup for Shipping Notifications

This guide will help you set up automatic shipping notification emails to customers when Printful ships their orders.

## How It Works

1. When a customer places an order, it's saved to Firestore with their email address
2. When Printful ships the order, they send a webhook to your server
3. Your server looks up the customer email and sends them a shipping notification email
4. The customer receives an email with tracking information

## Prerequisites

**Important:** This feature requires Firebase Admin SDK to be configured. If you see "Database not configured" errors, you need to set up Firebase Admin SDK first.

### Set Up Firebase Admin SDK (Required)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **"Generate New Private Key"**
5. Download the JSON file
6. Extract these values from the JSON:
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
7. Add to your `.env.local`:
   ```env
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   ```
8. **Important:** Keep the `\n` characters in the private key - they represent newlines
9. Add the same variables to Vercel environment variables for production

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
5. Once verified, you can send from `no-reply@averagedadathletics.com`

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

**Option A: Via Settings Menu**
1. Go to [Printful Dashboard](https://www.printful.com/dashboard)
2. Click on your profile/account icon (top right)
3. Go to **Settings** or **Account Settings**
4. Look for **"API"** or **"Webhooks"** in the left sidebar
5. Click **"Add Webhook"** or **"Create Webhook"**
6. Enter your webhook URL: `https://yourdomain.com/api/printful/webhook`
7. Select the event: **"Package Shipped"** or **"Order Shipped"**
8. (Optional) Copy the webhook secret if provided
9. Click **"Save"** or **"Create"**

**Option B: Direct API/Webhooks Link**
1. Try going directly to: [https://www.printful.com/dashboard/api](https://www.printful.com/dashboard/api)
2. Or: [https://www.printful.com/dashboard/settings/webhooks](https://www.printful.com/dashboard/settings/webhooks)
3. Look for webhook configuration options

**Option C: If Webhooks Not Available (Alternative Solution)**
If you can't find webhooks in Printful (they may only show "Create Token" in the API section), we have an alternative solution that polls Printful's API:

### Using the Polling Solution

1. **Manual Check (Admin Page)**
   - Go to `/admin/orders/check-shipped` in your app
   - Click "Check for Shipped Orders"
   - This will check all pending orders and send customer emails for any that have shipped

2. **Automated Check (Cron Job)**
   - Set up a cron job to call `GET /api/printful/check-shipped` every 1-2 hours
   - Options:
     - **Vercel Cron**: Add to `vercel.json` (if using Vercel)
     - **External Service**: Use cron-job.org or similar
     - **Server Cron**: If you have a server, set up a cron job

3. **How It Works**
   - The endpoint checks all orders in Firestore with status "created" or "processing"
   - Queries Printful API for each order's current status
   - If an order is "fulfilled" or "shipped", sends customer email notification
   - Updates order status in Firestore

This solution works even if Printful doesn't offer webhooks for your account!

**Note:** Printful's interface may vary. If you still can't find it, try:
- Searching for "webhook" in the Printful dashboard search
- Checking Printful's help documentation: [https://www.printful.com/docs](https://www.printful.com/docs)
- Contacting Printful support

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
