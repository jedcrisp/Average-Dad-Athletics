import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe-helpers'
import { getShippingRates } from '@/lib/printful-helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, shippingAddress } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      )
    }

    // Convert items to Stripe format
    const lineItems = items.map((item: any) => {
      // Price should be sent from frontend, convert to cents
      const unitPrice = item.price 
        ? Math.round(item.price * 100) 
        : 2499 // Fallback to $24.99 if price not provided
      
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.productName || 'Product',
            description: `Variant ID: ${item.variantId}`,
            metadata: {
              variant_id: item.variantId.toString(),
              product_id: item.productId || '',
            },
          },
          unit_amount: unitPrice,
        },
        quantity: item.quantity,
      }
    })

    // Create checkout session with shipping address collection
    // We'll calculate shipping dynamically via webhook when address is entered
    const session = await createCheckoutSession(
      lineItems,
      `${request.nextUrl.origin}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      `${request.nextUrl.origin}/store`,
      {
        // Store metadata for order fulfillment and shipping calculation
        items: JSON.stringify(items),
      },
      true // Enable shipping address collection
    )

    console.log('✅ Checkout session created with shipping address collection')
    console.log('📦 Shipping will be calculated from Printful when customer enters address')

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session', message: error.message },
      { status: 500 }
    )
  }
}
