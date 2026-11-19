import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCartPath, getProductPath } from '../data/shopRoutes'
import type { OrderLine } from '../data/orders'
import type { Product } from '../data/products'
import { useCatalog } from '../context/CatalogContext'
import { useShop } from '../context/ShopContext'

/**
 * Shared "re-add to cart" behaviour for the order page.
 *
 * Buy Again deliberately mirrors Buy Now on the product page: a product already
 * in the cart is topped up by the ordered quantity rather than added as a second
 * line, and the user is sent to the cart either way so they can see the result.
 */
export function useBuyAgain() {
  const { addToCart, findCartItemForProduct, updateCartItem } = useShop()
  const { allProducts } = useCatalog()
  const navigate = useNavigate()

  /**
   * Resolves an order line back to a catalog product. Order lines carry the
   * backend product rid, so they are matched against the live catalog rather
   * than the local seed data, whose ids the API does not know.
   */
  const resolveProduct = useCallback(
    (productId: string): Product | undefined =>
      allProducts.find((product) => product.id === productId),
    [allProducts],
  )

  const addProductToCart = useCallback(
    async (product: Product, quantity = 1, variantRid?: string) => {
      const existingItem = findCartItemForProduct(product, variantRid)

      try {
        if (existingItem) {
          await updateCartItem(existingItem.id, {
            quantity: existingItem.quantity + quantity,
          })
        } else {
          await addToCart(product, quantity, variantRid)
        }
      } catch {
        // Cart stayed unchanged; still go to the cart so the user can see why.
      }
    },
    [addToCart, findCartItemForProduct, updateCartItem],
  )

  /** Adds a single catalog product, then opens the cart (Buy Now behaviour). */
  const buyProductAgain = useCallback(
    async (product: Product, quantity = 1) => {
      await addProductToCart(product, quantity)
      navigate(getCartPath())
    },
    [addProductToCart, navigate],
  )

  /**
   * Re-adds every line of an order, then opens the cart. Lines that no longer
   * resolve to a catalog product are skipped rather than failing the whole order.
   */
  const buyOrderAgain = useCallback(
    async (lines: OrderLine[]) => {
      for (const line of lines) {
        const product = resolveProduct(line.productId)
        if (!product) continue
        // The line's own variant, so the same size and colour go back in.
        await addProductToCart(product, line.quantity, line.variantRid)
      }

      navigate(getCartPath())
    },
    [addProductToCart, navigate, resolveProduct],
  )

  /**
   * Adds one product from the "Buy this again" rail without leaving the page.
   * The rail knows only the product, so one with a size, colour or model to
   * choose opens its product page instead of adding the default variant.
   */
  const addBuyAgainProductToCart = useCallback(
    async (productId: string) => {
      const product = resolveProduct(productId)
      if (!product) return false
      if (product.hasVariantChoice) {
        navigate(getProductPath(product.id))
        return true
      }
      await addProductToCart(product, 1)
      return true
    },
    [addProductToCart, navigate, resolveProduct],
  )

  return { buyProductAgain, buyOrderAgain, addBuyAgainProductToCart }
}