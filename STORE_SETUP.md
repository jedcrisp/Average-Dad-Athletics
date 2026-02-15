# Store Setup Guide - Printful + Stripe Integration

This guide will help you set up your e-commerce store using Printful for print-on-demand fulfillment and Stripe for payment processing.

## Overview

The store integration works as follows:
1. **Product Catalog**: Products are managed in Printful
2. **Storefront**: Custom Next.js pages display products
3. **Payment**: Stripe handles checkout and payments
4. **Fulfillment**: After successful payment, orders are automatically sent to Printful

## Prerequisites

- Printful account: [Sign up here](https://www.printful.com/)
- Stripe account: [Sign up here](https://stripe.com/)
- Your website deployed (Vercel recommended)

## Step 1: Set Up Printful

### 1.1 Create Printful Account
1. Go to [Printful](https://www.printful.com/) and create an account
2. Complete the onboarding process

### 1.2 Get API Key
1. Go to [Printful Dashboard](https://www.printful.com/dashboard/api)
2. Click "Create API key"
3. Copy your API key (starts with `prn_...`)
4. Save it securely - you'll need it for environment variables

### 1.3 Create Products in Printful
1. Go to Printful Dashboard > Products
2. Create your product catalog (t-shirts, hoodies, etc.)
3. Note the Product IDs - you'll need these to sync with your store

### 1.4 Set Up Store Connection
1. In Printful Dashboard, go to Stores
2. Connect your store (or use "Manual" for API-only integration)
3. Configure shipping and tax settings

## Step 2: Set Up Stripe

### 2.1 Create Stripe Account
1. Go to [Stripe](https://stripe.com/) and create an account
2. Complete business verification (required for live payments)

### 2.2 Get API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Secret key** (starts with `sk_test_...` for test, `sk_live_...` for production)
3. Copy your **Publishable key** (starts with `pk_test_...` for test, `pk_live_...` for production)

### 2.3 Set Up Webhook
1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL to: `https://yourdomain.com/api/store/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
5. Copy the **Webhook signing secret** (starts with `whsec_...`)

## Step 3: Configure Environment Variables

### 3.1 Local Development (.env.local)
Add these to your `.env.local` file:

```env
# Printful
PRINTFUL_API_KEY=prn_your-printful-api-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

### 3.2 Production (Vercel)
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add all the variables above
4. Use **live** Stripe keys for production (not test keys)

## Step 4: Sync Products

### Option A: Manual Product Sync (Current Implementation)
Currently, products are defined manually in `/app/api/store/products/route.ts`. To add products:

1. Create products in Printful Dashboard
2. Note the Product IDs
3. Update the products array in the API route
4. Fetch variants using Printful API

### Option B: Automatic Sync (Recommended for Production)
You can create an admin page to sync products automatically:

1. Create an admin sync page at `/app/admin/store/sync`
2. Use Printful API to fetch all products
3. Store product data in Firestore
4. Display products from Firestore

## Step 5: Test the Integration

### 5.1 Test Checkout Flow
1. Start your development server: `npm run dev`
2. Navigate to `/store`
3. Click on a product
4. Select variant and quantity
5. Click "Buy Now"
6. Use Stripe test card: `4242 4242 4242 4242`
7. Complete checkout

### 5.2 Verify Webhook
1. Check Stripe Dashboard > Webhooks for successful events
2. Check Printful Dashboard > Orders for created orders
3. Verify order details match

### 5.3 Test Webhook Locally (Optional)
Use Stripe CLI to test webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/store/webhook
```

## Step 6: Production Checklist

Before going live:

- [ ] Switch to Stripe live keys
- [ ] Update webhook URL in Stripe Dashboard to production URL
- [ ] Test complete order flow with real payment
- [ ] Verify Printful orders are created correctly
- [ ] Set up order tracking/notification system
- [ ] Configure shipping rates in Printful
- [ ] Set up tax calculation (if needed)
- [ ] Test with different product variants
- [ ] Verify email notifications work

## Troubleshooting

### Products Not Showing
- Check Printful API key is correct
- Verify API route is returning products
- Check browser console for errors

### Checkout Not Working
- Verify Stripe keys are correct
- Check Stripe Dashboard for errors
- Ensure webhook secret is set correctly

### Orders Not Creating in Printful
- Check webhook is receiving events in Stripe Dashboard
- Verify Printful API key has correct permissions
- Check server logs for errors
- Ensure recipient address is complete

### Webhook Not Working
- Verify webhook URL is correct in Stripe Dashboard
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Ensure webhook endpoint is publicly accessible
- Check server logs for signature verification errors

## Next Steps

1. **Product Management**: Create an admin interface to manage products
2. **Order Tracking**: Add order tracking page for customers
3. **Inventory Sync**: Sync Printful inventory with your store
4. **Email Notifications**: Send order confirmations and shipping updates
5. **Analytics**: Track sales and popular products

## Support

- [Printful API Docs](https://developers.printful.com/)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

## Security Notes

- Never commit API keys to git
- Use environment variables for all secrets
- Use test keys for development
- Rotate keys if compromised
- Enable 2FA on both Printful and Stripe accounts
