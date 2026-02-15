import { NextRequest, NextResponse } from 'next/server'
import { getShippingRates } from '@/lib/printful-helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, recipient } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      )
    }

    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient address is required' },
        { status: 400 }
      )
    }

    // Validate required address fields
    if (!recipient.address1 || !recipient.city || !recipient.state_code || !recipient.country_code || !recipient.zip) {
      return NextResponse.json(
        { error: 'Complete address is required (address1, city, state_code, country_code, zip)' },
        { status: 400 }
      )
    }

    try {
      // Get shipping rates from Printful
      const rates = await getShippingRates({
        recipient: {
          address1: recipient.address1,
          city: recipient.city,
          state_code: recipient.state_code,
          country_code: recipient.country_code,
          zip: recipient.zip,
        },
        items: items.map((item: any) => ({
          variant_id: item.variantId,
          quantity: item.quantity,
        })),
      })

      console.log('📦 Printful shipping rates:', rates)

      // Transform Printful rates to Stripe format
      const shippingOptions = rates.map((rate: any) => ({
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: Math.round(parseFloat(rate.rate || rate.retail_rate || '0') * 100), // Convert to cents
            currency: rate.currency?.toLowerCase() || 'usd',
          },
          display_name: rate.name || `${rate.service} - ${rate.delivery_days || ''} days`,
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

      return NextResponse.json({ shipping_options: shippingOptions, rates })
    } catch (printfulError: any) {
      console.error('Error fetching shipping rates from Printful:', printfulError)
      // Return a default shipping option if Printful fails
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
