import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

/**
 * Get all orders for admin view
 * Returns orders sorted by creation date (newest first)
 */
export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') // Optional: filter by status

    let query = adminDb.collection('orders').orderBy('createdAt', 'desc')

    // Filter by status if provided
    if (status) {
      query = query.where('status', '==', status) as any
    }

    // Limit results
    const ordersSnapshot = await query.limit(limit).get()

    const orders = ordersSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        // Convert Firestore timestamps to ISO strings
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        shippedAt: data.shippedAt?.toDate?.()?.toISOString() || data.shippedAt,
      }
    })

    return NextResponse.json({
      orders,
      count: orders.length,
      total: ordersSnapshot.size,
    })
  } catch (error: any) {
    console.error('❌ Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
