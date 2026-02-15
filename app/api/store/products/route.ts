import { NextResponse } from 'next/server'
import { storeProductHelpers } from '@/lib/firebase-helpers'
import { getPrintfulProducts, PrintfulProduct } from '@/lib/printful-helpers'

export async function GET() {
  try {
    // Try to fetch from Firestore first (faster, cached)
    try {
      const firestoreProducts = await storeProductHelpers.getAll()
      if (firestoreProducts.length > 0) {
        // Transform Firestore products to store format
        const products = firestoreProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          currency: p.currency,
          image: p.image,
          printfulProductId: p.printfulProductId,
          category: p.category,
        }))
        return NextResponse.json({ products, source: 'firestore' })
      }
    } catch (firestoreError) {
      console.warn('Error fetching from Firestore, falling back to Printful:', firestoreError)
    }

    // Fallback: Fetch directly from Printful if Firestore is empty
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
        const image = p.files && p.files.length > 0 
          ? p.files[0].preview_url || p.files[0].thumbnail_url 
          : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&crop=center'
        
        console.log(`Processing product: ${p.id} - ${p.name}`)
        
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
    return NextResponse.json({ products, source: 'printful' })
  } catch (error: any) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ 
      products: [],
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
