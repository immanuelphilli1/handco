import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackToTopButton } from '../components/BackToTopButton'
import { Footer } from '../components/Footer'
import { Nav } from '../components/Nav'
import { ReturnRefundPolicyPageContent } from '../components/ReturnRefundPolicyPageContent'
import { useShop } from '../context/ShopContext'
import type { AuthUser } from '../data/auth'
import type { CategoryListingSelection } from '../data/categoryListing'
import type { SidebarCategoryId } from '../data/categoriesModal'
import {
  getCartPath,
  getCategoryPathFromSelection,
  getHomePath,
  getWishlistPath,
} from '../data/shopRoutes'

type ReturnRefundPolicyPageProps = {
  authUser: AuthUser | null
  onSignedIn: (email: string) => void
  onSignOut: () => void
}

export function ReturnRefundPolicyPage({
  authUser,
  onSignedIn,
  onSignOut,
}: ReturnRefundPolicyPageProps) {
  const navigate = useNavigate()
  const { cartItemCount } = useShop()
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [categoriesTargetId, setCategoriesTargetId] = useState<SidebarCategoryId>('featured')

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

  const handleSubcategorySelect = useCallback(
    (selection: CategoryListingSelection) => {
      setIsCategoriesOpen(false)
      navigate(getCategoryPathFromSelection(selection))
    },
    [navigate],
  )

  const handleOpenCart = useCallback(() => {
    navigate(getCartPath())
  }, [navigate])

  const handleOpenWishlist = useCallback(() => {
    navigate(getWishlistPath())
  }, [navigate])

  const handleGoHome = useCallback(() => {
    navigate(getHomePath())
  }, [navigate])

  const handleSignOut = useCallback(() => {
    onSignOut()
    navigate(getHomePath())
  }, [navigate, onSignOut])

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
        onSignOut={handleSignOut}
        onMobileHome={handleGoHome}
      />
      <div className="mx-auto w-full min-w-0 max-w-360 overflow-x-clip bg-bg-primary">
        <ReturnRefundPolicyPageContent onGoHome={handleGoHome} />
        <Footer />
      </div>
      <BackToTopButton />
    </>
  )
}
