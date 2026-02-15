import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, stripe } from '@/lib/stripe-helpers'
import { createPrintfulOrder, getShippingRates } from '@/lib/printful-helpers'

// Stripe webhook endpoint
// This handles successful payments and creates Printful orders

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  try {
    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature, webhookSecret)

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any

      // Extract order information from session metadata
      const items = JSON.parse(session.metadata?.items || '[]')

      // Get customer details from Stripe (if customer exists)
      let customerName = ''
      let customerEmail = ''
      if (session.customer) {
        try {
          const customer = await stripe.customers.retrieve(session.customer as string)
          // Check if customer is deleted
          if (customer && !customer.deleted) {
            customerName = customer.name || ''
            customerEmail = customer.email || ''
          }
        } catch (error) {
          console.warn('Error retrieving customer:', error)
        }
      }

      // Create order in Printful
      try {
        const printfulOrder = await createPrintfulOrder({
          recipient: {
            name: session.customer_details?.name || customerName || 'Customer',
            address1: session.customer_details?.address?.line1 || '',
            address2: session.customer_details?.address?.line2 || '',
            city: session.customer_details?.address?.city || '',
            state_code: session.customer_details?.address?.state || '',
            country_code: session.customer_details?.address?.country || 'US',
            zip: session.customer_details?.address?.postal_code || '',
            phone: session.customer_details?.phone || '',
            email: session.customer_details?.email || customerEmail || '',
          },
          items: items.map((item: any) => ({
            variant_id: item.variantId,
            quantity: item.quantity,
          })),
          retail_costs: {
            currency: session.currency?.toUpperCase() || 'USD',
            subtotal: (session.amount_subtotal / 100).toFixed(2),
            discount: '0.00',
            shipping: (session.shipping_cost?.amount_total / 100 || 0).toFixed(2),
            tax: (session.total_details?.amount_tax / 100 || 0).toFixed(2),
          },
        })

        console.log('Printful order created:', printfulOrder.id)
        console.log('📧 Customer email:', session.customer_details?.email || customerEmail)

        // Note: Stripe Checkout automatically sends confirmation emails if enabled in Stripe Dashboard
        // To enable: Stripe Dashboard > Settings > Email receipts > Enable for Checkout
        // 
        // If you want to send custom confirmation emails, you can add email sending logic here:
        // - Use a service like SendGrid, Resend, or Nodemailer
        // - Send order confirmation with Printful order details
        // - Include tracking information when order ships

        // You can also save the order to Firestore here for order tracking
        // await saveOrderToFirestore(session.id, printfulOrder.id, items)
      } catch (printfulError) {
        console.error('Error creating Printful order:', printfulError)
        // You might want to send an alert here or retry the order creation
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed', message: error.message },
      { status: 400 }
    )
  }
}
