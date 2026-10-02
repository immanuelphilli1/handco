import Home3FillIcon from 'remixicon-react/Home3FillIcon'
import Home3LineIcon from 'remixicon-react/Home3LineIcon'
import HeartLineIcon from 'remixicon-react/HeartLineIcon'
import ListCheckLineIcon from 'remixicon-react/ListCheckIcon'
import ShoppingCartLineIcon from 'remixicon-react/ShoppingCartLineIcon'
import UserLineIcon from 'remixicon-react/UserLineIcon'

export type MobileNavTab = 'home' | 'categories' | 'favourite' | 'cart' | 'account'

type MobileAppNavigationProps = {
  activeTab: MobileNavTab
  onHome: () => void
  onCategories: () => void
  onFavourite: () => void
  onCart: () => void
  onAccount: () => void
  /** Total quantity in the cart, shown as a badge on the Cart tab. */
  cartItemCount?: number
}

type TabConfig = {
  id: MobileNavTab
  label: string
  icon: typeof Home3LineIcon
  activeIcon: typeof Home3FillIcon
}

const tabs: TabConfig[] = [
  { id: 'home', label: 'Home', icon: Home3LineIcon, activeIcon: Home3FillIcon },
  { id: 'categories', label: 'Categories', icon: ListCheckLineIcon, activeIcon: ListCheckLineIcon },
  { id: 'favourite', label: 'Favourite', icon: HeartLineIcon, activeIcon: HeartLineIcon },
  { id: 'cart', label: 'Cart', icon: ShoppingCartLineIcon, activeIcon: ShoppingCartLineIcon },
  { id: 'account', label: 'Account', icon: UserLineIcon, activeIcon: UserLineIcon },
]

export function MobileAppNavigation({
  activeTab,
  onHome,
  onCategories,
  onFavourite,
  onCart,
  onAccount,
  cartItemCount = 0,
}: MobileAppNavigationProps) {
  const handlers: Record<MobileNavTab, () => void> = {
    home: onHome,
    categories: onCategories,
    favourite: onFavourite,
    cart: onCart,
    account: onAccount,
  }

  return (
    <nav
      aria-label="App navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#f5f5f5] bg-bg-primary px-4 pb-5 pt-3 lg:hidden"
    >
      <div className="mx-auto flex max-w-360 items-center justify-between">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = isActive && tab.id === 'home' ? tab.activeIcon : tab.icon

          return (
            <button
              key={tab.id}
              type="button"
              onClick={handlers[tab.id]}
              className="flex w-20 flex-col items-center gap-px px-2 py-1.5"
              aria-current={isActive ? 'page' : undefined}
            >
              {/* The Cart tab carries the item-count badge the desktop header shows. */}
              <span className="relative flex shrink-0 items-center justify-center">
                <Icon
                  className={`size-6.5 shrink-0 ${
                    isActive ? 'text-primary-orange' : 'text-text-tertiary'
                  }`}
                  aria-hidden
                />
                {tab.id === 'cart' && cartItemCount > 0 ? (
                  <span className="btn-orange absolute -right-2.5 -top-1.5 flex size-5 min-w-5 items-center justify-center rounded-full border border-white px-1 text-[0.625rem] font-medium leading-none tracking-[-0.24px] text-text-inverse">
                    {cartItemCount}
                  </span>
                ) : null}
              </span>
              <span
                className={`text-center text-xs font-medium leading-[1.3] ${
                  isActive ? 'text-text-primary' : 'text-text-tertiary'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
