// Printful API Helper Functions
// Documentation: https://developers.printful.com/

export interface PrintfulProduct {
  id: number
  name: string
  type: string
  description: string
  is_discontinued: boolean
  currency: string
  files: PrintfulFile[]
  options: PrintfulOption[]
  dimensions: string
  size: string
  availability_status: string
}

export interface PrintfulFile {
  id: number
  type: string
  title: string
  additional: any[]
  options: any[]
  thumbnail_url: string
  preview_url: string
  visible: boolean
  is_temporary: boolean
}

export interface PrintfulOption {
  id: string
  title: string
  type: string
  values: PrintfulOptionValue[]
  additional_price: string
}

export interface PrintfulOptionValue {
  id: number
  title: string
  colors?: string[]
  sizes?: string[]
}

export interface PrintfulVariant {
  id: number
  product_id: number
  name: string
  size: string
  color: string
  color_code: string
  color_code2: string | null
  image: string
  price: string
  in_stock: boolean
  availability_status: string
}

export interface StoreProduct {
  id: string
  name: string
  description: string
  price: number
  currency: string
  image: string
  variants: PrintfulVariant[]
  printfulProductId: number
  category?: string
}

const PRINTFUL_API_BASE = 'https://api.printful.com'

/**
 * Get Printful API key from environment
 */
function getPrintfulApiKey(): string {
  const apiKey = process.env.PRINTFUL_API_KEY
  if (!apiKey) {
    throw new Error('PRINTFUL_API_KEY is not set in environment variables')
  }
  return apiKey
}

/**
 * Extract image URL from Printful product (shared logic for consistency)
 */
export function extractProductImage(product: any): string {
  const defaultImage = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&crop=center'
  
  if (!product) {
    console.warn('⚠️ extractProductImage: product is null/undefined')
    return defaultImage
  }
  
  // Check files array first (most reliable for store products)
  if (product.files && Array.isArray(product.files) && product.files.length > 0) {
    const file = product.files[0]
    if (file.preview_url) {
      console.log('✅ Found image in files[0].preview_url')
      return file.preview_url
    }
    if (file.thumbnail_url) {
      console.log('✅ Found image in files[0].thumbnail_url')
      return file.thumbnail_url
    }
    if (file.url) {
      console.log('✅ Found image in files[0].url')
      return file.url
    }
  }
  
  // Check for direct image properties (catalog products often have these)
  if (product.image) {
    console.log('✅ Found image in product.image')
    return product.image
  }
  if (product.thumbnail) {
    console.log('✅ Found image in product.thumbnail')
    return product.thumbnail
  }
  if (product.thumbnail_url) {
    console.log('✅ Found image in product.thumbnail_url')
    return product.thumbnail_url
  }
  if (product.preview_url) {
    console.log('✅ Found image in product.preview_url')
    return product.preview_url
  }
  
  // Check sync_variants for images (new products might have images here)
  if (product.sync_variants && Array.isArray(product.sync_variants) && product.sync_variants.length > 0) {
    const firstVariant = product.sync_variants[0]
    if (firstVariant.image) {
      console.log('✅ Found image in sync_variants[0].image')
      return firstVariant.image
    }
  }
  
  // Log what we found for debugging
  console.warn('⚠️ No image found in product, using default. Product keys:', Object.keys(product))
  if (product.files) console.log('  files:', product.files.length, 'items')
  if (product.sync_variants) console.log('  sync_variants:', product.sync_variants.length, 'items')
  
  return defaultImage
}

/**
 * Fetch products from Printful catalog
 */
