import { NextRequest, NextResponse } from 'next/server'
import { getShippingRates } from '@/lib/printful-helpers'

/**
 * This endpoint is called by Stripe when customer enters shipping address
 * Stripe will POST to this endpoint with the session and shipping address
 * We return shipping options based on Printful rates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { line_items, shipping_address } = body

    console.log('📦 Stripe shipping calculation request:', {
      hasLineItems: !!line_items,
      lineItemCount: line_items?.length,
      shippingAddress: shipping_address,
    })

    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return NextResponse.json(
        { error: 'Line items are required' },
        { status: 400 }
      )
    }

    if (!shipping_address) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      )
    }

    // Extract variant IDs and quantities from Stripe line items
    // The variant ID should be in the line item metadata or description
    const items = line_items.map((item: any) => {
      // Try to extract variant ID from metadata or description
      const variantId = item.price_data?.metadata?.variant_id || 
                       item.description?.match(/Variant ID: (\d+)/)?.[1] ||
                       item.metadata?.variant_id
      
      return {
        variant_id: parseInt(variantId) || 0,
        quantity: item.quantity || 1,
      }
    }).filter((item: any) => item.variant_id > 0)

    if (items.length === 0) {
      console.warn('⚠️ No valid variant IDs found in line items')
      // Return default shipping option
      return NextResponse.json({
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: 500, // $5.00 default
                currency: 'usd',
              },
              display_name: 'Standard Shipping',
            },
          },
        ],
      })
    }

    try {
      // Get shipping rates from Printful based on address and items
      const rates = await getShippingRates({
        recipient: {
          address1: shipping_address.line1 || '',
          city: shipping_address.city || '',
          state_code: shipping_address.state || '',
          country_code: shipping_address.country || 'US',
          zip: shipping_address.postal_code || '',
        },
        items: items,
      })

      console.log('📦 Printful shipping rates:', rates)

      // Transform Printful rates to Stripe shipping options
      const shippingOptions = rates.map((rate: any) => ({
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: Math.round(parseFloat(rate.rate || rate.retail_rate || '0') * 100), // Convert to cents
            currency: (rate.currency || 'USD').toLowerCase(),
          },
          display_name: rate.name || `${rate.service || 'Shipping'}${rate.delivery_days ? ` - ${rate.delivery_days} days` : ''}`,
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

      console.log('✅ Returning shipping options:', shippingOptions.length)

      return NextResponse.json({ shipping_options: shippingOptions })
    } catch (printfulError: any) {
      console.error('❌ Error fetching shipping rates from Printful:', printfulError)
      // Return default shipping option if Printful fails
      return NextResponse.json({
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: 500, // $5.00 default
                currency: 'usd',
              },
              display_name: 'Standard Shipping',
            },
          },
        ],
        error: 'Could not calculate shipping rates, using default',
      })
    }
  } catch (error: any) {
    console.error('Error calculating shipping:', error)
    return NextResponse.json(
      { error: 'Failed to calculate shipping', message: error.message },
      { status: 500 }
    )
  }
}
