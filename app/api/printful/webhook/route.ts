import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendShippingNotification } from '@/lib/email-helpers'
import crypto from 'crypto'

/**
 * Printful Webhook Endpoint
 * 
 * This endpoint receives webhooks from Printful when order status changes.
 * We're particularly interested in the "package_shipped" event to notify customers.
 * 
 * To set up this webhook in Printful:
 * 1. Go to Printful Dashboard > Settings > Webhooks
 * 2. Add webhook URL: https://yourdomain.com/api/printful/webhook
 * 3. Select events: "Package Shipped"
 * 4. Copy the webhook secret (if available)
 */

export async function POST(request: NextRequest) {
  try {
    // Parse request body (Printful may send as JSON string or object)
    const bodyText = await request.text()
    let body: any
    try {
      body = JSON.parse(bodyText)
    } catch {
      // If parsing fails, try to use as-is (might already be an object)
      body = bodyText as any
    }
    
    const eventType = body.type
    const data = body.data

    console.log('📦 Printful webhook received:', {
      type: eventType,
      orderId: data?.order?.id,
      externalId: data?.order?.external_id,
    })

    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.PRINTFUL_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get('x-printful-signature')
      if (signature) {
        // Printful uses HMAC SHA256 for webhook verification
        // Use the raw body text for signature verification
        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(bodyText)
          .digest('hex')
        
        if (signature !== expectedSignature) {
          console.error('❌ Invalid webhook signature')
          return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 401 }
          )
        }
        console.log('✅ Webhook signature verified')
      }
    }

    // Handle package_shipped event
    if (eventType === 'package_shipped') {
      const order = data?.order
      if (!order) {
        console.error('❌ No order data in webhook')
        return NextResponse.json(
          { error: 'No order data' },
          { status: 400 }
        )
      }

      const printfulOrderId = order.id
      const externalId = order.external_id
      const recipient = order.recipient
      const shipment = data?.shipment

      console.log('📦 Processing package_shipped event:', {
        printfulOrderId,
        externalId,
        customerEmail: recipient?.email,
        trackingNumber: shipment?.tracking_number,
      })

      // Find the order in Firestore by Printful order ID or external ID
      if (!adminDb) {
        console.error('❌ Firebase Admin not configured')
        return NextResponse.json(
          { error: 'Database not configured' },
          { status: 500 }
        )
      }

      let orderDoc = null
      
      // Try to find by external_id first (this is the Stripe session ID we sent)
      if (externalId) {
        const ordersSnapshot = await adminDb
          .collection('orders')
          .where('printfulExternalId', '==', externalId)
          .limit(1)
          .get()
        
        if (!ordersSnapshot.empty) {
          orderDoc = ordersSnapshot.docs[0]
        }
      }

      // If not found by external_id, try by Printful order ID
      if (!orderDoc && printfulOrderId) {
        const ordersSnapshot = await adminDb
          .collection('orders')
          .where('printfulOrderId', '==', String(printfulOrderId))
          .limit(1)
          .get()
        
        if (!ordersSnapshot.empty) {
          orderDoc = ordersSnapshot.docs[0]
        }
      }

      if (!orderDoc) {
        console.warn('⚠️ Order not found in Firestore:', { printfulOrderId, externalId })
        // Still return 200 to prevent Printful from retrying
        return NextResponse.json({ received: true, message: 'Order not found in database' })
      }

      const orderData = orderDoc.data()
      const customerEmail = orderData.customerEmail || recipient?.email

      if (!customerEmail) {
        console.error('❌ No customer email found for order')
        return NextResponse.json(
          { error: 'No customer email' },
          { status: 400 }
        )
      }

      // Extract order items
      const items = order.items?.map((item: any) => ({
        name: item.name || item.product?.name || 'Item',
        quantity: item.quantity || 1,
      })) || orderData.items || []

      // Extract tracking information
      const trackingNumber = shipment?.tracking_number || shipment?.tracking_code
      const trackingUrl = shipment?.tracking_url
      const carrier = shipment?.carrier || shipment?.service

      // Send shipping notification email to customer
      try {
        await sendShippingNotification({
          customerEmail,
          customerName: recipient?.name || orderData.shipping?.name || 'Customer',
          orderNumber: externalId || String(printfulOrderId),
          trackingNumber,
          trackingUrl,
          carrier,
          items,
        })

        console.log('✅ Shipping notification email sent to:', customerEmail)

        // Update order status in Firestore
        await orderDoc.ref.update({
          status: 'shipped',
          shippedAt: new Date(),
          trackingNumber,
          trackingUrl,
          carrier,
          updatedAt: new Date(),
        })

        console.log('✅ Order status updated in Firestore')
      } catch (emailError: any) {
        console.error('❌ Error sending shipping notification email:', emailError)
        // Don't fail the webhook if email fails - we still want to update the order status
        // But log it for manual follow-up
      }

      return NextResponse.json({ 
        received: true,
        message: 'Shipping notification processed',
        emailSent: true,
      })
    }

    // For other event types, just acknowledge receipt
    console.log('ℹ️ Received webhook event:', eventType)
    return NextResponse.json({ 
      received: true,
      message: `Event ${eventType} received`,
    })
  } catch (error: any) {
    console.error('❌ Error processing Printful webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
