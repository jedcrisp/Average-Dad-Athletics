import { NextRequest, NextResponse } from 'next/server'

const PRINTFUL_API_BASE = 'https://api.printful.com'

function getPrintfulApiKey(): string {
  const apiKey = process.env.PRINTFUL_API_KEY
  if (!apiKey) {
    throw new Error('PRINTFUL_API_KEY is not set in environment variables')
  }
  return apiKey
}

/**
 * Debug endpoint to list sync variants for a sync product
 * GET /api/printful/sync-variants?sync_product_id=699204a318b1a7
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const syncProductId = searchParams.get('sync_product_id')

    if (!syncProductId) {
      return NextResponse.json(
        { error: 'sync_product_id query parameter is required' },
        { status: 400 }
      )
    }

    const apiKey = getPrintfulApiKey()
    
    console.log(`🔍 Fetching sync product details for: ${syncProductId}`)
    
    // Fetch the sync product details
    const response = await fetch(`${PRINTFUL_API_BASE}/store/products/${syncProductId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Printful API error: ${response.status} - ${errorText}`)
      return NextResponse.json(
        { 
          error: 'Failed to fetch sync product',
          status: response.status,
          details: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    const syncProduct = data.result

    console.log(`✅ Fetched sync product: ${syncProductId}`)
    console.log(`📦 Product name: ${syncProduct.name || 'N/A'}`)
    console.log(`📦 Has sync_variants: ${!!syncProduct.sync_variants}`)
    console.log(`📦 Sync variants count: ${syncProduct.sync_variants?.length || 0}`)

    // Extract sync variants with their IDs
    const variants = (syncProduct.sync_variants || []).map((variant: any) => {
      return {
        sync_variant_id: variant.id || variant.variant_id || 'N/A',
        variant_id: variant.variant_id || variant.id || 'N/A', // Catalog variant ID
        size: variant.size || 'N/A',
        color: variant.color || 'N/A',
        color_code: variant.color_code || 'N/A',
        retail_price: variant.retail_price || variant.price || 'N/A',
        price: variant.price || variant.retail_price || 'N/A',
        in_stock: variant.in_stock !== false,
        availability_status: variant.availability_status || 'N/A',
        is_enabled: variant.is_enabled !== false,
        name: variant.name || `${variant.size || ''} - ${variant.color || ''}`,
        // Include files if available
        has_files: !!(variant.files && variant.files.length > 0),
        file_count: variant.files?.length || 0,
      }
    })

    return NextResponse.json({
      sync_product_id: syncProductId,
      product_name: syncProduct.name || 'N/A',
      product_id: syncProduct.product_id || 'N/A', // Catalog product ID
      variant_count: variants.length,
      variants: variants,
      // Include full sync product structure for debugging
      full_product: syncProduct,
    }, { status: 200 })
  } catch (error: any) {
    console.error('❌ Error fetching sync variants:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch sync variants',
        message: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}
