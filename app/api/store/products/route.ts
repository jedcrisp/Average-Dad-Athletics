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
          // p.id can be numeric or alphanumeric string (sync product ID)
          const productId = typeof p.id === 'string' ? p.id : p.id.toString()
          console.log(`Processing product: ${productId} (type: ${typeof p.id}) - ${p.name}`)
          
          // Fetch full store product to get better image and variants
          let image = extractProductImage(p) // Start with list product image
          let priceRange = { min: 24.99, max: 24.99, currency: 'usd' }
          
          try {
            // Get full store product (has better image extraction with catalog fallback)
            // Use the product ID as-is (could be alphanumeric sync product ID)
            const storeProduct = await getPrintfulStoreProduct(productId)
            
            // Use image from full store product (it has fallback to catalog product)
            const storeProductImage = extractProductImage(storeProduct)
            const defaultImage = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&crop=center'
            
            // Only use store product image if it's not the default and is different/better
            if (storeProductImage && storeProductImage !== defaultImage) {
              image = storeProductImage
              console.log(`  ✅ Using image from store product: ${image.substring(0, 80)}...`)
            } else if (image === defaultImage && storeProductImage !== defaultImage) {
              // If list image is default but store product has something, use it
              image = storeProductImage
              console.log(`  ✅ Using store product image (list had default): ${image.substring(0, 80)}...`)
            } else {
              console.log(`  📸 Using image from list: ${image.substring(0, 80)}...`)
            }
            
            // Calculate price range from variants
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
            console.warn(`  Could not fetch full product details for ${productId}:`, variantError.message)
            // Keep the image from list API if store product fetch fails
          }
          
          console.log(`  Price range: $${priceRange.min.toFixed(2)} - $${priceRange.max.toFixed(2)}`)
          console.log(`  Final image: ${image.substring(0, 80)}...`)
          
          return {
            id: productId, // Use the product ID as-is (preserves alphanumeric sync product IDs)
            name: p.name,
            description: p.description || '',
            priceMin: Math.round(priceRange.min * 100), // Convert to cents
            priceMax: Math.round(priceRange.max * 100), // Convert to cents
            currency: priceRange.currency,
            image: image,
            printfulProductId: productId, // Store the actual product ID (sync product ID for store products)
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
