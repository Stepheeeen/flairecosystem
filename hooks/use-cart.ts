import { useState, useEffect, useCallback } from "react"

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
}

const CART_STORAGE_KEY = "cart"

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Initialize cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        setCart(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Failed to load cart:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
      // Dispatch custom event for other components
      window.dispatchEvent(new Event("cartUpdated"))
    }
  }, [cart, isLoading])

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">) => {
      setCart((prevCart) => {
        const existingItem = prevCart.find((i) => i.id === item.id)
        if (existingItem) {
          return prevCart.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        }
        return [...prevCart, { ...item, quantity: 1 }]
      })
    },
    []
  )

  const removeItem = useCallback((id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  return {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    itemCount: cart.reduce((total, item) => total + item.quantity, 0),
    isLoading,
  }
}
