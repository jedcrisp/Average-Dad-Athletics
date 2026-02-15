'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'

interface ProductVariant {
  id: number
  name: string
  size: string
  color: string
  color_code: string
  image: string
  price: string
  in_stock: boolean
}

interface StoreProduct {
  id: string
  name: string
  description: string
  price: number
  currency: string
  image: string
  variants: ProductVariant[]
  printfulProductId: number
}

interface ColorGroup {
  color: string
  color_code: string
  variants: ProductVariant[]
  image?: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { addItem } = useCart()
  const [product, setProduct] = useState<StoreProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  
  // Group variants by color and get the best image for each color
  const colorGroups = product?.variants.reduce((groups: ColorGroup[], variant) => {
    const existingGroup = groups.find(g => g.color === variant.color)
    if (existingGroup) {
      existingGroup.variants.push(variant)
      // Use variant image if available (prefer first in-stock variant's image)
      if (variant.image && variant.in_stock && !existingGroup.image) {
        existingGroup.image = variant.image
      } else if (variant.image && !existingGroup.image) {
        // Fallback to any variant image if no in-stock variant has one
        existingGroup.image = variant.image
      }
    } else {
      groups.push({
        color: variant.color,
        color_code: variant.color_code,
        variants: [variant],
        image: variant.image || undefined, // Use variant's image from Printful
      })
    }
    return groups
  }, []) || []
  
  // Log color groups for debugging
  useEffect(() => {
    if (colorGroups.length > 0) {
      console.log('🎨 Color groups:', colorGroups.map(g => ({
        color: g.color,
        image: g.image ? g.image.substring(0, 60) + '...' : 'no image',
        variantCount: g.variants.length,
      })))
    }
  }, [colorGroups])
  
  // Get available sizes for selected color
  const availableSizes = selectedColor
    ? colorGroups.find(g => g.color === selectedColor)?.variants || []
    : []
  
  // Update selected variant when color or size changes
  useEffect(() => {
    if (selectedColor && selectedSize && product) {
      const variant = product.variants.find(
        v => v.color === selectedColor && v.size === selectedSize
      )
      setSelectedVariant(variant || null)
    } else {
      setSelectedVariant(null)
    }
  }, [selectedColor, selectedSize, product])
  
