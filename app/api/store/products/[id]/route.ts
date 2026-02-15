import { NextRequest, NextResponse } from 'next/server'
import { getPrintfulProductVariants } from '@/lib/printful-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id

    // Fetch product details and variants from Printful
    // For now, return mock data - replace with actual Printful API call
    const product = {
      id: productId,
      name: 'Average Dad Athletics T-Shirt',
      description: 'Premium quality t-shirt with Average Dad Athletics branding. Made from 100% cotton for maximum comfort.',
      price: 2499, // $24.99 in cents
      currency: 'usd',
      image: '/placeholder-tshirt.jpg',
      printfulProductId: 1,
      variants: [
        {
          id: 1,
          name: 'T-Shirt - Small - Black',
          size: 'S',
          color: 'Black',
          color_code: '#000000',
          image: '/placeholder-tshirt.jpg',
          price: '24.99',
          in_stock: true,
        },
        {
          id: 2,
          name: 'T-Shirt - Medium - Black',
          size: 'M',
          color: 'Black',
          color_code: '#000000',
          image: '/placeholder-tshirt.jpg',
          price: '24.99',
          in_stock: true,
        },
        {
          id: 3,
          name: 'T-Shirt - Large - Black',
          size: 'L',
          color: 'Black',
          color_code: '#000000',
          image: '/placeholder-tshirt.jpg',
          price: '24.99',
          in_stock: true,
        },
      ],
    }

    // If you have a Printful product ID, fetch variants:
    // const variants = await getPrintfulProductVariants(product.printfulProductId)
    // product.variants = variants

    return NextResponse.json({ product })
  } catch (error: any) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product', message: error.message },
      { status: 500 }
    )
  }
}
