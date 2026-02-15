import { NextResponse } from 'next/server'
import { getPrintfulProducts } from '@/lib/printful-helpers'
import { collection, doc, setDoc, getDocs, query } from 'firebase/firestore'
import { db } from '@/lib/firebase-client'

export async function POST() {
  try {
    // Verify admin access (you can add admin verification here)
    // For now, we'll allow the sync - add proper auth checks in production

    if (!db) {
      throw new Error('Firebase is not configured')
    }

    // Fetch products from Printful
    console.log('Fetching products from Printful...')
    const printfulProducts = await getPrintfulProducts()
    console.log(`Received ${printfulProducts.length} products from Printful`)
    
    if (printfulProducts.length === 0) {
      return NextResponse.json({
        success: true,
        synced: 0,
        failed: 0,
        products: [],
        message: 'No products found in Printful store. Make sure you have added products to your Printful store first.',
      })
    }

    const syncedProducts: any[] = []
    let syncedCount = 0
    let failedCount = 0
    let skippedCount = 0

    // Sync each product to Firestore
    for (const product of printfulProducts) {
      try {
        console.log(`Processing product: ${product.id} - ${product.name}`)
        
        // Skip discontinued products
        if (product.is_discontinued) {
          console.log(`Skipping discontinued product: ${product.id}`)
          skippedCount++
          continue
        }

        // Get the first image from files
        const image = product.files && product.files.length > 0
          ? product.files[0].preview_url || product.files[0].thumbnail_url
          : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&crop=center'

        // Prepare product data for Firestore
        const productData = {
          id: product.id.toString(),
          name: product.name,
          description: product.description || 'Premium quality product',
          price: 2499, // Default price in cents - you may want to calculate from variants
          currency: product.currency || 'usd',
          image: image,
          printfulProductId: product.id,
          category: product.type || 'apparel',
          // Store Printful data for reference
          printfulData: {
            type: product.type,
            dimensions: product.dimensions,
            size: product.size,
            availability_status: product.availability_status,
          },
          // Store files for variant images
          files: product.files || [],
          // Store options for variants
          options: product.options || [],
          syncedAt: new Date().toISOString(),
        }

        // Save to Firestore
        const productRef = doc(db, 'storeProducts', product.id.toString())
        await setDoc(productRef, productData, { merge: true })

        syncedProducts.push({
          id: product.id.toString(),
          name: product.name,
        })
        syncedCount++
      } catch (error: any) {
        console.error(`Error syncing product ${product.id}:`, error)
        failedCount++
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      failed: failedCount,
      skipped: skippedCount,
      total: printfulProducts.length,
      products: syncedProducts,
      message: syncedCount === 0 
        ? 'No products were synced. Check if products exist in Printful and are not discontinued.'
        : `Successfully synced ${syncedCount} product(s)`,
    })
  } catch (error: any) {
    console.error('Error syncing products from Printful:', error)
    return NextResponse.json(
      { 
        error: 'Failed to sync products',
        message: error.message 
      },
      { status: 500 }
    )
  }
}
