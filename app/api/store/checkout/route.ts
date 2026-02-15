import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe-helpers'
// Note: Add Firebase Admin SDK if you need server-side auth verification
// import { auth } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      )
    }

    // Verify user is authenticated
    // You'll need to implement proper auth verification here
    // For now, we'll proceed without auth check (add it later)

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
          },
          unit_amount: unitPrice,
        },
        quantity: item.quantity,
      }
    })

    // Create checkout session
    const session = await createCheckoutSession(
      lineItems,
      `${request.nextUrl.origin}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      `${request.nextUrl.origin}/store`,
      {
        // Store metadata for order fulfillment
        items: JSON.stringify(items),
      }
    )

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session', message: error.message },
      { status: 500 }
    )
  }
}
