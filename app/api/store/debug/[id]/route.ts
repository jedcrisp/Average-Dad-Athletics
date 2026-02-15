import { NextRequest, NextResponse } from 'next/server'
import { getPrintfulStoreProduct, getPrintfulProductVariants } from '@/lib/printful-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params

    // Fetch store product
    const storeProduct = await getPrintfulStoreProduct(productId)
    
    // Fetch variants if product_id exists
    let catalogVariants: any[] = []
    if (storeProduct?.product_id) {
      try {
        catalogVariants = await getPrintfulProductVariants(storeProduct.product_id)
      } catch (error) {
        console.error('Error fetching variants:', error)
      }
    }

    return NextResponse.json({
      storeProduct,
      catalogVariants,
      storeProductKeys: storeProduct ? Object.keys(storeProduct) : [],
      variantCount: catalogVariants.length,
    }, { 
      headers: {
        'Content-Type': 'application/json',
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
