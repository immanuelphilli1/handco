import { useCallback, useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { BackToTopButton } from '../components/BackToTopButton'
import { Footer } from '../components/Footer'
import { Nav } from '../components/Nav'
import { YourOrdersView } from '../components/YourOrdersView'
import { useShop } from '../context/ShopContext'
import type { AuthUser } from '../data/auth'
import {
  getAccountPath,
  parseAccountSection,
  type AccountSection,
} from '../data/accountRoutes'
import type { CategoryListingSelection } from '../data/categoryListing'
import type { SidebarCategoryId } from '../data/categoriesModal'
import {
  getCartPath,
  getCategoryPathFromSelection,
  getHomePath,
  getWishlistPath,
} from '../data/shopRoutes'

type AccountPageProps = {
  authUser: AuthUser | null
  onSignedIn: (email: string) => void
  onSignOut: () => void
}

export function AccountPage({ authUser, onSignedIn, onSignOut }: AccountPageProps) {
  const { section: sectionParam } = useParams()
  const navigate = useNavigate()
  const { cartItemCount } = useShop()
  const section = parseAccountSection(sectionParam)

  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [categoriesTargetId, setCategoriesTargetId] = useState<SidebarCategoryId>('featured')

  useEffect(() => {
    if (sectionParam && !section) {
      navigate(getAccountPath('orders'), { replace: true })
    }
  }, [navigate, section, sectionParam])

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

  const handleSectionChange = useCallback(
    (nextSection: AccountSection) => {
      navigate(getAccountPath(nextSection))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [navigate],
  )

  const handleSignOut = useCallback(() => {
    onSignOut()
    navigate(getHomePath())
  }, [navigate, onSignOut])

  if (!section) {
    return <Navigate to={getAccountPath('orders')} replace />
  }

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
        mobileActiveTab="account"
        onMobileHome={handleGoHome}
      />
      <div className="mx-auto w-full min-w-0 max-w-360 overflow-x-clip bg-bg-primary">
        <main>
          <YourOrdersView
            section={section}
            onGoHome={handleGoHome}
            onSectionChange={handleSectionChange}
          />
        </main>
        <Footer />
      </div>
      <BackToTopButton />
    </>
  )
}
