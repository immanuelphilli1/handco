import type { ApiCategory } from '../api/types'
import type { SidebarCategoryId } from './categoriesModal'
import { sidebarCategories } from './categoriesModal'
import type { CategoryListingSelection } from './categoryListing'
import {
  buildAllCategoriesListingSelection,
  buildCategoryListingSelection,
  getCategoryLabel,
  getSubcategoryOptions,
} from './catalogCategories'
import {
  buildFeaturedProductDetailContext,
  buildHomeProductDetailContext,
  buildProductDetailContext,
  buildWishlistProductDetailContext,
  type ProductDetailContext,
} from './productDetail'
import { getProductById } from './products'

export type ProductLinkContext =
  | { from: 'home' | 'featured' | 'wishlist' }
  | { categoryId: SidebarCategoryId; subcategory: string }

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

/**
 * Return / cancel landing pages for the provider redirect. The backend appends
 * `?reference=<payment rid>` to both, so the path is fixed and the reference is
 * read from the query string at render time.
 */
export function getPaymentReturnPath(): string {
  return '/checkout/return'
}

export function getPaymentCancelPath(): string {
  return '/checkout/cancel'
}

/**
 * Google redirects here after the user picks an account. The path must match the
 * `redirect_uri` registered with Google exactly (currently
 * `https://handco.onrender.com/oauth/google/callback`), so it is not configurable.
 */
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
  categoryId: SidebarCategoryId,
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

function isSidebarCategoryId(value: string): value is SidebarCategoryId {
  return sidebarCategories.some((category) => category.id === value)
}

export function parseCategoryRoute(
  categoryIdParam: string | undefined,
  subcategoryParam: string | null,
  apiCategories: ApiCategory[] = [],
): CategoryListingSelection | null {
  if (!categoryIdParam) {
    return buildAllCategoriesListingSelection(apiCategories)
  }

  if (!isSidebarCategoryId(categoryIdParam)) {
    return null
  }

  if (categoryIdParam === 'all-categories') {
    return buildAllCategoriesListingSelection(apiCategories)
  }

  return buildCategoryListingSelection(categoryIdParam, apiCategories, subcategoryParam)
}

export function parseProductRoute(
  productId: string | undefined,
  searchParams: URLSearchParams,
  apiCategories: ApiCategory[] = [],
): ProductDetailContext | null {
  if (!productId) {
    return null
  }

  const product = getProductById(productId)
  if (!product) {
    return null
  }

  const from = searchParams.get('from')
  if (from === 'wishlist') {
    return buildWishlistProductDetailContext(product)
  }
  if (from === 'featured') {
    return buildFeaturedProductDetailContext(product)
  }
  if (from === 'home') {
    return buildHomeProductDetailContext(product)
  }

  const categoryId = searchParams.get('category')
  const subcategory = searchParams.get('subcategory')
  if (categoryId && isSidebarCategoryId(categoryId) && subcategory) {
    return buildProductDetailContext(product, {
      categoryId,
      categoryLabel: getCategoryLabel(categoryId, apiCategories),
      subcategoryLabel: subcategory,
      subcategoryOptions: getSubcategoryOptions(categoryId, apiCategories),
    })
  }

  return buildProductDetailContext(product, {
    categoryId: product.categoryId,
    categoryLabel: getCategoryLabel(product.categoryId, apiCategories),
    subcategoryLabel: product.subcategory,
    subcategoryOptions: getSubcategoryOptions(product.categoryId, apiCategories),
  })
}
