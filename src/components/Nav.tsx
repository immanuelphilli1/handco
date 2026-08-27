import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { images } from '../assets/images'
import { AccountMenu } from './AccountMenu'
import { CategoriesModal } from './CategoriesModal'
import { SignInModal } from './SignInModal'
import { getAccountPath, type AccountSection } from '../data/accountRoutes'
import MapPinLineIcon from 'remixicon-react/MapPinLineIcon'
import LifebuoyLineIcon from 'remixicon-react/LifebuoyLineIcon'
import GlobalLineIcon from 'remixicon-react/GlobalLineIcon'
import HeartLineIcon from 'remixicon-react/HeartLineIcon'
import ListCheckLineIcon from 'remixicon-react/ListCheckIcon'
import ShoppingCartLineIcon from 'remixicon-react/ShoppingCartLineIcon'
import UserLineIcon from 'remixicon-react/UserLineIcon'
import SearchLineIcon from 'remixicon-react/SearchLineIcon'
import type { SidebarCategoryId } from '../data/categoriesModal'
import type { CategoryListingSelection } from '../data/categoryListing'

const navTextButton =
  'group flex cursor-pointer items-center justify-center gap-2 rounded-full transition-colors hover:bg-bg-secondary'
const navIconButton =
  'group flex cursor-pointer items-center justify-center rounded-full bg-bg-secondary transition-colors hover:bg-orange-light'
