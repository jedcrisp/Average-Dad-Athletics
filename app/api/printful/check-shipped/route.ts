import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendShippingNotification } from '@/lib/email-helpers'

/**
 * Poll Printful API to check for shipped orders
 * 
 * This endpoint can be called:
 * 1. Manually by an admin
 * 2. Via a cron job (e.g., Vercel Cron or external service)
 * 3. Periodically to check for new shipments
 * 
 * It checks orders in Firestore that are in "created" status and queries Printful
 * to see if they've been shipped, then sends customer notifications.
 */

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY
const PRINTFUL_API_BASE = 'https://api.printful.com'

export async function GET(request: NextRequest) {
  try {
    if (!PRINTFUL_API_KEY) {
      return NextResponse.json(
        { error: 'PRINTFUL_API_KEY not configured' },
        { status: 500 }
      )
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    // Get all orders that are created but not yet shipped
    const ordersSnapshot = await adminDb
      .collection('orders')
      .where('status', 'in', ['created', 'processing'])
      .get()

    if (ordersSnapshot.empty) {
      return NextResponse.json({
        message: 'No orders to check',
        checked: 0,
        shipped: 0,
      })
    }

    console.log(`📦 Checking ${ordersSnapshot.size} orders for shipment status...`)

    let checked = 0
    let shipped = 0
    const errors: string[] = []

    // Check each order
    for (const orderDoc of ordersSnapshot.docs) {
      const orderData = orderDoc.data()
      const printfulOrderId = orderData.printfulOrderId
      const externalId = orderData.printfulExternalId

      if (!printfulOrderId) {
        console.warn(`⚠️ Order ${orderDoc.id} has no printfulOrderId`)
        continue
      }

      try {
        checked++

        // Fetch order status from Printful
        const response = await fetch(
          `${PRINTFUL_API_BASE}/orders/${printfulOrderId}`,
          {
            headers: {
              'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
            },
          }
        )

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ Error fetching Printful order ${printfulOrderId}:`, errorText)
          errors.push(`Order ${printfulOrderId}: ${errorText}`)
          continue
        }

        const printfulOrder = await response.json()
        const order = printfulOrder.result

        // Check if order is shipped
        if (order.status === 'fulfilled' || order.status === 'shipped') {
          // Check if we've already sent notification
          if (orderData.status === 'shipped') {
            console.log(`ℹ️ Order ${printfulOrderId} already marked as shipped`)
            continue
          }

          console.log(`✅ Order ${printfulOrderId} has been shipped!`)

          // Get shipment information
          const shipments = order.shipments || []
          const latestShipment = shipments[shipments.length - 1]
          
          const trackingNumber = latestShipment?.tracking_number || latestShipment?.tracking_code
          const trackingUrl = latestShipment?.tracking_url
          const carrier = latestShipment?.carrier || latestShipment?.service

          const customerEmail = orderData.customerEmail
          if (!customerEmail) {
            console.warn(`⚠️ Order ${printfulOrderId} has no customer email`)
            errors.push(`Order ${printfulOrderId}: No customer email`)
            continue
          }

          // Get recipient info from Printful order or Firestore
          const recipient = order.recipient || {}
          const customerName = recipient.name || orderData.shipping?.name || 'Customer'

          // Get items
          const items = order.items?.map((item: any) => ({
            name: item.name || item.product?.name || 'Item',
            quantity: item.quantity || 1,
          })) || orderData.items || []

          // Send shipping notification email
          try {
            await sendShippingNotification({
              customerEmail,
              customerName,
              orderNumber: externalId || String(printfulOrderId),
              trackingNumber,
              trackingUrl,
              carrier,
              items,
            })

            console.log(`✅ Shipping notification email sent to: ${customerEmail}`)
            shipped++

            // Update order status in Firestore
            await orderDoc.ref.update({
              status: 'shipped',
              shippedAt: new Date(),
              trackingNumber,
              trackingUrl,
              carrier,
              updatedAt: new Date(),
            })

            console.log(`✅ Order ${printfulOrderId} status updated in Firestore`)
          } catch (emailError: any) {
            console.error(`❌ Error sending email for order ${printfulOrderId}:`, emailError)
            errors.push(`Order ${printfulOrderId}: Email error - ${emailError.message}`)
          }
        } else {
          console.log(`ℹ️ Order ${printfulOrderId} status: ${order.status}`)
        }
      } catch (error: any) {
        console.error(`❌ Error processing order ${printfulOrderId}:`, error)
        errors.push(`Order ${printfulOrderId}: ${error.message}`)
      }
    }

    return NextResponse.json({
      message: 'Check complete',
      checked,
      shipped,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('❌ Error checking shipped orders:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
