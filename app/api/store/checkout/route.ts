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
          },
          unit_amount: unitPrice,
        },
        quantity: item.quantity,
      }
    })

    // Get shipping rates from Printful if address is provided
    let shippingOptions: any[] = []
    if (shippingAddress && shippingAddress.address1 && shippingAddress.city && shippingAddress.state_code && shippingAddress.country_code && shippingAddress.zip) {
      try {
        const rates = await getShippingRates({
          recipient: {
            address1: shippingAddress.address1,
            city: shippingAddress.city,
            state_code: shippingAddress.state_code,
            country_code: shippingAddress.country_code,
            zip: shippingAddress.zip,
          },
          items: items.map((item: any) => ({
            variant_id: item.variantId,
            quantity: item.quantity,
          })),
        })

        console.log('📦 Printful shipping rates:', rates)

        // Transform Printful rates to Stripe shipping options
        shippingOptions = rates.map((rate: any) => ({
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: Math.round(parseFloat(rate.rate || rate.retail_rate || '0') * 100), // Convert to cents
              currency: (rate.currency || 'USD').toLowerCase(),
            },
            display_name: rate.name || `${rate.service || 'Shipping'} - ${rate.delivery_days ? `${rate.delivery_days} days` : ''}`,
            delivery_estimate: rate.delivery_days
              ? {
                  minimum: {
                    unit: 'business_day',
                    value: Math.max(1, rate.delivery_days - 2),
                  },
                  maximum: {
                    unit: 'business_day',
                    value: rate.delivery_days + 2,
                  },
                }
              : undefined,
          },
        }))

        console.log('✅ Created shipping options:', shippingOptions.length)
      } catch (shippingError: any) {
        console.warn('⚠️ Could not get shipping rates from Printful, checkout will collect address:', shippingError)
        // Continue without shipping options - Stripe will collect address and we can calculate later
      }
    }

    // Create checkout session with shipping address collection
    const session = await createCheckoutSession(
      lineItems,
      `${request.nextUrl.origin}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      `${request.nextUrl.origin}/store`,
      {
        // Store metadata for order fulfillment
        items: JSON.stringify(items),
      },
      true, // Enable shipping address collection
      shippingOptions.length > 0 ? shippingOptions : undefined // Add shipping options if available
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
