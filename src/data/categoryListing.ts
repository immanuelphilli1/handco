import type { ApiCategory } from '../api/types'
import { buildAllCategoriesListingSelection } from './catalogCategories'
import { ALL_PRODUCTS_LABEL, type SidebarCategoryId } from './categoriesModal'
import { allProducts, getProductsByCategoryId, type Product } from './products'

export type CategoryListingSelection = {
  categoryId: SidebarCategoryId
  categoryLabel: string
  subcategoryLabel: string
  subcategoryOptions: string[]
}

export function getAllCategoriesListingSelection(
  apiCategories: ApiCategory[] = [],
): CategoryListingSelection {
  return buildAllCategoriesListingSelection(apiCategories)
}

export const deliveryFilterOptions = [
  'Free delivery',
  'Delivery in 1 day',
  'Delivery in 3 days',
  'Delivery in 5 days',
  'Delivery in 7 days',
]

export const collapsedFilterSections = ['Brand', 'Color', 'Seller']

export const mobileCollapsedFilterSections = ['Color', 'Connectivity', 'Storage']

/**
 * All active facet selections. Each value is a single choice or a range because
 * the API only supports one value per facet, so the UI mirrors that instead of
 * advertising multi-select it cannot honour.
 */
export type ListingFilters = {
  minPrice: number
  maxPrice: number
  rating: string
  delivery: string
  brand: string
  color: string
  screenSize: string
}

export const PRICE_FLOOR = 0
export const PRICE_CEILING = 6000

export const defaultListingFilters: ListingFilters = {
  minPrice: PRICE_FLOOR,
  maxPrice: PRICE_CEILING,
  rating: 'all',
  delivery: '',
  brand: '',
  color: '',
  screenSize: '',
}

export function hasActiveFilters(filters: ListingFilters): boolean {
  return (
    filters.minPrice > PRICE_FLOOR ||
    filters.maxPrice < PRICE_CEILING ||
    filters.rating !== defaultListingFilters.rating ||
    filters.delivery !== '' ||
    filters.brand !== '' ||
    filters.color !== '' ||
    filters.screenSize !== ''
  )
}

function matchesRating(product: Product, rating: string): boolean {
  if (rating === 'all' || rating === '') {
    return true
  }

  return Number(product.rating || 0) >= Number(rating)
}

function matchesPrice(product: Product, minPrice: number, maxPrice: number): boolean {
  // Products without a numeric price (only reachable on static fallback data)
  // stay visible rather than being silently dropped from every range.
  if (product.priceAmount === undefined) {
    return true
  }

  return product.priceAmount >= minPrice && product.priceAmount <= maxPrice
}

/**
 * Applies the facet selections to an already-fetched product list.
 *
 * Filtering runs client-side against the full catalog: the API supports every
 * facet used here, but round-tripping on each slider drag would be both chatty
 * and racy. The whole catalog is fetched up front, so local filtering is the
 * simpler and more responsive choice.
 */
export function applyListingFilters(
  products: Product[],
  filters: ListingFilters,
): Product[] {
  return products.filter((product) => {
    if (!matchesRating(product, filters.rating)) {
      return false
    }

    if (!matchesPrice(product, filters.minPrice, filters.maxPrice)) {
      return false
    }

    if (filters.delivery && product.delivery !== filters.delivery) {
      return false
    }

    if (filters.brand && product.brand !== filters.brand) {
      return false
    }

    if (filters.color && product.color !== filters.color) {
      return false
    }

    if (filters.screenSize && product.screenSize !== filters.screenSize) {
      return false
    }

    return true
  })
}

export function getListingProducts(
  selection: CategoryListingSelection,
  activeSubcategory?: string,
): Product[] {
  const products =
    selection.categoryId === 'all-categories'
      ? allProducts
      : getProductsByCategoryId(selection.categoryId)

  // "All products" is a UI-only label that means "ignore the category", so it
  // must not be matched against product.subcategory (nothing carries that
  // value, which would filter the list down to zero).
  if (activeSubcategory === ALL_PRODUCTS_LABEL) {
    return allProducts
  }

  if (!activeSubcategory || !selection.subcategoryOptions.includes(activeSubcategory)) {
    return products
  }

  return products.filter((product) => product.subcategory === activeSubcategory)
}

export const categoryListingProducts: Product[] = allProducts