  // Auto-select first color and size when product loads
  useEffect(() => {
    if (product && product.variants.length > 0 && !selectedColor) {
      const firstColor = colorGroups[0]?.color
      if (firstColor) {
        setSelectedColor(firstColor)
        const firstSize = colorGroups[0]?.variants[0]?.size
        if (firstSize) {
          setSelectedSize(firstSize)
        }
      }
    }
  }, [product, colorGroups])

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/store/products/${productId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch product')
      }
      const data = await response.json()
      setProduct(data.product)
      // Reset selections when product changes
      setSelectedColor(null)
      setSelectedSize(null)
      setSelectedVariant(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load product')
      console.error('Error fetching product:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert('Please select a variant')
      return
    }

    if (!product) return

    addItem({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: parseFloat(selectedVariant.price),
      quantity: quantity,
    })

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 3000)
  }

  const handleCheckout = async () => {
    if (!user) {
      router.push(`/login?redirect=/store/${params.id}`)
      return
    }

    if (!selectedVariant) {
      alert('Please select a variant')
      return
    }

    try {
      setCheckoutLoading(true)
      const response = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              variantId: selectedVariant.id,
              quantity: quantity,
              productId: product?.id,
              productName: product?.name,
              price: parseFloat(selectedVariant.price),
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()
      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err: any) {
      console.error('Error creating checkout:', err)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <button
            onClick={() => router.push('/store')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Store
          </button>
        </div>
      </div>
    )
  }

  const displayPrice = selectedVariant
    ? (parseFloat(selectedVariant.price) * quantity).toFixed(2)
    : (product.price / 100 * quantity).toFixed(2)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Product Image - Changes based on selected color */}
            <div className="md:w-1/2">
              <div className="aspect-square bg-gray-200 relative overflow-hidden">
                {(() => {
                  // Get image for selected color from Printful variant images
                  let displayImage = product.image
                  
                  if (selectedColor) {
                    const colorGroup = colorGroups.find(g => g.color === selectedColor)
                    console.log(`🖼️ Selected color: ${selectedColor}, color group image:`, colorGroup?.image ? colorGroup.image.substring(0, 60) + '...' : 'none')
                    
                    // Priority: color group image (from Printful variant) > selected variant image > product image
                    if (colorGroup?.image) {
                      displayImage = colorGroup.image
                      console.log(`✅ Using color group image for ${selectedColor}`)
                    } else if (selectedVariant?.image) {
                      displayImage = selectedVariant.image
                      console.log(`✅ Using selected variant image`)
                    } else {
                      console.log(`⚠️ No variant image found, using product image`)
                    }
                  }
                  
                  console.log(`🖼️ Final display image:`, displayImage ? displayImage.substring(0, 60) + '...' : 'none')
                  
                  return displayImage ? (
                    <img
                      key={`${displayImage}-${selectedColor}`} // Force re-render when image or color changes
                      src={displayImage}
                      alt={`${product.name} - ${selectedColor || ''}`}
                      className="w-full h-full object-cover transition-opacity duration-300"
                      onError={(e) => {
                        // Handle Access Denied errors from Printful S3 images
                        const target = e.target as HTMLImageElement
                        const currentSrc = target.src
                        console.error(`❌ Image failed to load (Access Denied from S3?): ${currentSrc.substring(0, 100)}...`)
                        
                        // Prevent infinite loop - check if we've already tried fallback
                        const isPlaceholder = currentSrc.includes('via.placeholder') || currentSrc.includes('unsplash')
                        const isProductImage = currentSrc === product.image
                        
                        if (!isPlaceholder && !isProductImage && product.image) {
                          // First fallback: try product image
                          console.log(`🔄 Falling back to product image due to Access Denied`)
                          target.src = product.image
                        } else if (!isPlaceholder) {
                          // Final fallback: placeholder
                          console.log(`🔄 Falling back to placeholder`)
                          target.src = 'https://via.placeholder.com/800x800/cccccc/666666?text=Product+Image'
                        }
                      }}
                      onLoad={() => {
                        console.log(`✅ Image loaded successfully: ${displayImage?.substring(0, 60)}...`)
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-48 h-48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Product Details */}
            <div className="md:w-1/2 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-gray-600 mb-6">{product.description}</p>

              {/* Color Selection */}
              {colorGroups.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Color
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {colorGroups.map((group) => {
                      // Map color names to actual color values if color_code is not accurate
                      const getColorValue = (colorName: string, colorCode: string) => {
                        const colorMap: { [key: string]: string } = {
                          'sage': '#87AE73',
                          'black': '#000000',
                          'white': '#FFFFFF',
                          'gray': '#808080',
                          'grey': '#808080',
                          'navy': '#000080',
                          'blue': '#0000FF',
                          'red': '#FF0000',
                          'green': '#008000',
                          'brown': '#A52A2A',
                          'tan': '#D2B48C',
                          'beige': '#F5F5DC',
                          'cream': '#FFFDD0',
                          'olive': '#808000',
                          'maroon': '#800000',
                          'burgundy': '#800020',
                          'charcoal': '#36454F',
                          'heather': '#B4B4B4',
                          'heather gray': '#B4B4B4',
                          'heather grey': '#B4B4B4',
                        }
                        
                        const normalizedName = colorName.toLowerCase().trim()
                        return colorMap[normalizedName] || colorCode || '#CCCCCC'
                      }
                      
                      const displayColor = getColorValue(group.color, group.color_code)
                      
                      return (
                        <button
                          key={group.color}
                          onClick={() => {
                            setSelectedColor(group.color)
                            // Auto-select first available size for this color
                            const firstSize = group.variants.find(v => v.in_stock)?.size || group.variants[0]?.size
                            if (firstSize) {
                              setSelectedSize(firstSize)
                            }
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                            selectedColor === group.color
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded-full border border-gray-300"
                            style={{ backgroundColor: displayColor }}
                            title={group.color}
                          />
                          <span className="font-medium">{group.color}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection (only show if color is selected) */}
              {selectedColor && availableSizes.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedSize(variant.size)}
                        disabled={!variant.in_stock}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors font-medium ${
                          selectedSize === variant.size
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : variant.in_stock
                            ? 'border-gray-300 hover:border-gray-400 text-gray-700'
                            : 'border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {variant.size}
                        {!variant.in_stock && (
                          <span className="block text-xs mt-1">Out of Stock</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <p className="text-3xl font-bold text-primary-600">
                  ${displayPrice} {product.currency.toUpperCase()}
                </p>
              </div>

              {/* Add to Cart / Checkout Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant?.in_stock}
                  className="flex-1 px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading || !selectedVariant?.in_stock}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? 'Processing...' : 'Buy Now'}
                </button>
              </div>

              {!selectedVariant?.in_stock && (
                <p className="mt-2 text-sm text-red-600 text-center">
                  This variant is currently out of stock
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
