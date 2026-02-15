// Stripe Helper Functions
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
})

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
  shippingOptions?: Stripe.Checkout.SessionCreateParams.ShippingOption[]
): Promise<Stripe.Checkout.Session> {
  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: items,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
    }

    // Enable shipping address collection if requested
    if (shippingAddressCollection) {
      sessionParams.shipping_address_collection = {
        allowed_countries: ['US', 'CA', 'GB', 'AU'], // Add more countries as needed
      }
    }

    // Add shipping options if provided
    if (shippingOptions && shippingOptions.length > 0) {
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
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    throw error
  }
}
