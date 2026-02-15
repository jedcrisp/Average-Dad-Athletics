'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'

export default function CartPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCart()
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const handleCheckout = async () => {
    if (!user) {
      router.push(`/login?redirect=/store/cart`)
      return
    }

    if (items.length === 0) {
      alert('Your cart is empty')
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
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            productId: item.productId,
            productName: item.productName,
            price: item.price,
          })),
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
            <button
              onClick={() => router.push('/store')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  const total = getTotalPrice()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="bg-white rounded-lg shadow p-6 flex gap-4"
              >
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.productName}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.variantName} - {item.size} - {item.color}
                  </p>
                  <p className="text-lg font-bold text-primary-600">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-red-600 hover:text-red-700 p-2"
                    title="Remove item"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mt-2">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
              <button
                onClick={() => router.push('/store')}
                className="w-full px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={clearCart}
                className="w-full mt-2 text-sm text-red-600 hover:text-red-700"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
