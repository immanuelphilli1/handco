import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { cartApi, wishlistApi } from '../api'
import { mapApiCartItem, mapApiProduct } from '../api/mappers'
import type { CartSummary } from '../api/types'
import type { CartItem } from '../data/cart'
import type { Product } from '../data/products'
import { getProductKey } from '../data/products'
import { useAuth } from './AuthContext'

type ShopContextValue = {
  cartItems: CartItem[]
  cartItemCount: number
  cartSummary: CartSummary | null
  isCartLoading: boolean
  refreshCart: () => Promise<void>
  /** Applies a cart response the caller already has, avoiding a redundant GET. */
  applyCartResponse: (response: Awaited<ReturnType<typeof cartApi.getCart>>) => void
  addToCart: (product: Product, quantity?: number) => Promise<void>
  findCartItemForProduct: (product: Product) => CartItem | undefined
  updateCartItem: (itemId: string, patch: { quantity?: number; selected?: boolean }) => Promise<void>
  removeCartItem: (itemId: string) => Promise<void>
  removeSelectedCartItems: () => Promise<void>
  selectAllCartItems: (selected: boolean) => Promise<void>
  moveSelectedToWishlist: () => Promise<void>
  wishlistProducts: Product[]
  isWishlistLoading: boolean
  refreshWishlist: () => Promise<void>
  isLiked: (productId: string) => boolean
  toggleWishlist: (product: Product) => Promise<void>
  removeFromWishlist: (product: Product) => Promise<void>
  clearCart: () => void
  lastOrder: {
    orderReference: string
    estimatedDelivery: string
  } | null
  setLastOrder: (order: { orderReference: string; estimatedDelivery: string } | null) => void
}

const ShopContext = createContext<ShopContextValue | null>(null)

function applyCartResponse(
  setCartItems: (items: CartItem[]) => void,
  setCartSummary: (summary: CartSummary | null) => void,
  response: Awaited<ReturnType<typeof cartApi.getCart>>,
) {
  setCartItems(response.items.map(mapApiCartItem))
  setCartSummary(response.summary)
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const { authUser, requestSignIn } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null)
  const [isCartLoading, setIsCartLoading] = useState(false)
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const [lastOrder, setLastOrder] = useState<{
    orderReference: string
    estimatedDelivery: string
  } | null>(null)

  const refreshCart = useCallback(async () => {
    // Inside the async call, not the synchronous effect body that triggers it,
    // which React flags as a cascading render.
    setIsCartLoading(true)
    try {
      const response = await cartApi.getCart()
      applyCartResponse(setCartItems, setCartSummary, response)
    } finally {
      setIsCartLoading(false)
    }
  }, [])

  /**
   * Some mutations (e.g. order Buy Again) already return the updated cart, and
   * they may carry a new `X-Cart-Id`. Applying that response directly keeps the
   * UI on the cart the server just minted instead of re-fetching by stale id.
   */
  const applyCart = useCallback(
    (response: Awaited<ReturnType<typeof cartApi.getCart>>) => {
      applyCartResponse(setCartItems, setCartSummary, response)
    },
    [],
  )

  const refreshWishlist = useCallback(async () => {
    if (!authUser) {
      setWishlistProducts([])
      return
    }

    setIsWishlistLoading(true)
    try {
      const response = await wishlistApi.getWishlist()
      setWishlistProducts(response.items.map(mapApiProduct))
    } finally {
      setIsWishlistLoading(false)
    }
  }, [authUser])

  useEffect(() => {
    void refreshCart()
  }, [refreshCart])

  useEffect(() => {
    void refreshWishlist()
  }, [refreshWishlist])

  const cartItemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  )

  const addToCart = useCallback(async (product: Product, quantity = 1) => {
    const response = await cartApi.addCartItem(product.id, quantity)
    applyCartResponse(setCartItems, setCartSummary, response)
  }, [])

  /**
   * Finds the cart line already holding this product, so callers can update it
   * instead of adding another line for the same product. `productRid` is the
   * reliable link; the line id is used as a fallback because some responses
   * carry no `productRid`.
   */
  const findCartItemForProduct = useCallback(
    (product: Product) =>
      cartItems.find((item) =>
        item.productRid ? item.productRid === product.id : item.id === product.id,
      ),
    [cartItems],
  )

  const updateCartItem = useCallback(
    async (itemId: string, patch: { quantity?: number; selected?: boolean }) => {
      const response = await cartApi.updateCartItem(itemId, patch)
      applyCartResponse(setCartItems, setCartSummary, response)
    },
    [],
  )

  const removeCartItem = useCallback(async (itemId: string) => {
    const response = await cartApi.removeCartItem(itemId)
    applyCartResponse(setCartItems, setCartSummary, response)
  }, [])

  const removeSelectedCartItems = useCallback(async () => {
    const response = await cartApi.removeSelectedCartItems()
    applyCartResponse(setCartItems, setCartSummary, response)
  }, [])

  const selectAllCartItems = useCallback(async (selected: boolean) => {
    const response = await cartApi.selectAllCartItems(selected)
    applyCartResponse(setCartItems, setCartSummary, response)
  }, [])

  const moveSelectedToWishlist = useCallback(async () => {
    const response = await cartApi.moveSelectedToWishlist()
    applyCartResponse(setCartItems, setCartSummary, response)
    await refreshWishlist()
  }, [refreshWishlist])

  const isLiked = useCallback(
    (productId: string) => wishlistProducts.some((product) => product.id === productId),
    [wishlistProducts],
  )

  const removeFromWishlist = useCallback(async (product: Product) => {
    await wishlistApi.removeFromWishlist(product.id)
    const productKey = getProductKey(product)
    setWishlistProducts((current) =>
      current.filter((entry) => getProductKey(entry) !== productKey),
    )
  }, [])

  const toggleWishlist = useCallback(
    async (product: Product) => {
      if (!authUser) {
        // Wishlist is auth-gated on the backend. Prompt to sign in rather than
        // silently doing nothing, which looked like a broken heart button.
        requestSignIn()
        return
      }

      if (isLiked(product.id)) {
        await removeFromWishlist(product)
        return
      }

      await wishlistApi.addToWishlist(product.id)
      setWishlistProducts((current) => [...current, { ...product, liked: true }])
    },
    [authUser, isLiked, removeFromWishlist, requestSignIn],
  )

  const clearCart = useCallback(() => {
    setCartItems([])
    setCartSummary(null)
  }, [])

  const value = useMemo(
    () => ({
      cartItems,
      cartItemCount,
      cartSummary,
      isCartLoading,
      refreshCart,
      applyCartResponse: applyCart,
      addToCart,
      findCartItemForProduct,
      updateCartItem,
      removeCartItem,
      removeSelectedCartItems,
      selectAllCartItems,
      moveSelectedToWishlist,
      wishlistProducts,
      isWishlistLoading,
      refreshWishlist,
      isLiked,
      toggleWishlist,
      removeFromWishlist,
      clearCart,
      lastOrder,
      setLastOrder,
    }),
    [
      addToCart,
      applyCart,
      findCartItemForProduct,
      cartItemCount,
      cartItems,
      cartSummary,
      clearCart,
      isCartLoading,
      isLiked,
      isWishlistLoading,
      lastOrder,
      moveSelectedToWishlist,
      refreshCart,
      refreshWishlist,
      removeCartItem,
      removeFromWishlist,
      removeSelectedCartItems,
      selectAllCartItems,
      toggleWishlist,
      updateCartItem,
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
