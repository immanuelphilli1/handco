import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BackToTopButton } from '../components/BackToTopButton'
import { CategoryGridSection } from '../components/CategoryGridSection'
import { CategoryListingView } from '../components/CategoryListingView'
import { ProductDetailView } from '../components/ProductDetailView'
import { FeaturedItemsSection } from '../components/FeaturedItemsSection'
import { FeaturesSection } from '../components/FeaturesSection'
import { Footer } from '../components/Footer'
import { HeroSection } from '../components/HeroSection'
import { Nav } from '../components/Nav'
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
import type { HomeNavigationState } from '../data/navigation'
import {
  buildFeaturedProductDetailContext,
  buildHomeProductDetailContext,
  buildProductDetailContext,
  buildWishlistProductDetailContext,
  type ProductDetailContext,
} from '../data/productDetail'
import type { Product } from '../data/products'

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
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [categoriesTargetId, setCategoriesTargetId] = useState<SidebarCategoryId>('featured')
  const [categoryListing, setCategoryListing] = useState<CategoryListingSelection | null>(null)
  const [productDetail, setProductDetail] = useState<ProductDetailContext | null>(null)
  const [cartStep, setCartStep] = useState<HomeNavigationState['cartStep'] | null>(null)
  const [wishlistOpen, setWishlistOpen] = useState(false)

  useEffect(() => {
    const state = location.state as HomeNavigationState | null
    if (!state) return

    if (state.categoryListing) {
      setCategoryListing(state.categoryListing)
      setProductDetail(null)
      setCartStep(null)
      setWishlistOpen(false)
    }

    if (state.cartStep) {
      setCategoryListing(null)
      setProductDetail(null)
      setCartStep(state.cartStep)
      setWishlistOpen(false)
    }

    if (state.wishlistOpen) {
      setCategoryListing(null)
      setProductDetail(null)
      setCartStep(null)
      setWishlistOpen(true)
    }

    if (state.openCategories) {
      setCategoriesTargetId(state.categoriesTargetId ?? 'featured')
      setIsCategoriesOpen(true)
    }

    navigate('.', { replace: true, state: null })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.key, navigate])

  const openCategories = useCallback((categoryId: SidebarCategoryId = 'featured') => {
    setCategoriesTargetId(categoryId)
    setIsCategoriesOpen(true)
  }, [])

  const toggleCategories = useCallback(() => {
    setIsCategoriesOpen((open) => {
      if (open) return false
      setCategoriesTargetId('featured')
      return true
    })
  }, [])

  const closeCategories = useCallback(() => {
    setIsCategoriesOpen(false)
  }, [])

  const handleSubcategorySelect = useCallback((selection: CategoryListingSelection) => {
    setCategoryListing(selection)
    setProductDetail(null)
    setCartStep(null)
    setWishlistOpen(false)
    setIsCategoriesOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleOpenAllCategories = useCallback(() => {
    handleSubcategorySelect(allCategoriesListingSelection)
  }, [handleSubcategorySelect])

  const handleGoHome = useCallback(() => {
    setCategoryListing(null)
    setProductDetail(null)
    setCartStep(null)
    setWishlistOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleBackToListing = useCallback(() => {
    setProductDetail(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleProductSelect = useCallback(
    (product: Product) => {
      if (!categoryListing) return
      setProductDetail(buildProductDetailContext(product, categoryListing))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [categoryListing],
  )

  const handleNewArrivalProductSelect = useCallback((product: Product) => {
    setProductDetail(buildHomeProductDetailContext(product))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleFeaturedProductSelect = useCallback((product: Product) => {
    setProductDetail(buildFeaturedProductDetailContext(product))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleOpenCart = useCallback(() => {
    setCategoryListing(null)
    setProductDetail(null)
    setWishlistOpen(false)
    setCartStep('cart')
    setIsCategoriesOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleOpenWishlist = useCallback(() => {
    setCategoryListing(null)
    setProductDetail(null)
    setCartStep(null)
    setWishlistOpen(true)
    setIsCategoriesOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleWishlistProductSelect = useCallback((product: Product) => {
    setProductDetail(buildWishlistProductDetailContext(product))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) return
    setCartStep('checkout')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [cartItems.length])

  const handleSubmitOrder = useCallback(() => {
    setCartStep('completed')
    clearCart()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [clearCart])

  const handleRelatedProductSelect = useCallback(
    (product: Product) => {
      if (!productDetail) return
      setProductDetail(buildProductDetailContext(product, productDetail.selection))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [productDetail],
  )

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
              <HeroSection
                onOpenCategories={openCategories}
                onShopAllCategories={handleOpenAllCategories}
              />
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