const navIcon =
  'text-text-secondary transition-colors group-hover:text-primary-orange'

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
}: NavProps) {
  const navigate = useNavigate()
  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const mobileAccountRef = useRef<HTMLDivElement>(null)
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

      const clickedInsideAccount =
        mobileAccountRef.current?.contains(target) ||
        desktopAccountRef.current?.contains(target)

      if (!clickedInsideAccount) closeAccountMenu()
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

  return (
    <>
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-50 w-full max-w-[100vw] overflow-x-clip bg-bg-primary"
      >
        <div className="relative mx-auto w-full min-w-0 max-w-360">
          <div className="flex w-full min-w-0 items-center justify-between gap-2 border-b border-border-primary px-4 lg:gap-12 lg:px-16">
            <button type="button" className={`${navTextButton} h-12 min-w-0 py-4`}>
              <MapPinLineIcon className={`size-5 shrink-0 ${navIcon}`} aria-hidden />
              <span className="truncate text-base font-medium tracking-[-0.32px] text-text-secondary transition-colors group-hover:text-text-primary">
                Deliver to Accra
              </span>
            </button>
            <div className="flex items-center gap-2 lg:ml-auto lg:gap-4">
              <button
                type="button"
                className={`${navTextButton} h-10 px-2.5 lg:h-12 lg:py-4 lg:pl-5 lg:pr-7`}
                aria-label="Help"
              >
                <LifebuoyLineIcon className={`size-5 lg:size-6 ${navIcon}`} aria-hidden />
                <span className="hidden text-base font-medium tracking-[-0.32px] text-text-secondary transition-colors group-hover:text-text-primary lg:inline">
                  Help
                </span>
              </button>
              <button
                type="button"
                className={`${navTextButton} h-10 px-2.5 lg:h-12 lg:py-4 lg:pl-5 lg:pr-7`}
                aria-label="Language"
              >
                <GlobalLineIcon className={`size-5 lg:size-6 ${navIcon}`} aria-hidden />
                <span className="hidden text-base font-medium tracking-[-0.32px] text-text-secondary transition-colors group-hover:text-text-primary lg:inline">
                  English
                </span>
              </button>
            </div>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-2 border-b border-border-primary p-4 lg:flex-row lg:items-center lg:gap-4 lg:px-16 lg:py-4">
            <div className="flex w-full min-w-0 items-center justify-between lg:w-auto lg:justify-start lg:gap-4">
              <button type="button" onClick={() => window.location.href = '/'} aria-label="Home" className="cursor-pointer">
              <img
                alt="H&CO."
                className="h-6 w-25 shrink-0 lg:h-7 lg:w-29"
                src={images.nav.logo}
              />
              </button>
              <div className="flex items-center gap-2 lg:gap-4">
                <button
                  type="button"
                  onClick={toggleCategories}
                  aria-expanded={isCategoriesOpen}
                  aria-label="Categories"
                  className={`${navIconButton} h-10 px-2.5 lg:hidden ${
                    isCategoriesOpen ? 'bg-orange-light' : ''
                  }`}
                >
                  <ListCheckLineIcon
                    className={`size-5 transition-colors ${
                      isCategoriesOpen ? 'text-primary-orange' : navIcon
                    }`}
                    aria-hidden
                  />
                </button>

                <button
                  type="button"
                  onClick={toggleCategories}
                  aria-expanded={isCategoriesOpen}
                  className={`group hidden h-12 w-44 shrink-0 cursor-pointer items-center gap-2 rounded-full p-4 transition-colors hover:bg-orange-light lg:flex ${
                    isCategoriesOpen ? 'bg-orange-light' : 'bg-bg-secondary'
                  }`}
                >
                  <ListCheckLineIcon
                    className={`size-5 transition-colors ${
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

                <button
                  type="button"
                  onClick={openWishlist}
                  className={`${navIconButton} h-10 px-2.5 lg:hidden`}
                  aria-label="Wishlist"
                >
                  <HeartLineIcon className={`size-5 ${navIcon}`} aria-hidden />
                </button>

                <button
                  type="button"
                  onClick={openCart}
                  className={`${navIconButton} relative h-10 px-2.5 lg:hidden`}
                  aria-label="Cart"
                >
                  <ShoppingCartLineIcon className={`size-5 ${navIcon}`} aria-hidden />
                  <span className="btn-orange absolute -right-2.5 -top-1.5 flex size-6 items-center justify-center rounded-full border border-white p-1 text-xs font-medium tracking-[-0.24px] text-text-inverse">
                    {cartItemCount}
                  </span>
                </button>

                <div ref={mobileAccountRef} className="relative lg:hidden">
                  <button
                    type="button"
                    onClick={handleAccountClick}
                    aria-expanded={isSignedIn ? isAccountMenuOpen : undefined}
                    aria-haspopup={isSignedIn ? 'menu' : undefined}
                    className={`${navIconButton} h-10 px-2.5 ${
                      isSignedIn && isAccountMenuOpen ? 'bg-orange-light' : ''
                    }`}
                    aria-label={isSignedIn ? 'Account' : 'Sign in'}
                  >
                    <UserLineIcon
                      className={`size-5 transition-colors ${
                        isSignedIn && isAccountMenuOpen ? 'text-primary-orange' : navIcon
                      }`}
                      aria-hidden
                    />
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

            <div className="flex w-full items-center gap-2 rounded-full border border-border-secondary bg-bg-primary p-1 lg:min-w-0 lg:flex-1">
              <div className="flex min-w-0 flex-1 items-center gap-2 p-2">
                <SearchLineIcon className="size-5" aria-hidden />
                <span className="min-w-0 flex-1 text-base font-medium tracking-[-0.32px] text-text-tertiary">
                  Search product
                </span>
              </div>
              <button
                type="button"
                className="group flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-orange p-4 transition-colors hover:bg-primary-orange/80 lg:gap-2 lg:py-4 lg:pl-4 lg:pr-6"
                aria-label="Search"
              >
                <SearchLineIcon className="size-5 text-white transition-opacity group-hover:opacity-90" aria-hidden />
                <span className="hidden text-sm font-medium tracking-[-0.28px] text-text-inverse lg:inline">
                  Search
                </span>
              </button>
            </div>

            <div className="hidden items-center gap-4 lg:flex">
              <button
                type="button"
                onClick={openWishlist}
                className={`${navIconButton} size-12 px-3`}
                aria-label="Wishlist"
              >
                <HeartLineIcon className={`size-5 ${navIcon}`} aria-hidden />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={openCart}
                  className={`${navIconButton} size-12 px-3`}
                  aria-label="Cart"
                >
                  <ShoppingCartLineIcon className={`size-5 ${navIcon}`} aria-hidden />
                </button>
                <span className="btn-orange absolute -right-2.5 -top-1.5 flex size-6 items-center justify-center rounded-full border border-white p-1 text-xs font-medium tracking-[-0.24px] text-text-inverse">
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
                    className={`size-5 transition-colors ${
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
        </div>

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
    </>
  )
}
