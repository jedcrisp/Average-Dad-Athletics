import { NextRequest, NextResponse } from 'next/server'
import { sendShippingNotification } from '@/lib/email-helpers'

/**
 * Test endpoint for shipping notification emails
 * 
 * This allows you to test the email sending functionality without needing
 * a real shipped order. Useful for verifying email configuration.
 * 
 * Usage:
 * POST /api/printful/test-email
 * Body: { "email": "test@example.com" }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const testEmail = body.email

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      )
    }

    console.log('📧 Sending test shipping notification email to:', testEmail)

    // Send test email with sample data
    try {
      await sendShippingNotification({
        customerEmail: testEmail,
        customerName: 'Test Customer',
        orderNumber: 'TEST-12345',
        trackingNumber: '1Z999AA10123456784',
        trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=1Z999AA10123456784',
        carrier: 'USPS',
        items: [
          { name: 'Test T-Shirt', quantity: 1 },
          { name: 'Test Hoodie', quantity: 2 },
        ],
      })

      console.log('✅ Test email sent successfully')

      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        sentTo: testEmail,
        note: 'Check your inbox (and spam folder) for the test email',
      })
    } catch (emailError: any) {
      console.error('❌ Error sending test email:', emailError)
      return NextResponse.json(
        {
          error: 'Failed to send test email',
          details: emailError.message,
          help: 'Check that RESEND_API_KEY and RESEND_FROM_EMAIL are configured correctly',
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('❌ Error in test email endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to show usage instructions
 */
export async function GET() {
  return NextResponse.json({
    message: 'Test Email Endpoint',
    usage: {
      method: 'POST',
      url: '/api/printful/test-email',
      body: {
        email: 'test@example.com',
      },
      description: 'Sends a test shipping notification email to the specified address',
    },
    example: {
      curl: `curl -X POST https://yourdomain.com/api/printful/test-email \\
  -H "Content-Type: application/json" \\
  -d '{"email":"your-email@example.com"}'`,
    },
  })
}
