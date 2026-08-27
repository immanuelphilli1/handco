import type { SidebarCategoryId } from './categoriesModal'
import type { CategoryListingSelection } from './categoryListing'

export type CartStep = 'cart' | 'checkout' | 'completed'

export type HomeNavigationState = {
  categoryListing?: CategoryListingSelection
  cartStep?: CartStep
  wishlistOpen?: boolean
  openCategories?: boolean
  categoriesTargetId?: SidebarCategoryId
}
