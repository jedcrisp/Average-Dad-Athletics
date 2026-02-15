import { NextResponse } from 'next/server'
import { getPrintfulProducts } from '@/lib/printful-helpers'

export async function GET() {
  try {
    // For now, return mock products or fetch from Printful
    // You'll need to sync your Printful store products with your database
    // or fetch directly from Printful API
    
    // Example: Fetch from Printful
    // const products = await getPrintfulProducts()
    
    // For now, return mock data structure
    // Replace this with actual Printful integration
    const products = [
      {
        id: '1',
        name: 'Average Dad Athletics T-Shirt',
        description: 'Premium quality t-shirt with Average Dad Athletics branding',
        price: 2499, // $24.99 in cents
        currency: 'usd',
        image: '/placeholder-tshirt.jpg',
        printfulProductId: 1,
        category: 'apparel',
      },
      // Add more products as needed
    ]

    return NextResponse.json({ products })
  } catch (error: any) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', message: error.message },
      { status: 500 }
    )
  }
}
