import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { images } from '../assets/images'
import { AccountMenu } from './AccountMenu'
import { CategoriesModal } from './CategoriesModal'
import { CategoryLinksBar } from './CategoryLinksBar'
import { MobileAppNavigation, type MobileNavTab } from './MobileAppNavigation'
import { SignInModal } from './SignInModal'
import { getAccountPath, type AccountSection } from '../data/accountRoutes'
import GlobalLineIcon from 'remixicon-react/GlobalLineIcon'
import HeartLineIcon from 'remixicon-react/HeartLineIcon'
import ListCheckLineIcon from 'remixicon-react/ListCheckIcon'
import ShoppingCartLineIcon from 'remixicon-react/ShoppingCartLineIcon'
import UserLineIcon from 'remixicon-react/UserLineIcon'
import SearchLineIcon from 'remixicon-react/SearchLineIcon'
import type { SidebarCategoryId } from '../data/categoriesModal'
import type { CategoryListingSelection } from '../data/categoryListing'

const navIconButton =
  'group flex cursor-pointer items-center justify-center rounded-full bg-bg-secondary transition-colors hover:bg-orange-light'
const navIcon =
  'text-text-secondary transition-colors group-hover:text-primary-orange'

const promoBannerClass =
  'bg-gradient-to-r from-primary-orange from-0% via-primary-orange via-[55%] to-[#ffe7d6] to-100%'

type NavProps = {
  isCategoriesOpen: boolean
  categoriesTargetId: SidebarCategoryId
  onToggleCategories: () => void
  onCloseCategories: () => void
  onSubcategorySelect: (selection: CategoryListingSelection) => void
  onOpenCart?: () => void
  onOpenWishlist?: () => void
  cartItemCount?: number
  isSignedIn?: boolean
  userDisplayName?: string
  userFullName?: string
  onSignedIn?: (email: string) => void
  onSignOut?: () => void
  mobileActiveTab?: MobileNavTab
  onMobileHome?: () => void
  showCategoryLinksBar?: boolean
  onOpenCategories?: (categoryId: SidebarCategoryId, label: string) => void
  activeCategoryLabel?: string
}

