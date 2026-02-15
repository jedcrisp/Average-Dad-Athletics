import { NextRequest, NextResponse } from 'next/server'
import { getPrintfulProducts, getPrintfulStoreProduct, getPrintfulProductVariants, extractProductImage } from '@/lib/printful-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params

    // First, try to get the product from the list API to ensure same image as storefront
    let storeProduct: any = null
    let image = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&crop=center'
    
    try {
      const allProducts = await getPrintfulProducts()
      const productFromList = allProducts.find((p: any) => p.id.toString() === productId)
      
      if (productFromList) {
        console.log(`✅ Found product ${productId} in list, using same image as storefront`)
        image = extractProductImage(productFromList)
        // Still fetch full product details for variants
        storeProduct = await getPrintfulStoreProduct(productId)
        // Override image with the one from list to ensure consistency
        storeProduct.image = image
      } else {
        console.log(`⚠️ Product ${productId} not found in list, fetching directly`)
        storeProduct = await getPrintfulStoreProduct(productId)
        image = extractProductImage(storeProduct)
      }
    } catch (listError) {
      console.warn('Could not fetch from list, falling back to direct fetch:', listError)
      storeProduct = await getPrintfulStoreProduct(productId)
      image = extractProductImage(storeProduct)
    }
    
    if (!storeProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Image is already set above from list API to ensure consistency
    console.log(`Product ${productId} final image: ${image}`)

    // Get variants - try store product variants first, then catalog variants
    let variants: any[] = []
    
    // First, check if store product has variants directly
    console.log('🔍 Checking for variants in store product...')
    console.log('Store product keys:', Object.keys(storeProduct))
    console.log('Store product has variants?', !!storeProduct.variants)
    console.log('Store product has sync_variants?', !!storeProduct.sync_variants)
    
    if (storeProduct.sync_variants && Array.isArray(storeProduct.sync_variants) && storeProduct.sync_variants.length > 0) {
      console.log(`📦 Found ${storeProduct.sync_variants.length} sync_variants in store product`)
      variants = storeProduct.sync_variants.map((v: any) => {
        const variantId = v.variant_id || v.id
        const isInStock = v.is_enabled !== false && v.availability_status !== 'out_of_stock'
        
        console.log(`  Store Variant ${variantId}: enabled=${v.is_enabled}, status=${v.availability_status}, in_stock=${isInStock}`)
        
        return {
          id: variantId,
          name: v.name || `${v.size || ''} - ${v.color || ''}`,
          size: v.size || '',
          color: v.color || '',
          color_code: v.color_code || '#000000',
          image: v.image || image,
          price: v.retail_price || v.price || '24.99',
          in_stock: isInStock,
          availability_status: v.availability_status,
        }
      })
    } else if (storeProduct.product_id) {
      // Fallback: Get variants from catalog product
      console.log(`📡 Fetching variants from catalog product ${storeProduct.product_id}...`)
      try {
        const catalogVariants = await getPrintfulProductVariants(storeProduct.product_id)
        console.log(`📦 Processing ${catalogVariants.length} catalog variants...`)
        
        variants = catalogVariants.map((v: any) => {
          // Determine stock status - Default to in_stock unless explicitly marked otherwise
          // Printful may not always return these fields, so we default to available
          const availabilityStatus = (v.availability_status || '').toLowerCase()
          // Only mark as out of stock if explicitly set to out_of_stock or discontinued
          const isInStock = availabilityStatus !== 'out_of_stock' && 
                          availabilityStatus !== 'discontinued'
          
          // If in_stock field exists and is explicitly false, respect it
          if (v.in_stock === false && isInStock) {
            console.log(`  ⚠️ Variant ${v.id} has in_stock=false, marking as out of stock`)
          }
          const finalInStock = v.in_stock === false ? false : isInStock
          
          // Use variant-specific image if available, otherwise use product image
          const variantImage = v.image || image
          
          // Get price - Printful returns price as string
          const variantPrice = v.retail_price || v.price || '24.99'
          
          console.log(`  Catalog Variant ${v.id}: ${v.name || `${v.size} - ${v.color}`}`)
          console.log(`    - availability_status: ${v.availability_status || 'not set'}`)
          console.log(`    - in_stock field: ${v.in_stock}`)
          console.log(`    - calculated in_stock: ${finalInStock}`)
          console.log(`    - price: ${variantPrice}`)
          console.log(`    - image: ${variantImage ? variantImage.substring(0, 50) + '...' : 'no image'}`)
          
          return {
            id: v.id,
            name: v.name || `${v.size || ''} - ${v.color || ''}`,
            size: v.size || '',
            color: v.color || '',
            color_code: v.color_code || '#000000',
            image: variantImage,
            price: variantPrice,
            in_stock: finalInStock,
            availability_status: v.availability_status,
          }
        })
        
        console.log(`✅ Processed ${variants.length} variants`)
      } catch (variantError: any) {
        console.error('❌ Could not fetch variants:', variantError)
        console.error('Error details:', {
          message: variantError.message,
          stack: variantError.stack,
        })
        console.warn('Using fallback variants')
        // Fallback to basic variants if catalog fetch fails
        variants = [
          { id: 1, name: 'Small', size: 'S', color: 'Black', color_code: '#000000', image, price: '24.99', in_stock: true },
          { id: 2, name: 'Medium', size: 'M', color: 'Black', color_code: '#000000', image, price: '24.99', in_stock: true },
          { id: 3, name: 'Large', size: 'L', color: 'Black', color_code: '#000000', image, price: '24.99', in_stock: true },
        ]
      }
    } else {
      console.warn('⚠️ Store product has no product_id and no sync_variants, cannot fetch variants')
    }
    
    console.log(`📤 Returning ${variants.length} variants to frontend`)

    const product = {
      id: productId,
      name: storeProduct.name || 'Product',
      description: storeProduct.description || 'Premium quality product',
      price: 2499, // Default price in cents - you may need to calculate from variants
      currency: storeProduct.currency || 'usd',
      image: image,
      printfulProductId: storeProduct.product_id || storeProduct.id,
      variants: variants,
    }

    // Log final product for debugging
    console.log('📤 Final product being returned:', {
      id: product.id,
      name: product.name,
      variantCount: product.variants.length,
      variants: product.variants.map((v: any) => ({
        id: v.id,
        name: v.name,
        in_stock: v.in_stock,
        price: v.price,
      })),
    })

    return NextResponse.json({ product })
  } catch (error: any) {
    console.error('Error fetching product from Printful:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product', message: error.message },
      { status: 500 }
    )
  }
}
