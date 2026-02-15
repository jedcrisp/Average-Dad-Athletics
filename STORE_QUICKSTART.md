# Store Quick Start

## Installation

First, install the required packages:

```bash
npm install stripe @stripe/stripe-js
```

## Environment Variables

Add these to your `.env.local` file:

```env
PRINTFUL_API_KEY=your-printful-api-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

## Getting Started

1. **Set up Printful**: See `STORE_SETUP.md` for detailed instructions
2. **Set up Stripe**: See `STORE_SETUP.md` for detailed instructions
3. **Add products**: Update `/app/api/store/products/route.ts` with your products
4. **Test checkout**: Use Stripe test card `4242 4242 4242 4242`

## Store Pages

- `/store` - Product listing page
- `/store/[id]` - Product detail page
- `/store/success` - Checkout success page

## API Routes

- `/api/store/products` - Get all products
- `/api/store/products/[id]` - Get product details
- `/api/store/checkout` - Create Stripe checkout session
- `/api/store/webhook` - Stripe webhook handler (creates Printful orders)

## Next Steps

1. Connect your Printful products to the store
2. Set up webhook in Stripe Dashboard
3. Test the complete flow
4. Switch to live Stripe keys for production

For detailed setup instructions, see `STORE_SETUP.md`.
