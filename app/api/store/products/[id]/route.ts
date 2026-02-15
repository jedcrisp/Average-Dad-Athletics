import { NextRequest, NextResponse } from 'next/server'
import { getPrintfulStoreProduct, getPrintfulProductVariants } from '@/lib/printful-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params

    // Fetch directly from Printful (always up-to-date)
    const storeProduct = await getPrintfulStoreProduct(productId)
    
    if (!storeProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get product image - try multiple sources
    let image = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&crop=center'
    
    // Check files array first
    if (storeProduct.files && storeProduct.files.length > 0) {
      const file = storeProduct.files[0]
      image = file.preview_url || file.thumbnail_url || image
      console.log(`Product ${productId} image from files:`, image)
    }
    
    // Check for direct image properties
    if (!image || image.includes('unsplash.com')) {
      if (storeProduct.image) {
        image = storeProduct.image
        console.log(`Product ${productId} image from product.image:`, image)
      } else if (storeProduct.thumbnail) {
        image = storeProduct.thumbnail
        console.log(`Product ${productId} image from product.thumbnail:`, image)
      } else if (storeProduct.thumbnail_url) {
        image = storeProduct.thumbnail_url
        console.log(`Product ${productId} image from product.thumbnail_url:`, image)
      } else if (storeProduct.preview_url) {
        image = storeProduct.preview_url
        console.log(`Product ${productId} image from product.preview_url:`, image)
      }
    }
    
    // Log for debugging
    console.log(`Product ${productId} full structure:`, {
      hasFiles: !!storeProduct.files,
      filesLength: storeProduct.files?.length || 0,
      imageKeys: Object.keys(storeProduct).filter(k => k.toLowerCase().includes('image') || k.toLowerCase().includes('thumbnail') || k.toLowerCase().includes('preview')),
      finalImage: image,
    })

    // Get variants from the catalog product
    let variants: any[] = []
    if (storeProduct.product_id) {
      try {
        const catalogVariants = await getPrintfulProductVariants(storeProduct.product_id)
        variants = catalogVariants.map((v: any) => ({
          id: v.id,
          name: v.name,
          size: v.size,
          color: v.color,
          color_code: v.color_code,
          image: v.image || image,
          price: v.price || '24.99',
          in_stock: v.in_stock !== false,
        }))
      } catch (variantError) {
        console.warn('Could not fetch variants, using defaults:', variantError)
        // Fallback to basic variants if catalog fetch fails
        variants = [
          { id: 1, name: 'Small', size: 'S', color: 'Black', color_code: '#000000', image, price: '24.99', in_stock: true },
          { id: 2, name: 'Medium', size: 'M', color: 'Black', color_code: '#000000', image, price: '24.99', in_stock: true },
          { id: 3, name: 'Large', size: 'L', color: 'Black', color_code: '#000000', image, price: '24.99', in_stock: true },
        ]
      }
    }

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

    return NextResponse.json({ product })
  } catch (error: any) {
    console.error('Error fetching product from Printful:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product', message: error.message },
      { status: 500 }
    )
  }
}
