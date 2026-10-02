import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { accountApi, catalogApi, checkoutApi } from '../api'
import { ApiError } from '../api/client'
import {
  clearPendingPayment,
  readPendingPayment,
  savePendingPayment,
} from '../api/pendingPayment'
import { buildSelectionForProduct, mapApiProduct, mapApiProductDetail } from '../api/mappers'
import { BackToTopButton } from '../components/BackToTopButton'
import { CategoryGridSection } from '../components/CategoryGridSection'
import { CategoryListingView } from '../components/CategoryListingView'
import { ProductDetailView } from '../components/ProductDetailView'
import { FeaturedItemsSection } from '../components/FeaturedItemsSection'
import { FeaturesSection } from '../components/FeaturesSection'
import { Footer } from '../components/Footer'
import { HeroSection } from '../components/HeroSection'
import { Nav } from '../components/Nav'
import type { MobileNavTab } from '../components/MobileAppNavigation'
import { NewArrivalsSection } from '../components/NewArrivalsSection'
import { PromoBannerSection } from '../components/PromoBannerSection'
import { CartView } from '../components/CartView'
import { CheckoutView } from '../components/CheckoutView'
import { OrderCompletedView } from '../components/OrderCompletedView'
import { PaymentReturnView } from '../components/PaymentReturnView'
import { WishlistView } from '../components/WishlistView'
import { SearchResultsView } from '../components/SearchResultsView'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../context/CatalogContext'
import { useShop } from '../context/ShopContext'
import { getAllCategoriesListingSelection } from '../data/categoryListing'
import type { SidebarCategoryId } from '../data/categoriesModal'
import { useCategoryNavigation } from '../hooks/useCategoryNavigation'
import type { CartStep, PaymentReturnStep } from '../data/navigation'
import type { PendingPayment } from '../data/pendingPayment'
import type { Product } from '../data/products'
import type { ProductDetailContext } from '../data/productDetail'
import { EDIT_DEFAULT_ADDRESS_PARAM, getAccountPath } from '../data/accountRoutes'
import {
  getCartPath,
  getCategoryPathFromSelection,
  getCheckoutPath,
  getHomePath,
  getOrderCompletePath,
  getPaymentCancelPath,
  getPaymentReturnPath,
  getProductPath,
  getSearchQuery,
  getWishlistPath,
  parseCategoryRoute,
} from '../data/shopRoutes'

export type { CartStep } from '../data/navigation'

