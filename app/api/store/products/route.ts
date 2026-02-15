import { NextResponse } from 'next/server'
import { getPrintfulProducts, PrintfulProduct } from '@/lib/printful-helpers'

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
    
    // Transform Printful products to our store format
    const products = printfulProducts
      .filter((p: PrintfulProduct) => {
        if (p.is_discontinued) {
          console.log(`Skipping discontinued product: ${p.id} - ${p.name}`)
          return false
        }
        return true
      })
      .map((p: PrintfulProduct) => {
        // Try multiple image sources from Printful response
        let image = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&crop=center'
        
        // Check files array first
        if (p.files && p.files.length > 0) {
          const file = p.files[0]
          image = file.preview_url || file.thumbnail_url || image
          console.log(`Product ${p.id} image from files:`, image)
        }
        
        // Check for direct image properties on product
        if (!image || image.includes('unsplash.com')) {
          const productAny = p as any
          if (productAny.image) {
            image = productAny.image
            console.log(`Product ${p.id} image from product.image:`, image)
          } else if (productAny.thumbnail) {
            image = productAny.thumbnail
            console.log(`Product ${p.id} image from product.thumbnail:`, image)
          } else if (productAny.thumbnail_url) {
            image = productAny.thumbnail_url
            console.log(`Product ${p.id} image from product.thumbnail_url:`, image)
          } else if (productAny.preview_url) {
            image = productAny.preview_url
            console.log(`Product ${p.id} image from product.preview_url:`, image)
          }
        }
        
        // Log full product structure for debugging
        console.log(`Processing product: ${p.id} - ${p.name}`)
        console.log(`  Image URL: ${image}`)
        console.log(`  Files array:`, p.files ? `${p.files.length} files` : 'no files')
        if (p.files && p.files.length > 0) {
          console.log(`  First file:`, JSON.stringify(p.files[0], null, 2))
        }
        console.log(`  Full product keys:`, Object.keys(p))
        
        return {
          id: p.id.toString(),
          name: p.name,
          description: p.description || 'Premium quality product',
          price: 2499,
          currency: p.currency || 'usd',
          image: image,
          printfulProductId: p.id,
          category: p.type || 'apparel',
        }
      })

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
