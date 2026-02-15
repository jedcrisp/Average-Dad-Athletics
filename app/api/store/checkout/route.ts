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

    // Calculate shipping from Printful if address is provided
    // Otherwise, enable shipping address collection and calculate via webhook
    let shippingOptions: any[] = []
    
    // If shipping address is provided, calculate rates now
    if (body.shippingAddress && body.shippingAddress.zip) {
      try {
        const rates = await getShippingRates({
          recipient: {
            address1: body.shippingAddress.address1 || '',
            city: body.shippingAddress.city || '',
            state_code: body.shippingAddress.state_code || body.shippingAddress.state || '',
            country_code: body.shippingAddress.country_code || body.shippingAddress.country || 'US',
            zip: body.shippingAddress.zip,
          },
          items: items.map((item: any) => ({
            variant_id: item.variantId,
            quantity: item.quantity,
          })),
        })

        console.log('📦 Calculated shipping rates from Printful:', rates)

        // Transform to Stripe shipping options
        shippingOptions = rates.map((rate: any) => ({
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: Math.round(parseFloat(rate.rate || rate.retail_rate || '0') * 100),
              currency: (rate.currency || 'USD').toLowerCase(),
            },
            display_name: rate.name || `${rate.service || 'Shipping'}${rate.delivery_days ? ` - ${rate.delivery_days} days` : ''}`,
            delivery_estimate: rate.delivery_days
              ? {
                  minimum: { unit: 'business_day', value: Math.max(1, rate.delivery_days - 2) },
                  maximum: { unit: 'business_day', value: rate.delivery_days + 2 },
                }
              : undefined,
          },
        }))
      } catch (shippingError: any) {
        console.warn('⚠️ Could not calculate shipping, will use default:', shippingError)
      }
    }

    // Create checkout session with shipping
    const session = await createCheckoutSession(
      lineItems,
      `${request.nextUrl.origin}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      `${request.nextUrl.origin}/store`,
      {
        items: JSON.stringify(items),
      },
      !body.shippingAddress || !body.shippingAddress.zip, // Enable address collection if not provided
      shippingOptions.length > 0 ? shippingOptions : undefined
    )

    console.log('✅ Checkout session created', shippingOptions.length > 0 ? 'with shipping options' : 'with address collection enabled')

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session', message: error.message },
      { status: 500 }
    )
  }
}