export function HomePage() {
  const { authUser, requestSignIn } = useAuth()
  const { categories } = useCatalog()
  const { cartItems, clearCart, setLastOrder, refreshCart } = useShop()
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const [productDetail, setProductDetail] = useState<ProductDetailContext | null>(null)
  const [isProductLoading, setIsProductLoading] = useState(false)
  const [isStartingPayment, setIsStartingPayment] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const pathname = location.pathname
  const productId = pathname.startsWith('/products/') ? params.productId : undefined
  const categoryListing = useMemo(() => {
    if (!pathname.startsWith('/categories')) {
      return null
    }

    return parseCategoryRoute(params.categoryId, searchParams.get('subcategory'), categories)
  }, [categories, params.categoryId, pathname, searchParams])
  const cartStep: CartStep | null =
    pathname === '/cart'
      ? 'cart'
      : pathname === '/checkout'
        ? 'checkout'
        : pathname === '/order-complete'
          ? 'completed'
          : null

  // The provider redirects here after checkout. Only `?reference` is trusted, so
  // the page polls `GET /payments/:reference` for the actual outcome.
  const paymentReturnStep: PaymentReturnStep | null =
    pathname === getPaymentReturnPath()
      ? 'payment-return'
      : pathname === getPaymentCancelPath()
        ? 'payment-cancel'
        : null
  const paymentReference = searchParams.get('reference')

  // While browsing a category, keep the link bar pointed at it. Falls back to
  // whichever category the modal was last opened with (homepage, search, etc).
  // Grouped members (e.g. "accessories" under "Fashion & Accessories") resolve to
  // their major category so the link bar always highlights the right entry.
  const routeCategoryId = params.categoryId as SidebarCategoryId | undefined
  const {
    activeCategoryId,
    categoriesTargetId,
    closeCategories,
    handleSubcategorySelect,
    isCategoriesOpen,
    openCategories,
    openToInitialCategory,
    toggleCategories,
    toggleCategoriesFromLinkBar,
  } = useCategoryNavigation({
    scrollOnNavigate: true,
    routeCategoryId: categoryListing && routeCategoryId ? routeCategoryId : undefined,
  })
  const wishlistOpen = pathname === '/wishlist'
  const searchOpen = pathname === '/search'
  const searchQuery = getSearchQuery(searchParams)

  useEffect(() => {
    if (!productId) {
      setProductDetail(null)
      return
    }

    let cancelled = false
    setIsProductLoading(true)

    async function loadProductDetail() {
      try {
        const response = await catalogApi.getProductDetail(productId!)
        const selection = buildSelectionForProduct(
          mapApiProduct(response.product),
          searchParams.get('from'),
          searchParams.get('category'),
          searchParams.get('subcategory'),
          categories,
        )
        if (!cancelled) {
          setProductDetail(mapApiProductDetail(response, selection))
          // Recorded only once the detail resolved, so a failed lookup does not
          // leave a history entry for a page that never rendered.
          void accountApi.recordBrowsingHistory(productId!).catch(() => undefined)
        }
      } catch {
        if (!cancelled) {
          setProductDetail(null)
          navigate(getHomePath(), { replace: true })
        }
      } finally {
        if (!cancelled) {
          setIsProductLoading(false)
        }
      }
    }

    void loadProductDetail()

    return () => {
      cancelled = true
    }
  }, [categories, navigate, productId, searchParams])

  useEffect(() => {
    if (pathname.startsWith('/categories/') && params.categoryId && !categoryListing) {
      navigate(getHomePath(), { replace: true })
    }
  }, [categoryListing, navigate, params.categoryId, pathname])

  useEffect(() => {
    if (pathname === '/checkout' && cartItems.length === 0) {
      navigate(getCartPath(), { replace: true })
    }
  }, [cartItems.length, navigate, pathname])

  const handleOpenAllCategories = useCallback(() => {
    navigate(getCategoryPathFromSelection(getAllCategoriesListingSelection(categories)))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [categories, navigate])

  const handleGoHome = useCallback(() => {
    navigate(getHomePath())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [navigate])

  const handleBackToListing = useCallback(() => {
    if (!productDetail) return
    navigate(getCategoryPathFromSelection(productDetail.selection))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [navigate, productDetail])

  const handleProductSelect = useCallback(
    (product: Product) => {
      if (!categoryListing) return
      navigate(
        getProductPath(product.id, {
          categoryId: categoryListing.categoryId,
          subcategory: categoryListing.subcategoryLabel,
        }),
      )
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [categoryListing, navigate],
  )

  const handleNewArrivalProductSelect = useCallback(
    (product: Product) => {
      navigate(getProductPath(product.id, { from: 'home' }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [navigate],
  )

  const handleFeaturedProductSelect = useCallback(
    (product: Product) => {
      navigate(getProductPath(product.id, { from: 'featured' }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [navigate],
  )

  const handleOpenCart = useCallback(() => {
    closeCategories()
    navigate(getCartPath())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [closeCategories, navigate])

  // Cart lines carry no category context, so the product page falls back to the
  // product's own category/subcategory for its breadcrumb and "back" target.
  const handleCartProductSelect = useCallback(
    (productId: string) => {
      navigate(getProductPath(productId))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [navigate],
  )

  const handleSearchProductSelect = useCallback(
    (product: Product) => {
      navigate(getProductPath(product.id))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [navigate],
  )

  const handleOpenWishlist = useCallback(() => {
    closeCategories()
    navigate(getWishlistPath())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [closeCategories, navigate])

  const handleWishlistProductSelect = useCallback(
    (product: Product) => {
      navigate(getProductPath(product.id, { from: 'wishlist' }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [navigate],
  )

  const handleGoToCart = useCallback(() => {
    navigate(getCartPath())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [navigate])

  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) return

    // Checkout places an order, which the backend only accepts for a signed-in
    // user. Prompt to sign in first instead of landing on a page that cannot submit.
    if (!authUser) {
      requestSignIn()
      return
    }

    navigate(getCheckoutPath())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [authUser, cartItems.length, navigate, requestSignIn])

  /**
   * "Change address" just lands on the Addresses tab, where the user picks one.
   * "Edit" goes there too, but flags the intent so the panel opens its edit form
   * for the default address instead of only listing them.
   */
  const handleGoToAddresses = useCallback(() => {
    navigate(getAccountPath('addresses'))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [navigate])

  const handleEditDefaultAddress = useCallback(() => {
    navigate(`${getAccountPath('addresses')}${EDIT_DEFAULT_ADDRESS_PARAM}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [navigate])

  /**
 * Starts payment.
 *
 * The backend owns provider selection, the customer email and the return URLs,
 * so the request body is empty. We persist the rid/provider (needed to place the
 * order and to poll status after the redirect), then hand the browser to the
 * provider. The order itself is created on the return leg, not here.
 */
  const handleSubmitOrder = useCallback(async () => {
    if (!authUser) return

    const selectedItemIds = cartItems.filter((item) => item.selected).map((item) => item.id)
    if (selectedItemIds.length === 0) return

    setCheckoutError(null)

    try {
      setIsStartingPayment(true)

      const preview = await checkoutApi.getCheckoutPreview()
      const addressId = preview.defaultAddressRid ?? preview.address?.rid
      if (!addressId) {
        setCheckoutError('Add a delivery address before paying.')
        return
      }

      const intent = await checkoutApi.createPaymentIntent()

      // Kept so the return page can poll status, and so the order can be placed
      // against this exact payment.
      const pendingOrder: PendingPayment = {
        paymentRid: intent.paymentRid,
        provider: intent.provider,
        addressId,
        cartItemIds: selectedItemIds,
      }
      savePendingPayment(pendingOrder)

      // Full-page navigation is required: the provider page is external and
      // React Router cannot own it.
      window.location.href = intent.checkoutUrl
    } catch (error) {
      setCheckoutError(
        error instanceof ApiError && error.message
          ? error.message
          : 'We could not start the payment. Please try again.',
      )
    } finally {
      setIsStartingPayment(false)
    }
  }, [authUser, cartItems])

  /**
   * Return leg: the payment succeeded, so create the order against the payment
   * rid the backend echoed back.
   *
   * Guarded on the stored rid so a re-render or a repeat visit cannot create a
   * second order: the pending payment is consumed on the first placement.
   */
  const handlePlaceOrderForPayment = useCallback(
    async (paymentRid: string) => {
      const stored = readPendingPayment()
      if (!stored || stored.paymentRid !== paymentRid) return

      const response = await checkoutApi.placeOrder({
        addressId: stored.addressId,
        cartItemIds: stored.cartItemIds,
        paymentToken: stored.paymentRid,
      })

      clearPendingPayment()
      setLastOrder({
        orderReference: response.orderReference,
        estimatedDelivery: response.estimatedDelivery,
      })
      clearCart()
      await refreshCart()
      navigate(getOrderCompletePath())
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [clearCart, navigate, refreshCart, setLastOrder],
  )

  /**
   * Once the payment is confirmed the order is placed, then the confirmation
   * page takes over. Errors are intentionally swallowed here — the return view
   * already reports the payment outcome and offers a retry.
   */
  useEffect(() => {
    if (paymentReturnStep !== 'payment-return' || !paymentReference) return

    void handlePlaceOrderForPayment(paymentReference).catch(() => undefined)
  }, [handlePlaceOrderForPayment, paymentReference, paymentReturnStep])

  const handlePaymentReturnHome = useCallback(() => {
    clearPendingPayment()
    navigate(getHomePath())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [navigate])

  const handleRelatedProductSelect = useCallback(
    (product: Product) => {
      if (!productDetail) return
      navigate(
        getProductPath(product.id, {
          categoryId: productDetail.selection.categoryId,
          subcategory: productDetail.selection.subcategoryLabel,
        }),
      )
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [navigate, productDetail],
  )

  const mobileActiveTab: MobileNavTab = cartStep
    ? 'cart'
    : wishlistOpen
      ? 'favourite'
      : categoryListing || productDetail
        ? 'categories'
        : 'home'

  const showProductDetail = Boolean(productId && (productDetail || isProductLoading))

  return (
    <>
      <Nav
        isCategoriesOpen={isCategoriesOpen}
        categoriesTargetId={categoriesTargetId}
        onToggleCategories={toggleCategories}
        onCloseCategories={closeCategories}
        onSubcategorySelect={handleSubcategorySelect}
        onOpenCart={handleOpenCart}
        onOpenWishlist={handleOpenWishlist}
        mobileActiveTab={mobileActiveTab}
        onMobileHome={handleGoHome}
        // The link bar is part of the site header, so it shows on every view
        // (product detail, cart, wishlist, checkout) just like the other pages.
        showCategoryLinksBar
        onOpenCategories={toggleCategoriesFromLinkBar}
        activeCategoryId={activeCategoryId}
        openToInitialCategory={openToInitialCategory}
      />
      <div className="mx-auto w-full min-w-0 max-w-360 overflow-x-clip bg-bg-primary">
        {paymentReturnStep ? (
          <>
            <main>
              <PaymentReturnView
                outcome={paymentReturnStep === 'payment-cancel' ? 'cancel' : 'return'}
                reference={paymentReference}
                onGoHome={handlePaymentReturnHome}
                onGoToCart={handleGoToCart}
              />
            </main>
            <Footer onOpenCategories={openCategories} />
          </>
        ) : showProductDetail ? (
          <>
            <main>
              {productDetail ? (
                <ProductDetailView
                  context={productDetail}
                  onGoHome={handleGoHome}
                  onBackToListing={handleBackToListing}
                  onGoToCart={handleOpenCart}
                  onProductSelect={handleRelatedProductSelect}
                />
              ) : (
                <div className="flex min-h-96 items-center justify-center px-4 py-16 text-text-secondary">
                  Loading product...
                </div>
              )}
            </main>
            <Footer onOpenCategories={openCategories} />
          </>
        ) : cartStep ? (
          <>
            <main>
              {cartStep === 'cart' ? (
                <CartView
                  onGoHome={handleGoHome}
                  onCheckout={handleCheckout}
                  onGoToProduct={handleCartProductSelect}
                />
              ) : cartStep === 'checkout' ? (
                <CheckoutView
                  onGoHome={handleGoHome}
                  onGoToCart={handleGoToCart}
                  onGoToProduct={handleCartProductSelect}
                  onSubmitOrder={() => void handleSubmitOrder()}
                  onGoToAddresses={handleGoToAddresses}
                  onEditDefaultAddress={handleEditDefaultAddress}
                  isSubmitting={isStartingPayment}
                  submitError={checkoutError}
                />
              ) : (
                <OrderCompletedView onGoHome={handleGoHome} />
              )}
            </main>
            <Footer onOpenCategories={openCategories} />
          </>
        ) : wishlistOpen ? (
          <>
            <main>
              <WishlistView
                onGoHome={handleGoHome}
                onProductSelect={handleWishlistProductSelect}
              />
            </main>
            <Footer onOpenCategories={openCategories} />
          </>
        ) : categoryListing ? (
          <>
            <main>
              <CategoryListingView
                selection={categoryListing}
                onGoHome={handleGoHome}
                onProductSelect={handleProductSelect}
                onSeeAllProducts={handleOpenAllCategories}
              />
            </main>
            <Footer onOpenCategories={openCategories} />
          </>
        ) : searchOpen ? (
          <>
            <main>
              <SearchResultsView
                query={searchQuery}
                onGoHome={handleGoHome}
                onProductSelect={handleSearchProductSelect}
                onSeeAllProducts={handleOpenAllCategories}
              />
            </main>
            <Footer onOpenCategories={openCategories} />
          </>
        ) : (
          <>
            <main>
              <HeroSection />
              <FeaturesSection />
              <CategoryGridSection onOpenCategories={openCategories} />
              <NewArrivalsSection onProductSelect={handleNewArrivalProductSelect} />
              <FeaturedItemsSection onProductSelect={handleFeaturedProductSelect} />
              <PromoBannerSection onShopAllCategories={handleOpenAllCategories} />
            </main>
            <Footer onOpenCategories={openCategories} />
          </>
        )}
      </div>
      <BackToTopButton />
    </>
  )
}
