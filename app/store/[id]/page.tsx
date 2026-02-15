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

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { addItem } = useCart()
  const [product, setProduct] = useState<StoreProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

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
      if (data.product.variants && data.product.variants.length > 0) {
        setSelectedVariant(data.product.variants[0])
      }
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
            {/* Product Image - Use product image (same as storefront) */}
            <div className="md:w-1/2">
              <div className="aspect-square bg-gray-200 relative overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement
                      target.src = 'https://via.placeholder.com/800x800/cccccc/666666?text=Product+Image'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-48 h-48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="md:w-1/2 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-gray-600 mb-6">{product.description}</p>

              {/* Variant Selection */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Variant
                  </label>
                  <div className="space-y-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={!variant.in_stock}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                          selectedVariant?.id === variant.id
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${!variant.in_stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{variant.name}</p>
                            <p className="text-sm text-gray-600">
                              {variant.size} - {variant.color}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${parseFloat(variant.price).toFixed(2)}</p>
                            {!variant.in_stock && (
                              <p className="text-xs text-red-600">Out of Stock</p>
                            )}
                          </div>
                        </div>
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