export async function getPrintfulProducts(): Promise<PrintfulProduct[]> {
  const apiKey = getPrintfulApiKey()
  
  try {
    const url = `${PRINTFUL_API_BASE}/store/products`
    console.log('🔗 Printful API URL:', url)
    console.log('🔑 API Key (first 10 chars):', apiKey.substring(0, 10) + '...')
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 Printful API Response Status:', response.status, response.statusText)
    console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Printful API error response:', errorText)
      try {
        const errorJson = JSON.parse(errorText)
        console.error('❌ Error JSON:', errorJson)
      } catch {
        // Not JSON, that's okay
      }
      throw new Error(`Printful API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('📦 Full Printful API Response:', JSON.stringify(data, null, 2))
    console.log('📊 Response Structure Analysis:', {
      hasResult: !!data.result,
      resultType: typeof data.result,
      hasData: !!data.result?.data,
      dataType: Array.isArray(data.result?.data) ? 'array' : typeof data.result?.data,
      dataLength: data.result?.data?.length,
      resultKeys: data.result ? Object.keys(data.result) : [],
      topLevelKeys: Object.keys(data),
    })
    
    // Try different response structures
    let products: any[] = []
    
    if (data.result?.data && Array.isArray(data.result.data)) {
      products = data.result.data
      console.log('✅ Found products in data.result.data')
    } else if (Array.isArray(data.result)) {
      products = data.result
      console.log('✅ Found products in data.result (array)')
    } else if (Array.isArray(data.data)) {
      products = data.data
      console.log('✅ Found products in data.data')
    } else if (Array.isArray(data)) {
      products = data
      console.log('✅ Found products in root array')
    } else {
      console.warn('⚠️ Could not find products array in response')
      console.log('Available paths:', {
        'data.result.data': data.result?.data,
        'data.result': data.result,
        'data.data': data.data,
        'data': data,
      })
    }
    
    console.log(`📦 Extracted ${products.length} products from response`)
    
    if (products.length > 0) {
      console.log('📋 First product sample:', JSON.stringify(products[0], null, 2))
    }
    
    return products
  } catch (error) {
    console.error('❌ Error fetching Printful products:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
    }
    throw error
  }
}

/**
 * Get a single store product from Printful
 */
export async function getPrintfulStoreProduct(storeProductId: string): Promise<any> {
  const apiKey = getPrintfulApiKey()
  
  try {
    const response = await fetch(`${PRINTFUL_API_BASE}/store/products/${storeProductId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Printful API error: ${response.statusText}`)
    }

    const data = await response.json()
    const storeProduct = data.result
    
    // Log the full structure for debugging
    console.log('📦 Printful store product response:', JSON.stringify(storeProduct, null, 2))
    console.log('🔍 Store product keys:', Object.keys(storeProduct))
    console.log('🖼️ Image-related fields:', {
      hasFiles: !!storeProduct.files,
      filesLength: storeProduct.files?.length || 0,
      hasImage: !!storeProduct.image,
      hasThumbnail: !!storeProduct.thumbnail,
      hasPreview: !!storeProduct.preview_url,
      productId: storeProduct.product_id,
    })
    
    // If store product has a product_id, try to get image from catalog product
    if (storeProduct.product_id && (!storeProduct.files || storeProduct.files.length === 0)) {
      try {
        console.log(`📡 Fetching catalog product ${storeProduct.product_id} for image...`)
        const catalogResponse = await fetch(`${PRINTFUL_API_BASE}/products/${storeProduct.product_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (catalogResponse.ok) {
          const catalogData = await catalogResponse.json()
          const catalogProduct = catalogData.result?.product
          
          if (catalogProduct) {
            console.log('✅ Got catalog product, checking for images...')
            console.log('🔍 Catalog product keys:', Object.keys(catalogProduct))
            
            // Try to get image from catalog product
            if (catalogProduct.image) {
              storeProduct.image = catalogProduct.image
              console.log('✅ Found image in catalog product.image')
            }
            if (catalogProduct.thumbnail_url) {
              storeProduct.thumbnail_url = catalogProduct.thumbnail_url
              console.log('✅ Found image in catalog product.thumbnail_url')
            }
            // Catalog products might have variants with images
            if (catalogProduct.variants && catalogProduct.variants.length > 0) {
              const firstVariant = catalogProduct.variants[0]
              if (firstVariant.image && !storeProduct.image) {
                storeProduct.image = firstVariant.image
                console.log('✅ Found image in catalog product variant.image')
              }
            }
          }
        }
      } catch (catalogError) {
        console.warn('Could not fetch catalog product for image:', catalogError)
      }
    }
    
    return storeProduct
  } catch (error) {
    console.error('Error fetching Printful store product:', error)
    throw error
  }
}

/**
 * Get product variants (sizes, colors, etc.) from catalog
 */
export async function getPrintfulProductVariants(productId: number): Promise<PrintfulVariant[]> {
  const apiKey = getPrintfulApiKey()
  
  try {
    const response = await fetch(`${PRINTFUL_API_BASE}/products/${productId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Printful API error: ${response.statusText}`)
    }

    const data = await response.json()
    const variants = data.result?.product?.variants || []
    
    // Log variant structure for debugging
    console.log(`📦 Fetched ${variants.length} variants for product ${productId}`)
    if (variants.length > 0) {
      console.log('📋 First variant sample:', JSON.stringify(variants[0], null, 2))
      console.log('🔍 Variant keys:', Object.keys(variants[0]))
    }
    
    return variants
  } catch (error) {
    console.error('Error fetching Printful product variants:', error)
    throw error
  }
}

