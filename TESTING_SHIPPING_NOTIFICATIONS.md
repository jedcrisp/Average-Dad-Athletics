# Testing Shipping Notifications

This guide will help you test that customers receive shipping notification emails when their orders ship.

## Prerequisites

Before testing, make sure you have:
1. ✅ Firebase Admin SDK configured (in `.env.local` and Vercel)
2. ✅ Resend API key configured (`RESEND_API_KEY` in `.env.local` and Vercel)
3. ✅ Resend FROM email configured (`RESEND_FROM_EMAIL`)
4. ✅ Printful API key configured (`PRINTFUL_API_KEY`)

## Test Methods

### Method 1: Full End-to-End Test (Recommended)

This tests the complete flow from order creation to email delivery.

#### Step 1: Create a Test Order
1. Go to your store: `https://averagedadathletics.com/store`
2. Add a product to cart and checkout
3. Use a **real email address you can check** (your own email or a test email)
4. Complete the checkout with Stripe test mode
5. The order should be saved to Firestore with status `created`

#### Step 2: Mark Order as Shipped in Printful
1. Go to [Printful Dashboard](https://www.printful.com/dashboard)
2. Find your test order
3. Mark it as **"Shipped"** or **"Fulfilled"**
   - Or wait for Printful to actually ship it (if you have a real order)

#### Step 3: Trigger the Check
**Option A: Use Admin Page (Easiest)**
1. Go to `/admin/orders/check-shipped` in your app
2. Click **"Check for Shipped Orders"**
3. Wait for the results

**Option B: Use API Directly**
1. Visit: `https://averagedadathletics.com/api/printful/check-shipped`
2. Or use curl:
   ```bash
   curl https://averagedadathletics.com/api/printful/check-shipped
   ```

#### Step 4: Verify Email Sent
1. Check the customer's email inbox
2. Check spam folder
3. Look for subject: **"Your Order #[ORDER_NUMBER] Has Shipped! 🎉"**
4. Email should include:
   - Order number
   - List of items
   - Tracking information (if available)

#### Step 5: Check Results
- The API response should show:
  - `checked: 1` (or more)
  - `shipped: 1` (if order was found and shipped)
- Check server logs for confirmation messages
- Check Resend dashboard to see if email was sent

---

### Method 2: Test Email Sending Directly

This tests just the email sending functionality without needing a real order.

#### Step 1: Use the Test Endpoint
1. Visit: `/api/printful/test-email` (see below for setup)
2. Or use curl:
   ```bash
   curl -X POST https://averagedadathletics.com/api/printful/test-email \
     -H "Content-Type: application/json" \
     -d '{"email":"your-test-email@example.com"}'
   ```

#### Step 2: Check Email
- Check the email inbox you specified
- Verify the email looks correct

---

### Method 3: Manual Order Status Update

If you want to test without waiting for Printful to ship:

1. Create a test order (or use an existing one)
2. Manually update the order in Firestore to simulate shipped status
3. Then run the check-shipped endpoint

**Note:** This requires Firebase Admin access or Firestore console access.

---

## Troubleshooting

### No Email Received

1. **Check Resend Dashboard**
   - Go to [Resend Emails](https://resend.com/emails)
   - See if email was sent and if there were any errors
   - Check delivery status

2. **Check Spam Folder**
   - Shipping notification emails might go to spam
   - Check junk/spam folder

3. **Verify Email Configuration**
   - Check `RESEND_API_KEY` is set correctly
   - Check `RESEND_FROM_EMAIL` is a verified domain
   - Check Resend API limits (free tier: 3,000/month)

4. **Check Server Logs**
   - Look for error messages in Vercel logs
   - Check for "Error sending shipping notification email"

### Order Not Found

1. **Check Order Status**
   - Order must have `status: 'created'` or `status: 'processing'` in Firestore
   - Check Firestore console to verify order exists

2. **Check Printful Order ID**
   - Verify `printfulOrderId` is saved correctly in Firestore
   - Check that Printful order actually exists

3. **Check Printful API**
   - Verify `PRINTFUL_API_KEY` is correct
   - Check Printful API response in server logs

### "Database not configured" Error

1. **Check Environment Variables**
   - Verify `FIREBASE_ADMIN_PRIVATE_KEY` is set in Vercel
   - Verify `FIREBASE_ADMIN_CLIENT_EMAIL` is set in Vercel
   - Verify `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is set

2. **Check Private Key Format**
   - Private key must include `\n` characters for newlines
   - Should look like: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`

3. **Redeploy**
   - After adding environment variables, redeploy your site
   - Vercel needs a new deployment to pick up env vars

---

## Expected Results

### Successful Test
- ✅ API returns: `{ checked: 1, shipped: 1 }`
- ✅ Customer receives email with order details
- ✅ Order status updated to `shipped` in Firestore
- ✅ Tracking information included (if available)

### Email Content
The email should include:
- Order number
- Customer name
- List of items with quantities
- Tracking number (if available)
- Tracking URL (if available)
- Carrier information (if available)

---

## Automated Testing

The system automatically checks for shipped orders every hour via Vercel cron job. You can verify this is working by:
1. Checking Vercel logs for cron job executions
2. Looking for scheduled runs in Vercel dashboard
3. Verifying emails are sent automatically

---

## Next Steps

Once testing is successful:
1. ✅ Monitor the first few real orders
2. ✅ Check that emails are being sent automatically
3. ✅ Verify customer satisfaction with email notifications
4. ✅ Adjust email template if needed (in `lib/email-helpers.ts`)