export function Nav({
  isCategoriesOpen,
  categoriesTargetId,
  onToggleCategories,
  onCloseCategories,
  onSubcategorySelect,
  onOpenCart,
  onOpenWishlist,
  cartItemCount = 0,
  isSignedIn = false,
  userDisplayName = 'Vikers',
  userFullName = 'Vikers Junior',
  onSignedIn,
  onSignOut,
  mobileActiveTab = 'home',
  onMobileHome,
  showCategoryLinksBar = false,
  onOpenCategories,
  activeCategoryLabel = 'Featured',
}: NavProps) {
  const navigate = useNavigate()
  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const desktopAccountRef = useRef<HTMLDivElement>(null)

  const closeAccountMenu = useCallback(() => setIsAccountMenuOpen(false), [])

  const openAccountSection = useCallback(
    (section: AccountSection) => {
      closeAccountMenu()
      navigate(getAccountPath(section))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [closeAccountMenu, navigate],
  )

  const toggleCategories = () => {
    onToggleCategories()
    setIsAccountMenuOpen(false)
  }

  const toggleAccountMenu = () => {
    setIsAccountMenuOpen((open) => !open)
    onCloseCategories()
  }

  const handleAccountClick = () => {
    onCloseCategories()
    if (isSignedIn) {
      toggleAccountMenu()
      return
    }
    closeAccountMenu()
    setIsSignInModalOpen(true)
  }

  const handleSignedIn = (email: string) => {
    setIsSignInModalOpen(false)
    onSignedIn?.(email)
  }

  const openCart = () => {
    closeAccountMenu()
    onCloseCategories()
    onOpenCart?.()
  }

  const openWishlist = () => {
    closeAccountMenu()
    onCloseCategories()
    setIsSignInModalOpen(false)
    onOpenWishlist?.()
  }

  const handleMobileHome = () => {
    closeAccountMenu()
    onCloseCategories()
    setIsSignInModalOpen(false)
    navigate('/')
    onMobileHome?.()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleMobileAccount = () => {
    onCloseCategories()
    if (isSignedIn) {
      navigate(getAccountPath('orders'))
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setIsSignInModalOpen(true)
  }

  useEffect(() => {
    if (isCategoriesOpen) {
      closeAccountMenu()
      setIsSignInModalOpen(false)
    }
  }, [closeAccountMenu, isCategoriesOpen])

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const updateHeight = () => {
      setHeaderHeight(header.offsetHeight)
      document.documentElement.style.setProperty('--nav-height', `${header.offsetHeight}px`)
    }
    updateHeight()

    const observer = new ResizeObserver(updateHeight)
    observer.observe(header)

    return () => observer.disconnect()
  }, [isCategoriesOpen, isAccountMenuOpen])

  useEffect(() => {
    if (!isAccountMenuOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return

      if (!desktopAccountRef.current?.contains(target)) closeAccountMenu()
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [closeAccountMenu, isAccountMenuOpen])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const handleViewportChange = () => closeAccountMenu()

    mediaQuery.addEventListener('change', handleViewportChange)

    return () => mediaQuery.removeEventListener('change', handleViewportChange)
  }, [closeAccountMenu])

  const categoriesButtonClass =
    'group flex h-12 w-44 shrink-0 cursor-pointer items-center gap-2 rounded-full p-4 transition-colors hover:bg-orange-light'

  const searchFieldClass =
    'flex w-full items-center gap-2 rounded-full border border-border-secondary bg-bg-primary p-1'

  return (
    <>
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-50 w-full max-w-[100vw] overflow-x-clip bg-bg-primary"
      >
        <div className="relative mx-auto w-full min-w-0 max-w-400">
          <div className={`${promoBannerClass} flex h-12 items-center px-4 lg:h-13 lg:px-16`}>
            <p className="text-xs font-medium tracking-[-0.24px] text-text-inverse lg:text-base lg:tracking-[-0.32px]">
              You Can Add Your Advertisement Here
            </p>
          </div>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-4 border-b border-border-primary px-16 py-4 lg:flex">
            <Link to="/" aria-label="Home" className="shrink-0">
              <img alt="H&CO." className="h-7 w-29.25" src={images.nav.logo} />
            </Link>

            <button
              type="button"
              onClick={toggleCategories}
              aria-expanded={isCategoriesOpen}
              className={`${categoriesButtonClass} ${
                isCategoriesOpen ? 'bg-orange-light' : 'bg-bg-secondary'
              }`}
            >
              <ListCheckLineIcon
                className={`size-6 shrink-0 transition-colors ${
                  isCategoriesOpen
                    ? 'text-primary-orange'
                    : 'text-text-secondary group-hover:text-primary-orange'
                }`}
                aria-hidden
              />
              <span
                className={`flex-1 text-left text-base font-medium tracking-[-0.32px] transition-colors ${
                  isCategoriesOpen
                    ? 'text-primary-orange'
                    : 'text-text-secondary group-hover:text-primary-orange'
                }`}
              >
                Categories
              </span>
            </button>

            <div className={`${searchFieldClass} min-w-0 flex-1`}>
              <div className="flex min-w-0 flex-1 items-center gap-2 p-2">
                <SearchLineIcon className="size-6 shrink-0 text-text-tertiary" aria-hidden />
                <span className="min-w-0 flex-1 text-base font-medium tracking-[-0.32px] text-text-tertiary">
                  Search product
                </span>
              </div>
              <button
                type="button"
                className="btn-orange group flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full py-4 pl-4 pr-6 transition-opacity hover:opacity-90"
                aria-label="Search"
              >
                <SearchLineIcon className="size-5 text-text-inverse" aria-hidden />
                <span className="text-sm font-medium tracking-[-0.28px] text-text-inverse">Search</span>
              </button>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <button
                type="button"
                className={`${navIconButton} size-12 px-3`}
                aria-label="Language"
              >
                <GlobalLineIcon className={`size-6 ${navIcon}`} aria-hidden />
              </button>

              <button
                type="button"
                onClick={openWishlist}
                className={`${navIconButton} size-12 px-3`}
                aria-label="Wishlist"
              >
                <HeartLineIcon className={`size-6 ${navIcon}`} aria-hidden />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={openCart}
                  className={`${navIconButton} size-12 px-3`}
                  aria-label="Cart"
                >
                  <ShoppingCartLineIcon className={`size-6 ${navIcon}`} aria-hidden />
                </button>
                <span className="btn-orange absolute -right-2.5 -top-1.5 flex size-6 min-w-6 items-center justify-center rounded-full border border-white px-1 text-xs font-medium tracking-[-0.24px] text-text-inverse">
                  {cartItemCount}
                </span>
              </div>

              <div ref={desktopAccountRef} className="relative">
                <button
                  type="button"
                  onClick={handleAccountClick}
                  aria-expanded={isSignedIn ? isAccountMenuOpen : undefined}
                  aria-haspopup={isSignedIn ? 'menu' : undefined}
                  className={`group ${navIconButton} h-12 gap-2 py-4 ${
                    isSignedIn ? 'pl-5 pr-7' : 'size-12 px-3'
                  } ${isSignedIn && isAccountMenuOpen ? 'bg-orange-light' : ''}`}
                  aria-label={isSignedIn ? 'Account' : 'Sign in'}
                >
                  <UserLineIcon
                    className={`size-6 transition-colors ${
                      isSignedIn && isAccountMenuOpen
                        ? 'text-primary-orange'
                        : `${navIcon} group-hover:text-primary-orange`
                    }`}
                    aria-hidden
                  />
                  {isSignedIn ? (
                    <span
                      className={`text-base font-medium tracking-[-0.32px] transition-colors ${
                        isAccountMenuOpen
                          ? 'text-primary-orange'
                          : 'text-text-primary group-hover:text-primary-orange'
                      }`}
                    >
                      {userDisplayName}
                    </span>
                  ) : null}
                </button>
                {isSignedIn ? (
                  <AccountMenu
                    isOpen={isAccountMenuOpen}
                    userFullName={userFullName}
                    onClose={closeAccountMenu}
                    onSignOut={onSignOut}
                    onYourOrdersClick={() => openAccountSection('orders')}
                    onYourReviewsClick={() => openAccountSection('reviews')}
                    onYourProfileClick={() => openAccountSection('profile')}
                    onBrowsingHistoryClick={() => openAccountSection('history')}
                    onAddressesClick={() => openAccountSection('addresses')}
                    onPaymentMethodsClick={() => openAccountSection('payments')}
                    onNotificationsClick={() => openAccountSection('notifications')}
                  />
                ) : null}
              </div>
            </div>
          </div>

          {/* Mobile navigation */}
          <div className="flex flex-col gap-2 border-b border-border-primary p-4 lg:hidden">
            <div className="flex items-center gap-4">
              <Link to="/" aria-label="Home" className="shrink-0" onClick={() => onMobileHome?.()}>
                <img alt="H&CO." className="h-6 w-25" src={images.nav.logo} />
              </Link>

              <div className={`${searchFieldClass} min-w-0 flex-1`}>
                <div className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1">
                  <SearchLineIcon className="size-5 shrink-0 text-text-tertiary" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium tracking-[-0.28px] text-text-tertiary">
                    Search product
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-orange flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-90"
                  aria-label="Search"
                >
                  <SearchLineIcon className="size-5 text-text-inverse" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </div>

        {showCategoryLinksBar && onOpenCategories ? (
          <CategoryLinksBar
            onOpenCategories={onOpenCategories}
            activeCategoryLabel={activeCategoryLabel}
            isCategoriesOpen={isCategoriesOpen}
          />
        ) : null}

        <CategoriesModal
          isOpen={isCategoriesOpen}
          initialCategoryId={categoriesTargetId}
          onClose={onCloseCategories}
          onSubcategorySelect={onSubcategorySelect}
        />

        <SignInModal
          isOpen={isSignInModalOpen}
          onClose={() => setIsSignInModalOpen(false)}
          onSignedIn={handleSignedIn}
        />
      </header>

      <div aria-hidden className="shrink-0" style={{ height: headerHeight }} />

      <MobileAppNavigation
        activeTab={isCategoriesOpen ? 'categories' : mobileActiveTab}
        onHome={handleMobileHome}
        onCategories={toggleCategories}
        onFavourite={openWishlist}
        onCart={openCart}
        onAccount={handleMobileAccount}
      />

      {/* <div aria-hidden className="shrink-0 lg:hidden" style={{ height: '72px' }} /> */}
    </>
  )
}
