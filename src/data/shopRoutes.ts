import type { ApiCategory } from '../api/types'
import type { SidebarCategoryId } from './categoriesModal'
import type { CategoryListingSelection } from './categoryListing'
import {
  buildAllCategoriesListingSelection,
  buildCategoryListingSelection,
  findApiCategory,
  isSpecialCategoryId,
} from './catalogCategories'

export type ProductLinkContext =
  | { from: 'home' | 'featured' | 'wishlist' | 'order-complete' }
  | { categoryId: SidebarCategoryId | string; subcategory: string }

export function getHomePath(): string {
  return '/'
}

export function getCartPath(): string {
  return '/cart'
}

export function getCheckoutPath(): string {
  return '/checkout'
}

export function getOrderCompletePath(): string {
  return '/order-complete'
}

export function getPaymentReturnPath(): string {
  return '/checkout/return'
}

export function getPaymentCancelPath(): string {
  return '/checkout/cancel'
}

export function getGoogleOAuthCallbackPath(): string {
  return '/oauth/google/callback'
}

export function getWishlistPath(): string {
  return '/wishlist'
}

export function getSearchPath(query: string): string {
  const trimmed = query.trim()
  return trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search'
}

export function getSearchQuery(searchParams: URLSearchParams): string {
  return searchParams.get('q') ?? ''
}

export function getCategoryPath(
  categoryId: SidebarCategoryId | string,
  subcategoryLabel?: string,
): string {
  if (categoryId === 'all-categories') {
    return '/categories'
  }

  const base = `/categories/${categoryId}`
  if (!subcategoryLabel) {
    return base
  }

  return `${base}?subcategory=${encodeURIComponent(subcategoryLabel)}`
}

export function getCategoryPathFromSelection(selection: CategoryListingSelection): string {
  return getCategoryPath(selection.categoryId, selection.subcategoryLabel)
}

export function getProductPath(productId: string, context?: ProductLinkContext): string {
  const base = `/products/${productId}`

  if (!context) {
    return base
  }

  if ('from' in context) {
    return `${base}?from=${context.from}`
  }

  const params = new URLSearchParams({
    category: context.categoryId,
    subcategory: context.subcategory,
  })

  return `${base}?${params.toString()}`
}

export function parseCategoryRoute(
  categoryIdParam: string | undefined,
  subcategoryParam: string | null,
  apiCategories: ApiCategory[] = [],
): CategoryListingSelection | null {
  if (!categoryIdParam) {
    return buildAllCategoriesListingSelection(apiCategories)
  }

  if (categoryIdParam === 'all-categories') {
    return buildAllCategoriesListingSelection(apiCategories)
  }

  if (isSpecialCategoryId(categoryIdParam)) {
    return buildCategoryListingSelection(
      categoryIdParam as SidebarCategoryId,
      apiCategories,
      subcategoryParam,
    )
  }

  if (apiCategories.length > 0 && !findApiCategory(apiCategories, categoryIdParam)) {
    return null
  }

  return buildCategoryListingSelection(
    categoryIdParam as SidebarCategoryId,
    apiCategories,
    subcategoryParam,
  )
}
