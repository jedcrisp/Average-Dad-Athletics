import { NextRequest, NextResponse } from 'next/server'
import { getPrintfulProducts } from '@/lib/printful-helpers'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  console.log('=== SYNC STARTED ===')
  console.log('Timestamp:', new Date().toISOString())
  
  try {
    // Note: Server-side API routes don't have auth context by default
    // For now, we'll proceed with the sync (frontend already checks admin status)
    // For production, consider using Firebase Admin SDK to bypass security rules

    // Check Firebase
    if (!db) {
      console.error('❌ Firebase is not configured')
      throw new Error('Firebase is not configured')
    }
    console.log('✅ Firebase is configured')

    // Check Printful API key
    const apiKey = process.env.PRINTFUL_API_KEY
    if (!apiKey) {
      console.error('❌ PRINTFUL_API_KEY is not set')
      throw new Error('PRINTFUL_API_KEY is not set in environment variables')
    }
    console.log('✅ Printful API key is set (length:', apiKey.length, ')')

    // Fetch products from Printful
    console.log('📡 Fetching products from Printful API...')
    console.log('API Endpoint: https://api.printful.com/store/products')
    
    let printfulProducts
    try {
      printfulProducts = await getPrintfulProducts()
      console.log(`✅ Received ${printfulProducts.length} products from Printful API`)
    } catch (fetchError: any) {
      console.error('❌ Error fetching from Printful:', fetchError)
      console.error('Error details:', {
        message: fetchError.message,
        stack: fetchError.stack,
      })
      throw fetchError
    }
    
    if (printfulProducts.length === 0) {
      console.warn('⚠️ No products returned from Printful')
      console.log('This could mean:')
      console.log('  1. No products in your Printful store')
      console.log('  2. All products are discontinued')
      console.log('  3. API endpoint or response structure issue')
      
      return NextResponse.json({
        success: true,
        synced: 0,
        failed: 0,
        products: [],
        message: 'No products found in Printful store. Make sure you have added products to your Printful store first.',
        debug: {
          apiKeySet: !!apiKey,
          apiKeyLength: apiKey?.length || 0,
          productsReceived: 0,
        },
      })
    }

    console.log('📦 Processing products:')
    printfulProducts.forEach((p: any, index: number) => {
      console.log(`  ${index + 1}. ID: ${p.id}, Name: ${p.name}, Discontinued: ${p.is_discontinued}`)
    })

    const syncedProducts: any[] = []
    let syncedCount = 0
    let failedCount = 0
    let skippedCount = 0

    // Sync each product to Firestore
    console.log('💾 Starting Firestore sync...')
    for (const product of printfulProducts) {
      try {
        console.log(`\n🔄 Processing product: ${product.id} - ${product.name}`)
        console.log('   Product data:', {
          id: product.id,
          name: product.name,
          is_discontinued: product.is_discontinued,
          hasFiles: !!(product.files && product.files.length > 0),
          fileCount: product.files?.length || 0,
        })
        
        // Skip discontinued products
        if (product.is_discontinued) {
          console.log(`   ⏭️ Skipping discontinued product: ${product.id}`)
          skippedCount++
          continue
        }

        // Get the first image from files
        const image = product.files && product.files.length > 0
          ? product.files[0].preview_url || product.files[0].thumbnail_url
          : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&crop=center'

        // Prepare product data for Firestore
        // Helper function to remove undefined values (Firestore doesn't allow undefined)
        const removeUndefined = (obj: any): any => {
          if (obj === null || obj === undefined) {
            return null
          }
          if (Array.isArray(obj)) {
            return obj.map(removeUndefined)
          }
          if (typeof obj === 'object') {
            const cleaned: any = {}
            for (const [key, value] of Object.entries(obj)) {
              if (value !== undefined) {
                cleaned[key] = removeUndefined(value)
              }
            }
            return cleaned
          }
          return obj
        }

        const productData = removeUndefined({
          id: product.id.toString(),
          name: product.name,
          description: product.description || 'Premium quality product',
          price: 2499, // Default price in cents - you may want to calculate from variants
          currency: product.currency || 'usd',
          image: image,
          printfulProductId: product.id,
          category: product.type || 'apparel',
          // Store Printful data for reference (only if values exist)
          printfulData: {
            ...(product.type && { type: product.type }),
            ...(product.dimensions && { dimensions: product.dimensions }),
            ...(product.size && { size: product.size }),
            ...(product.availability_status && { availability_status: product.availability_status }),
          },
          // Store files for variant images
          files: product.files || [],
          // Store options for variants
          options: product.options || [],
          syncedAt: new Date().toISOString(),
        })

        // Save to Firestore
        console.log(`   💾 Saving to Firestore: storeProducts/${product.id.toString()}`)
        console.log(`   📝 Product data to save:`, JSON.stringify(productData, null, 2))
        
        try {
          const productRef = doc(db, 'storeProducts', product.id.toString())
          console.log(`   🔄 Calling setDoc...`)
          await setDoc(productRef, productData, { merge: true })
          console.log(`   ✅ Successfully saved product ${product.id} to Firestore`)
        } catch (firestoreError: any) {
          console.error(`   ❌ Firestore save error for product ${product.id}:`, firestoreError)
          console.error(`   Error details:`, {
            code: firestoreError.code,
            message: firestoreError.message,
            stack: firestoreError.stack,
          })
          throw firestoreError // Re-throw to be caught by outer catch
        }

        syncedProducts.push({
          id: product.id.toString(),
          name: product.name,
        })
        syncedCount++
      } catch (error: any) {
        console.error(`   ❌ Error syncing product ${product.id}:`, error)
        console.error('   Error details:', {
          message: error.message,
          code: error.code,
          name: error.name,
          stack: error.stack?.substring(0, 500), // First 500 chars of stack
        })
        
        // Check for specific error types
        if (error.code === 'permission-denied') {
          console.error('   ⚠️ PERMISSION DENIED - Check Firestore security rules for storeProducts collection')
          console.error('   Make sure admins can write to storeProducts collection')
          console.error('   Current user needs to be marked as admin in Firestore')
        } else if (error.code === 'unavailable') {
          console.error('   ⚠️ FIRESTORE UNAVAILABLE - Check your internet connection')
        } else if (error.message?.includes('Invalid document reference')) {
          console.error('   ⚠️ INVALID DOCUMENT REFERENCE - Check product ID format')
        }
        
        // Store error for response
        syncedProducts.push({
          id: product.id.toString(),
          name: product.name,
          error: error.message || 'Unknown error',
          code: error.code,
        })
        
        failedCount++
      }
    }
    
    console.log('\n=== SYNC COMPLETE ===')
    console.log('Summary:', {
      total: printfulProducts.length,
      synced: syncedCount,
      skipped: skippedCount,
      failed: failedCount,
    })

    // Filter out failed products from the products array (keep only successful ones)
    const successfulProducts = syncedProducts.filter((p: any) => !p.error)
    const failedProducts = syncedProducts.filter((p: any) => p.error)
    
    const result = {
      success: syncedCount > 0,
      synced: syncedCount,
      failed: failedCount,
      skipped: skippedCount,
      total: printfulProducts.length,
      products: successfulProducts,
      failedProducts: failedProducts.length > 0 ? failedProducts : undefined,
      message: syncedCount === 0 
        ? failedCount > 0 
          ? `Failed to sync products. Check server logs for details. ${failedProducts[0]?.error || ''}`
          : 'No products were synced. Check if products exist in Printful and are not discontinued.'
        : `Successfully synced ${syncedCount} product(s)`,
    }
    
    console.log('📤 Returning result:', result)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('\n❌ === SYNC FAILED ===')
    console.error('Error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to sync products',
        message: error.message,
        debug: {
          hasApiKey: !!process.env.PRINTFUL_API_KEY,
          hasFirebase: !!db,
          errorType: error.name,
        },
      },
      { status: 500 }
    )
  }
}
