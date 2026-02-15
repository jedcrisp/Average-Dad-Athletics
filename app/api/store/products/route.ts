import { NextResponse } from 'next/server'
import { getPrintfulProducts, PrintfulProduct, extractProductImage } from '@/lib/printful-helpers'

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
        // Use shared image extraction function for consistency
        const image = extractProductImage(p)
        
        console.log(`Processing product: ${p.id} - ${p.name}`)
        console.log(`  Image URL: ${image}`)
        
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
