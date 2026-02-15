import { NextResponse } from 'next/server'
import { getPrintfulProducts, PrintfulProduct } from '@/lib/printful-helpers'

export async function GET() {
  try {
    // Fetch products from Printful store
    const printfulProducts = await getPrintfulProducts()
    
    // Transform Printful products to our store format
    const products = printfulProducts
      .filter((p: PrintfulProduct) => !p.is_discontinued) // Only show active products
      .map((p: PrintfulProduct) => {
        // Get the first image from files, or use a placeholder
        const image = p.files && p.files.length > 0 
          ? p.files[0].preview_url || p.files[0].thumbnail_url 
          : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&crop=center'
        
        // Get base price from first variant or use default
        // Note: Printful store products may have different pricing structure
        const basePrice = 2499 // Default $24.99 in cents - you may need to fetch variants for actual pricing
        
        return {
          id: p.id.toString(),
          name: p.name,
          description: p.description || 'Premium quality product',
          price: basePrice,
          currency: p.currency || 'usd',
          image: image,
          printfulProductId: p.id,
          category: p.type || 'apparel',
        }
      })

    // If no products from Printful, return empty array or fallback
    return NextResponse.json({ products })
  } catch (error: any) {
    console.error('Error fetching products from Printful:', error)
    
    // If Printful API fails, return empty array instead of error
    // This allows the store page to still load
    return NextResponse.json({ 
      products: [],
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
