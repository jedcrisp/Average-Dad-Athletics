// Stripe Helper Functions
import Stripe from 'stripe'

// Initialize Stripe - allow undefined during build, will throw at runtime if used
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia',
    })
  : (null as any) // Type assertion to allow build, will fail at runtime if used without key

export interface CheckoutItem {
  price_data: {
    currency: string
    product_data: {
      name: string
      description?: string
      images?: string[]
    }
    unit_amount: number // in cents
  }
  quantity: number
}

/**
 * Create a Stripe Checkout Session
 */
export async function createCheckoutSession(
  items: CheckoutItem[],
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>,
  shippingAddressCollection?: boolean,
  shippingOptions?: Stripe.Checkout.SessionCreateParams.ShippingOption[],
  shippingRateCalculationUrl?: string
): Promise<Stripe.Checkout.Session> {
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
  }
  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: items,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
      // Explicitly enable email collection (required for automatic receipts)
      // Stripe will collect email during checkout and send confirmation email after payment
      customer_email: undefined, // undefined = Stripe will collect email in checkout form
      // Ensure invoices are not created (we're using one-time payments, not subscriptions)
      invoice_creation: {
        enabled: false,
      },
    }

    // Enable shipping address collection if requested
    if (shippingAddressCollection) {
      sessionParams.shipping_address_collection = {
        allowed_countries: ['US', 'CA', 'GB', 'AU'], // Add more countries as needed
      }
    }

    // Use dynamic shipping rate calculation if URL provided
    if (shippingRateCalculationUrl) {
      sessionParams.shipping_options = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0, // Placeholder, will be calculated dynamically
              currency: 'usd',
            },
            display_name: 'Calculating shipping...',
          },
        },
      ]
      // Note: Stripe doesn't support a callback URL directly in checkout sessions
      // We'll need to use a different approach - see checkout route
    } else if (shippingOptions && shippingOptions.length > 0) {
      // Use provided static shipping options
      sessionParams.shipping_options = shippingOptions
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return session
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error)
    throw error
  }
}

/**
 * Retrieve a Stripe Checkout Session
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return session
  } catch (error) {
    console.error('Error retrieving Stripe checkout session:', error)
    throw error
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
  }
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    throw error
  }
}
