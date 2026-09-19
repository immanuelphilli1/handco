import type { SidebarCategoryId } from './categoriesModal'
import { getSubcategoryOptions, sidebarCategories } from './categoriesModal'
import type { CategoryListingSelection } from './categoryListing'
import { allCategoriesListingSelection } from './categoryListing'
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

export function getWishlistPath(): string {
  return '/wishlist'
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
): CategoryListingSelection | null {
  if (!categoryIdParam) {
    return allCategoriesListingSelection
  }

  if (!isSidebarCategoryId(categoryIdParam)) {
    return null
  }

  if (categoryIdParam === 'all-categories') {
    return allCategoriesListingSelection
  }

  const categoryLabel =
    sidebarCategories.find((category) => category.id === categoryIdParam)?.label ??
    categoryIdParam
  const subcategoryOptions = getSubcategoryOptions(categoryIdParam)
  const subcategoryLabel =
    subcategoryParam && subcategoryOptions.includes(subcategoryParam)
      ? subcategoryParam
      : (subcategoryOptions[0] ?? 'All products')

  return {
    categoryId: categoryIdParam,
    categoryLabel,
    subcategoryLabel,
    subcategoryOptions,
  }
}

export function parseProductRoute(
  productId: string | undefined,
  searchParams: URLSearchParams,
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
    const categoryLabel =
      sidebarCategories.find((category) => category.id === categoryId)?.label ??
      product.category

    return buildProductDetailContext(product, {
      categoryId,
      categoryLabel,
      subcategoryLabel: subcategory,
      subcategoryOptions: getSubcategoryOptions(categoryId),
    })
  }

  const categoryLabel =
    sidebarCategories.find((category) => category.id === product.categoryId)?.label ??
    product.category

  return buildProductDetailContext(product, {
    categoryId: product.categoryId,
    categoryLabel,
    subcategoryLabel: product.subcategory,
    subcategoryOptions: getSubcategoryOptions(product.categoryId),
  })
}
