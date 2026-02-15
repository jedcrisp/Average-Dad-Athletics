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
 * Fetch products from Printful catalog
 */
export async function getPrintfulProducts(): Promise<PrintfulProduct[]> {
  const apiKey = getPrintfulApiKey()
  
  try {
    const response = await fetch(`${PRINTFUL_API_BASE}/store/products`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Printful API error response:', errorText)
      throw new Error(`Printful API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Printful API response structure:', {
      hasResult: !!data.result,
      hasData: !!data.result?.data,
      dataLength: data.result?.data?.length,
      fullResponse: JSON.stringify(data).substring(0, 500), // First 500 chars for debugging
    })
    
    const products = data.result?.data || []
    console.log(`Found ${products.length} products in Printful response`)
    
    return products
  } catch (error) {
    console.error('Error fetching Printful products:', error)
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
    return data.result
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
    return data.result?.product?.variants || []
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
}): Promise<any> {
  const apiKey = getPrintfulApiKey()
  
  try {
    const response = await fetch(`${PRINTFUL_API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Printful API error: ${errorData.message || response.statusText}`)
    }

    const data = await response.json()
    return data.result
  } catch (error) {
    console.error('Error creating Printful order:', error)
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
    const response = await fetch(`${PRINTFUL_API_BASE}/shipping/rates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Printful API error: ${response.statusText}`)
    }

    const result = await response.json()
    return result.result
  } catch (error) {
    console.error('Error fetching shipping rates:', error)
    throw error
  }
}
