import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface ShippingNotificationData {
  customerEmail: string
  customerName: string
  orderNumber: string
  trackingNumber?: string
  trackingUrl?: string
  carrier?: string
  items: Array<{
    name: string
    quantity: number
  }>
}

/**
 * Send shipping notification email to customer
 */
export async function sendShippingNotification(data: ShippingNotificationData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set. Cannot send shipping notification email.')
    throw new Error('Email service not configured')
  }

  if (!data.customerEmail) {
    console.error('❌ No customer email provided for shipping notification')
    throw new Error('Customer email is required')
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Average Dad Athletics <noreply@averagedadathletics.com>'
    
    const itemsList = data.items.map(item => `• ${item.name} (Qty: ${item.quantity})`).join('\n')
    
    const trackingInfo = data.trackingNumber 
      ? `\n\n📦 Tracking Information:\nTracking Number: ${data.trackingNumber}${data.carrier ? `\nCarrier: ${data.carrier}` : ''}${data.trackingUrl ? `\nTrack your package: ${data.trackingUrl}` : ''}`
      : '\n\n📦 Your order is being prepared for shipment. You will receive tracking information once it ships.'

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Order Has Shipped!</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #1a1a1a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Average Dad Athletics</h1>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1a1a1a; margin-top: 0;">Your Order Has Shipped! 🎉</h2>
            
            <p>Hi ${data.customerName},</p>
            
            <p>Great news! Your order <strong>#${data.orderNumber}</strong> has shipped and is on its way to you!</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #1a1a1a;">
              <h3 style="margin-top: 0; color: #1a1a1a;">Order Details:</h3>
              <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; margin: 0;">${itemsList}</pre>
            </div>
            
            ${data.trackingNumber ? `
            <div style="background-color: #e8f5e9; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h3 style="margin-top: 0; color: #2e7d32;">📦 Tracking Information</h3>
              <p style="margin: 10px 0;"><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
              ${data.carrier ? `<p style="margin: 10px 0;"><strong>Carrier:</strong> ${data.carrier}</p>` : ''}
              ${data.trackingUrl ? `<p style="margin: 10px 0;"><a href="${data.trackingUrl}" style="color: #1a1a1a; text-decoration: none; font-weight: bold; background-color: #4caf50; color: white; padding: 10px 20px; border-radius: 4px; display: inline-block; margin-top: 10px;">Track Your Package →</a></p>` : ''}
            </div>
            ` : `
            <div style="background-color: #fff3e0; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #ff9800;">
              <p style="margin: 0;">Your order is being prepared for shipment. You will receive tracking information once it ships.</p>
            </div>
            `}
            
            <p>If you have any questions about your order, please don't hesitate to reach out to us.</p>
            
            <p>Thank you for your support!</p>
            
            <p style="margin-top: 30px;">
              <strong>Average Dad Athletics</strong><br>
              <a href="mailto:support@averagedadathletics.com" style="color: #1a1a1a;">support@averagedadathletics.com</a>
            </p>
          </div>
        </body>
      </html>
    `

    const emailText = `
Average Dad Athletics - Your Order Has Shipped!

Hi ${data.customerName},

Great news! Your order #${data.orderNumber} has shipped and is on its way to you!

Order Details:
${itemsList}
${trackingInfo}

If you have any questions about your order, please don't hesitate to reach out to us.

Thank you for your support!

Average Dad Athletics
support@averagedadathletics.com
    `.trim()

    const result = await resend.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `Your Order #${data.orderNumber} Has Shipped! 🎉`,
      html: emailHtml,
      text: emailText,
    })

    console.log('✅ Shipping notification email sent successfully:', result)
    return
  } catch (error: any) {
    console.error('❌ Error sending shipping notification email:', error)
    throw error
  }
}
