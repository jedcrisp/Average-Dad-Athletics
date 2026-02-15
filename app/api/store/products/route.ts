import { NextResponse } from 'next/server'
import { getPrintfulProducts, getPrintfulStoreProduct, getPrintfulProductVariants, PrintfulProduct, extractProductImage } from '@/lib/printful-helpers'

/**
 * Calculate price range from variants
 */
function calculatePriceRange(variants: any[]): { min: number; max: number; currency: string } {
  if (!variants || variants.length === 0) {
    return { min: 24.99, max: 24.99, currency: 'usd' }
  }

  const prices = variants
    .map((v: any) => {
      // Price can be string or number, handle both
      const priceStr = v.retail_price || v.price || '24.99'
      return parseFloat(priceStr.toString())
    })
    .filter((p: number) => !isNaN(p) && p > 0)

  if (prices.length === 0) {
    return { min: 24.99, max: 24.99, currency: 'usd' }
  }

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  
  return { min, max, currency: 'usd' }
}

export async function GET() {
  try {
    // Fetch directly from Printful (always up-to-date)
    console.log('Fetching products directly from Printful...')
    const printfulProducts = await getPrintfulProducts()
    console.log(`Received ${printfulProducts.length} products from Printful API`)
    
    if (printfulProducts.length === 0) {
      console.warn('No products returned from Printful API')
      return NextResponse.json({ 
        products: [],
        source: 'printful',
        message: 'No products found in Printful store. Make sure you have added products to your Printful store.',
      })
    }
    
    // Transform Printful products to our store format with price ranges
    const products = await Promise.all(
      printfulProducts
        .filter((p: PrintfulProduct) => {
          if (p.is_discontinued) {
            console.log(`Skipping discontinued product: ${p.id} - ${p.name}`)
            return false
          }
          return true
        })
        .map(async (p: PrintfulProduct) => {
          // Use shared image extraction function for consistency
          const image = extractProductImage(p)
          
          console.log(`Processing product: ${p.id} - ${p.name}`)
          console.log(`  Image URL: ${image}`)
          
          // Fetch variants to calculate price range
          let priceRange = { min: 24.99, max: 24.99, currency: 'usd' }
          
          try {
            // First try to get store product with sync_variants
            const storeProduct = await getPrintfulStoreProduct(p.id.toString())
            
            if (storeProduct.sync_variants && Array.isArray(storeProduct.sync_variants) && storeProduct.sync_variants.length > 0) {
              console.log(`  Found ${storeProduct.sync_variants.length} sync_variants for price calculation`)
              priceRange = calculatePriceRange(storeProduct.sync_variants)
            } else if (storeProduct.product_id) {
              // Fallback to catalog variants
              console.log(`  Fetching catalog variants for product ${storeProduct.product_id}`)
              const catalogVariants = await getPrintfulProductVariants(storeProduct.product_id)
              if (catalogVariants && catalogVariants.length > 0) {
                priceRange = calculatePriceRange(catalogVariants)
              }
            }
          } catch (variantError: any) {
            console.warn(`  Could not fetch variants for product ${p.id}, using default price:`, variantError.message)
            // Use default price if variant fetch fails
          }
          
          console.log(`  Price range: $${priceRange.min.toFixed(2)} - $${priceRange.max.toFixed(2)}`)
          
          return {
            id: p.id.toString(),
            name: p.name,
            description: p.description || '',
            priceMin: Math.round(priceRange.min * 100), // Convert to cents
            priceMax: Math.round(priceRange.max * 100), // Convert to cents
            currency: priceRange.currency,
            image: image,
            printfulProductId: p.id,
            category: p.type || 'apparel',
          }
        })
    )

    console.log(`Returning ${products.length} products to frontend`)
    return NextResponse.json({ products })
  } catch (error: any) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ 
      products: [],
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
