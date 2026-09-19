import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
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
import { WishlistView } from '../components/WishlistView'
import { useShop } from '../context/ShopContext'
import type { AuthUser } from '../data/auth'
import type { CategoryListingSelection } from '../data/categoryListing'
import { allCategoriesListingSelection } from '../data/categoryListing'
import type { SidebarCategoryId } from '../data/categoriesModal'
import type { CartStep } from '../data/navigation'
import type { Product } from '../data/products'
import {
  getCartPath,
  getCategoryPathFromSelection,
  getCheckoutPath,
  getHomePath,
  getOrderCompletePath,
  getProductPath,
  getWishlistPath,
  parseCategoryRoute,
  parseProductRoute,
} from '../data/shopRoutes'

export type { CartStep } from '../data/navigation'

type HomePageProps = {
  authUser: AuthUser | null
  onSignedIn: (email: string) => void
  onSignOut: () => void
}

export function HomePage({ authUser, onSignedIn, onSignOut }: HomePageProps) {
  const { cartItems, cartItemCount, setCartItems, clearCart } = useShop()
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [categoriesTargetId, setCategoriesTargetId] = useState<SidebarCategoryId>('featured')
  const [categoriesTargetLabel, setCategoriesTargetLabel] = useState('Featured')

  const pathname = location.pathname
  const productDetail = pathname.startsWith('/products/')
    ? parseProductRoute(params.productId, searchParams)
    : null
  const categoryListing = pathname.startsWith('/categories')
    ? parseCategoryRoute(params.categoryId, searchParams.get('subcategory'))
    : null
  const cartStep: CartStep | null =
    pathname === '/cart'
      ? 'cart'
      : pathname === '/checkout'
        ? 'checkout'
        : pathname === '/order-complete'
          ? 'completed'
          : null
  const wishlistOpen = pathname === '/wishlist'

  useEffect(() => {
    if (pathname.startsWith('/products/') && params.productId && !productDetail) {
      navigate(getHomePath(), { replace: true })
    }
  }, [navigate, params.productId, pathname, productDetail])

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

  const openCategories = useCallback(
    (categoryId: SidebarCategoryId = 'featured', label = 'Featured') => {
      setCategoriesTargetId(categoryId)
      setCategoriesTargetLabel(label)
      setIsCategoriesOpen(true)
    },
    [],
  )

  const toggleCategories = useCallback(() => {
    setIsCategoriesOpen((open) => {
      if (open) return false
      setCategoriesTargetId('featured')
      setCategoriesTargetLabel('Featured')
      return true
    })
  }, [])

  const closeCategories = useCallback(() => {
    setIsCategoriesOpen(false)
  }, [])

  const handleSubcategorySelect = useCallback(
    (selection: CategoryListingSelection) => {
      setIsCategoriesOpen(false)
      navigate(getCategoryPathFromSelection(selection))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [navigate],
  )

  const handleOpenAllCategories = useCallback(() => {
    navigate(getCategoryPathFromSelection(allCategoriesListingSelection))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [navigate])

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
    setIsCategoriesOpen(false)
    navigate(getCartPath())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [navigate])

  const handleOpenWishlist = useCallback(() => {
    setIsCategoriesOpen(false)
    navigate(getWishlistPath())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [navigate])

  const handleWishlistProductSelect = useCallback(
    (product: Product) => {
      navigate(getProductPath(product.id, { from: 'wishlist' }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [navigate],
  )

  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) return
    navigate(getCheckoutPath())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [cartItems.length, navigate])

  const handleSubmitOrder = useCallback(() => {
    clearCart()
    navigate(getOrderCompletePath())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [clearCart, navigate])

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
        cartItemCount={cartItemCount}
        isSignedIn={authUser !== null}
        userDisplayName={authUser?.displayName}
        userFullName={authUser?.fullName}
        onSignedIn={onSignedIn}
        onSignOut={onSignOut}
        mobileActiveTab={mobileActiveTab}
        onMobileHome={handleGoHome}
        showCategoryLinksBar={
          !productDetail && !cartStep && !wishlistOpen && !categoryListing
        }
        onOpenCategories={openCategories}
        activeCategoryLabel={categoriesTargetLabel}
      />
      <div className="mx-auto w-full min-w-0 max-w-360 overflow-x-clip bg-bg-primary">
        {productDetail ? (
          <>
            <main>
              <ProductDetailView
                context={productDetail}
                onGoHome={handleGoHome}
                onBackToListing={handleBackToListing}
                onProductSelect={handleRelatedProductSelect}
              />
            </main>
            <Footer />
          </>
        ) : cartStep ? (
          <>
            <main>
              {cartStep === 'cart' ? (
                <CartView
                  items={cartItems}
                  onItemsChange={setCartItems}
                  onGoHome={handleGoHome}
                  onCheckout={handleCheckout}
                />
              ) : cartStep === 'checkout' ? (
                <CheckoutView onGoHome={handleGoHome} onSubmitOrder={handleSubmitOrder} />
              ) : (
                <OrderCompletedView onGoHome={handleGoHome} />
              )}
            </main>
            <Footer />
          </>
        ) : wishlistOpen ? (
          <>
            <main>
              <WishlistView
                onGoHome={handleGoHome}
                onProductSelect={handleWishlistProductSelect}
              />
            </main>
            <Footer />
          </>
        ) : categoryListing ? (
          <>
            <main>
              <CategoryListingView
                selection={categoryListing}
                onGoHome={handleGoHome}
                onProductSelect={handleProductSelect}
              />
            </main>
            <Footer />
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
            <Footer />
          </>
        )}
      </div>
      <BackToTopButton />
    </>
  )
}
