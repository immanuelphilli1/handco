import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { productToCartItem, type CartItem } from '../data/cart'
import type { Product } from '../data/products'
import { getProductKey } from '../data/products'

type ShopContextValue = {
  cartItems: CartItem[]
  cartItemCount: number
  setCartItems: (items: CartItem[]) => void
  addToCart: (product: Product) => void
  wishlistProducts: Product[]
  isLiked: (productId: string) => boolean
  toggleWishlist: (product: Product) => void
  removeFromWishlist: (product: Product) => void
  clearCart: () => void
}

const ShopContext = createContext<ShopContextValue | null>(null)

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])

  const cartItemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  )

  const addToCart = useCallback((product: Product) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...current, productToCartItem(product)]
    })
  }, [])

  const isLiked = useCallback(
    (productId: string) => wishlistProducts.some((product) => product.id === productId),
    [wishlistProducts],
  )

  const removeFromWishlist = useCallback((product: Product) => {
    const productKey = getProductKey(product)
    setWishlistProducts((current) =>
      current.filter((entry) => getProductKey(entry) !== productKey),
    )
  }, [])

  const toggleWishlist = useCallback((product: Product) => {
    const productKey = getProductKey(product)
    setWishlistProducts((current) => {
      if (current.some((entry) => getProductKey(entry) === productKey)) {
        return current.filter((entry) => getProductKey(entry) !== productKey)
      }
      return [...current, { ...product, liked: true }]
    })
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const value = useMemo(
    () => ({
      cartItems,
      cartItemCount,
      setCartItems,
      addToCart,
      wishlistProducts,
      isLiked,
      toggleWishlist,
      removeFromWishlist,
      clearCart,
    }),
    [
      addToCart,
      cartItemCount,
      cartItems,
      clearCart,
      isLiked,
      removeFromWishlist,
      toggleWishlist,
      wishlistProducts,
    ],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const context = useContext(ShopContext)
  if (!context) {
    throw new Error('useShop must be used within ShopProvider')
  }
  return context
}
