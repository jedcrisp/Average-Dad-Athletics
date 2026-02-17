import { NextResponse } from 'next/server'
import { getPrintfulProducts, getPrintfulStoreProduct, getPrintfulProductVariants, PrintfulProduct, extractProductImage } from '@/lib/printful-helpers'

/**
 * Calculate price range from variants
 */
function calculatePriceRange(variants: any[]): { min: number; max: number; currency: string } {
  if (!variants || variants.length === 0) {
    console.warn('  ⚠️ No variants provided for price calculation')
    return { min: 24.99, max: 24.99, currency: 'usd' }
  }

  const prices = variants
    .map((v: any, index: number) => {
      // Try multiple price fields - Printful uses different fields for different product types
      const priceStr = v.retail_price || v.price || v.retailPrice || v.unit_price || null
      
      if (!priceStr) {
        console.warn(`  ⚠️ Variant ${index} (${v.name || v.id || 'unknown'}) has no price field`)
        return null
      }
      
      const price = parseFloat(priceStr.toString())
      if (isNaN(price) || price <= 0) {
        console.warn(`  ⚠️ Variant ${index} (${v.name || v.id || 'unknown'}) has invalid price: ${priceStr}`)
        return null
      }
      
      return price
    })
    .filter((p: number | null): p is number => p !== null && !isNaN(p) && p > 0)

  if (prices.length === 0) {
    console.warn('  ⚠️ No valid prices found in variants, using default')
    return { min: 24.99, max: 24.99, currency: 'usd' }
  }

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  
  // If all variants have the same price, still return a range (min === max)
  // This ensures the frontend always shows a range format
  console.log(`  💰 Price range calculated: $${min.toFixed(2)} - $${max.toFixed(2)} (from ${prices.length} variants)`)
  
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
        .map(async (p: any) => {
          // p.id can be numeric or alphanumeric string (sync product ID)
          // For sync products, the id is alphanumeric like "699204a318b1a7"
          // For catalog products, the id is numeric
          const productId = typeof p.id === 'string' ? p.id : p.id.toString()
          console.log(`Processing product: ${productId} (type: ${typeof p.id}, raw: ${JSON.stringify(p.id)}) - ${p.name}`)
          console.log(`Product structure:`, {
            id: p.id,
            idType: typeof p.id,
            hasSyncProduct: !!p.sync_product,
            syncProductId: p.sync_product?.id,
            productId: p.product_id,
          })
          
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
            
            // Calculate price range from variants - check multiple sources
            let variantsFound = false
            
            // First, try sync_variants (for sync products)
            if (storeProduct.sync_variants && Array.isArray(storeProduct.sync_variants) && storeProduct.sync_variants.length > 0) {
              console.log(`  ✅ Found ${storeProduct.sync_variants.length} sync_variants for price calculation`)
              priceRange = calculatePriceRange(storeProduct.sync_variants)
              variantsFound = true
            }
            
            // If no sync variants, try variants array (alternative structure)
            if (!variantsFound && storeProduct.variants && Array.isArray(storeProduct.variants) && storeProduct.variants.length > 0) {
              console.log(`  ✅ Found ${storeProduct.variants.length} variants for price calculation`)
              priceRange = calculatePriceRange(storeProduct.variants)
              variantsFound = true
            }
            
            // Fallback to catalog variants using product_id
            if (!variantsFound && storeProduct.product_id) {
              console.log(`  📡 Fetching catalog variants for product ${storeProduct.product_id}...`)
              try {
                const catalogVariants = await getPrintfulProductVariants(Number(storeProduct.product_id))
                if (catalogVariants && catalogVariants.length > 0) {
                  console.log(`  ✅ Found ${catalogVariants.length} catalog variants for price calculation`)
                  priceRange = calculatePriceRange(catalogVariants)
                  variantsFound = true
                } else {
                  console.log(`  ⚠️ No catalog variants found for product ${storeProduct.product_id}`)
                }
              } catch (catalogError: any) {
                console.warn(`  ⚠️ Could not fetch catalog variants: ${catalogError.message}`)
              }
            }
            
            // If still no variants found, log warning
            if (!variantsFound) {
              console.warn(`  ⚠️ No variants found for product ${productId}, using default price range`)
              console.log(`  Product structure:`, {
                hasSyncVariants: !!storeProduct.sync_variants,
                syncVariantsCount: storeProduct.sync_variants?.length || 0,
                hasVariants: !!storeProduct.variants,
                variantsCount: storeProduct.variants?.length || 0,
                productId: storeProduct.product_id,
                syncProductId: storeProduct.sync_product?.id,
              })
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