/**
 * Create an order in Printful
 * This is called after successful Stripe payment
 */
export async function createPrintfulOrder(orderData: {
  recipient: {
    name: string
    address1: string
    address2?: string
    city: string
    state_code: string
    country_code: string
    zip: string
    phone?: string
    email: string
  }
  items: Array<{
    variant_id: number
    quantity: number
    files?: Array<{
      url: string
    }>
  }>
  retail_costs?: {
    currency: string
    subtotal: string
    discount: string
    shipping: string
    tax: string
  }
  external_id?: string
}): Promise<any> {
  const apiKey = getPrintfulApiKey()
  
  try {
    const payload: any = {
      recipient: orderData.recipient,
      items: orderData.items,
    }
    
    if (orderData.retail_costs) {
      payload.retail_costs = orderData.retail_costs
    }
    
    if (orderData.external_id) {
      payload.external_id = orderData.external_id
    }
    
    console.log('📦 Creating Printful order with payload:', JSON.stringify(payload, null, 2))
    
    const response = await fetch(`${PRINTFUL_API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    console.log('📡 Printful API response status:', response.status)
    console.log('📡 Printful API response body:', responseText)

    if (!response.ok) {
      let errorData: any
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { message: responseText }
      }
      
      // Extract detailed error information
      const errorMessage = errorData.message || errorData.error?.message || response.statusText
      const errorCode = errorData.code || errorData.error?.code
      const errorDetails = errorData.error || errorData
      
      const fullErrorMessage = `Printful API error (${response.status}): ${errorMessage}${errorCode ? ` [Code: ${errorCode}]` : ''}`
      
      console.error('❌ Printful order creation failed:', fullErrorMessage)
      console.error('❌ Full error response:', JSON.stringify(errorData, null, 2))
      console.error('❌ Error details:', JSON.stringify(errorDetails, null, 2))
      
      // Create error with full details
      const error = new Error(fullErrorMessage) as any
      error.status = response.status
      error.response = responseText
      error.errorData = errorData
      throw error
    }

    const data = JSON.parse(responseText)
    console.log('✅ Printful order created successfully:', data.result?.id || data.result?.external_id)
    return data.result
  } catch (error) {
    console.error('❌ Error creating Printful order:', error)
    throw error
  }
}

/**
 * Get shipping rates for an order
 */
export async function getShippingRates(data: {
  recipient: {
    address1: string
    city: string
    state_code: string
    country_code: string
    zip: string
  }
  items: Array<{
    variant_id: number
    quantity: number
  }>
}): Promise<any> {
  const apiKey = getPrintfulApiKey()
  
  try {
    console.log('📦 Requesting shipping rates from Printful:', JSON.stringify(data, null, 2))
    
    const response = await fetch(`${PRINTFUL_API_BASE}/shipping/rates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    console.log('📡 Printful shipping API response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Printful shipping API error:', errorText)
      throw new Error(`Printful API error: ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    console.log('📦 Printful shipping API response:', JSON.stringify(result, null, 2))
    
    // Printful returns rates in result.result (array) or result (array)
    const rates = result.result || result
    
    if (!Array.isArray(rates)) {
      console.warn('⚠️ Printful shipping rates is not an array:', typeof rates, rates)
      return []
    }
    
    console.log(`✅ Found ${rates.length} shipping rate(s)`)
    return rates
  } catch (error) {
    console.error('❌ Error fetching shipping rates:', error)
    throw error
  }
}
