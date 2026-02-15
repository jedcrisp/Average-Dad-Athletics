'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
  productId: string
  productName: string
  productImage: string
  variantId: number
  variantName: string
  size: string
  color: string
  price: number // in dollars
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, variantId: number) => void
  updateQuantity: (productId: string, variantId: number, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      // Check if item already exists (same product and variant)
      const existingIndex = prevItems.findIndex(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      )

      if (existingIndex >= 0) {
        // Update quantity if item exists
        const updated = [...prevItems]
        updated[existingIndex].quantity += item.quantity
        return updated
      } else {
        // Add new item
        return [...prevItems, item]
      }
    })
  }

  const removeItem = (productId: string, variantId: number) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.productId === productId && item.variantId === variantId)
      )
    )
  }

  const updateQuantity = (productId: string, variantId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, variantId)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
