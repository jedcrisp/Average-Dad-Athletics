import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, stripe } from '@/lib/stripe-helpers'
import { createPrintfulOrder } from '@/lib/printful-helpers'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

// Stripe webhook endpoint
// This handles successful payments and creates Printful orders

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('❌ Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  try {
    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature, webhookSecret)
    console.log('✅ Webhook signature verified. Event type:', event.type)

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      const sessionId = session.id
      
      console.log('🛒 Processing checkout.session.completed for session:', sessionId)
      console.log('📦 Session data:', JSON.stringify({
        id: sessionId,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_details?.email,
        has_shipping: !!session.collected_information?.shipping_details,
        has_metadata: !!session.metadata?.items,
      }, null, 2))

      // Check for idempotency - has this order already been processed?
      let existingOrder = null
      if (adminDb) {
        try {
          const orderRef = adminDb.collection('orders').doc(sessionId)
          const orderDoc = await orderRef.get()
          if (orderDoc.exists) {
            const existingData = orderDoc.data()
            console.log('⚠️ Order already processed. Printful order ID:', existingData?.printfulOrderId)
            console.log('⚠️ Skipping duplicate order creation for session:', sessionId)
            return NextResponse.json({ 
              received: true, 
              message: 'Order already processed',
              printfulOrderId: existingData?.printfulOrderId 
            })
          }
        } catch (firestoreError) {
          console.warn('⚠️ Could not check Firestore for existing order (non-fatal):', firestoreError)
          // Continue processing - idempotency check is best effort
        }
      }

      // Extract order information from session metadata
      let items: any[] = []
      try {
        items = JSON.parse(session.metadata?.items || '[]')
        console.log('📋 Parsed items from metadata:', JSON.stringify(items, null, 2))
        
        // Log variant ID information for debugging
        items.forEach((item: any, index: number) => {
          console.log(`📦 Item ${index}:`, {
            variantId: item.variantId,
            syncVariantId: item.syncVariantId,
            catalogVariantId: item.catalogVariantId,
            productId: item.productId,
            productName: item.productName,
          })
        })
      } catch (parseError) {
        console.error('❌ Failed to parse items from metadata:', parseError)
        console.error('❌ Metadata items string:', session.metadata?.items)
        // Return 200 to avoid retries, but log the error
        return NextResponse.json({ 
          received: true, 
          error: 'Failed to parse items from metadata' 
        })
      }

      if (!items || items.length === 0) {
        console.error('❌ No items found in session metadata')
        return NextResponse.json({ 
          received: true, 
          error: 'No items in order' 
        })
      }

      // Get shipping address from collected_information.shipping_details (LIVE mode)
      // Fallback to customer_details.address for compatibility
      const shippingDetails = session.collected_information?.shipping_details || {}
      const shippingAddress = shippingDetails.address || session.customer_details?.address || {}
      const recipientName = shippingDetails.name || session.customer_details?.name || 'Customer'
      const customerEmail = session.customer_details?.email || session.customer_email || ''

      console.log('📍 Shipping address:', JSON.stringify({
        name: recipientName,
        line1: shippingAddress.line1,
        city: shippingAddress.city,
        state: shippingAddress.state,
        country: shippingAddress.country,
        postal_code: shippingAddress.postal_code,
      }, null, 2))

      // Validate required shipping fields
      if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.country || !shippingAddress.postal_code) {
        console.error('❌ Missing required shipping address fields')
        console.error('❌ Address data:', JSON.stringify(shippingAddress, null, 2))
        // Return 200 to avoid retries, but log the error
        return NextResponse.json({ 
          received: true, 
          error: 'Missing required shipping address fields' 
        })
      }

        // Create order in Printful
      try {
        // Build Printful order items
        const printfulItems = items.map((item: any) => {
          // Extract variant IDs from metadata
          const syncVariantId = item.syncVariantId || item.sync_variant_id
          const catalogVariantId = item.catalogVariantId || item.catalog_variant_id
          const variantId = item.variantId
          
          // Build item data - use sync_variant_id (string) if available, otherwise variant_id (number)
          const itemData: any = {
            quantity: parseInt(item.quantity) || 1,
          }
          
          if (syncVariantId) {
            // For sync products: use sync_variant_id (string, alphanumeric like "699204a318b1a7")
            // DO NOT attach files - synced products already have artwork attached
            itemData.sync_variant_id = syncVariantId
            console.log(`✅ Using sync_variant_id: ${syncVariantId} for product ${item.productName || 'unknown'}`)
            console.log(`✅ Skipping print files (synced products already have artwork)`)
          } else if (catalogVariantId) {
            // For catalog products: use variant_id (number)
            // Catalog products may need print files, but we'll let Printful handle that
            const numericVariantId = Number(catalogVariantId)
            if (isNaN(numericVariantId) || numericVariantId <= 0) {
              throw new Error(`Invalid catalog variant ID: ${catalogVariantId} for product ${item.productName || 'unknown'}`)
            }
            itemData.variant_id = numericVariantId
            console.log(`⚠️ No sync_variant_id, using catalog variant_id: ${numericVariantId}`)
          } else if (variantId) {
            // Last resort: try to parse variantId as number
            const numericVariantId = Number(variantId)
            if (isNaN(numericVariantId) || numericVariantId <= 0) {
              throw new Error(`Invalid variant ID: ${variantId} for product ${item.productName || 'unknown'}. Need sync_variant_id for sync products.`)
            }
            itemData.variant_id = numericVariantId
            console.log(`⚠️ No sync_variant_id or catalog_variant_id, using variantId: ${numericVariantId}`)
          } else {
            throw new Error(`No valid variant ID found for product ${item.productName || 'unknown'}. Need sync_variant_id for sync products or variant_id for catalog products.`)
          }
          
          console.log(`📦 Printful item data:`, JSON.stringify(itemData, null, 2))
          return itemData
        })

        const printfulOrderData = {
          recipient: {
            name: recipientName,
            address1: shippingAddress.line1 || '',
            address2: shippingAddress.line2 || '',
            city: shippingAddress.city || '',
            state_code: shippingAddress.state || '',
            country_code: shippingAddress.country || 'US',
            zip: shippingAddress.postal_code || '',
            phone: session.customer_details?.phone || '',
            email: customerEmail,
          },
          items: printfulItems,
          retail_costs: {
            currency: (session.currency || 'USD').toUpperCase(),
            subtotal: ((session.amount_subtotal || 0) / 100).toFixed(2),
            discount: '0.00',
            shipping: ((session.shipping_cost?.amount_total || 0) / 100).toFixed(2),
            tax: ((session.total_details?.amount_tax || 0) / 100).toFixed(2),
          },
          external_id: sessionId, // Use Stripe session ID as external_id (no prefix needed)
        }

        console.log('📦 Creating Printful order with data:')
        console.log('📦 Recipient:', JSON.stringify(printfulOrderData.recipient, null, 2))
        console.log('📦 Items:', JSON.stringify(printfulOrderData.items, null, 2))
        console.log('📦 Retail costs:', JSON.stringify(printfulOrderData.retail_costs, null, 2))
        console.log('📦 External ID:', printfulOrderData.external_id)
        const printfulOrder = await createPrintfulOrder(printfulOrderData)

        const printfulOrderId = printfulOrder.id || printfulOrder.external_id || 'unknown'
        console.log('✅ Printful order created successfully!')
        console.log('✅ Printful Order ID:', printfulOrderId)
        console.log('✅ External ID:', printfulOrder.external_id)
        console.log('📧 Customer email:', customerEmail)

        // Save order to Firestore for tracking and idempotency
        if (adminDb) {
          try {
            const orderRef = adminDb.collection('orders').doc(sessionId)
            await orderRef.set({
              stripeSessionId: sessionId,
              printfulOrderId: printfulOrderId,
              printfulExternalId: printfulOrder.external_id || sessionId,
              customerEmail: customerEmail,
              amountTotal: session.amount_total ? (session.amount_total / 100) : 0,
              currency: session.currency || 'USD',
              shipping: {
                name: recipientName,
                address: shippingAddress,
              },
              items: items,
              status: 'created',
              createdAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            })
            console.log('✅ Order saved to Firestore')
          } catch (firestoreError) {
            console.error('⚠️ Failed to save order to Firestore (non-fatal):', firestoreError)
            // Don't fail the webhook if Firestore save fails
          }
        }

        return NextResponse.json({ 
          received: true,
          printfulOrderId: printfulOrderId,
          message: 'Order created successfully'
        })
      } catch (printfulError: any) {
        console.error('❌ CRITICAL: Failed to create Printful order')
        console.error('❌ Error message:', printfulError.message)
        console.error('❌ Error status:', printfulError.status)
        
        // Log the full error response if available
        if (printfulError.response) {
          console.error('❌ Printful API error response:', printfulError.response)
        }
        if (printfulError.errorData) {
          console.error('❌ Printful error data:', JSON.stringify(printfulError.errorData, null, 2))
        }
        if (printfulError.stack) {
          console.error('❌ Error stack:', printfulError.stack)
        }
        
        // Log the order data that was sent (for debugging)
        console.error('❌ Order data that was sent:')
        console.error('❌ Items from metadata:', JSON.stringify(items, null, 2))
        console.error('❌ Shipping address:', JSON.stringify(shippingAddress, null, 2))

        // Save failed order attempt to Firestore for debugging
        if (adminDb) {
          try {
            const orderRef = adminDb.collection('orders').doc(sessionId)
            await orderRef.set({
              stripeSessionId: sessionId,
              customerEmail: customerEmail,
              amountTotal: session.amount_total ? (session.amount_total / 100) : 0,
              currency: session.currency || 'USD',
              items: items,
              status: 'failed',
              error: printfulError.message || 'Unknown error',
              errorDetails: JSON.stringify(printfulError),
              createdAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            }, { merge: true })
          } catch (firestoreError) {
            console.error('⚠️ Failed to save failed order to Firestore:', firestoreError)
          }
        }

        // Return 200 to Stripe to avoid retries (we've logged the error)
        // In production, you might want to send an alert/notification here
        return NextResponse.json({ 
          received: true,
          error: 'Printful order creation failed',
          message: printfulError.message 
        })
      }
    }

    // Event type not handled
    console.log('ℹ️ Unhandled event type:', event.type)
    return NextResponse.json({ received: true, message: 'Event type not handled' })
  } catch (error: any) {
    console.error('❌ Webhook verification or processing error:', error)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Webhook handler failed', message: error.message },
      { status: 400 }
    )
  }
}
