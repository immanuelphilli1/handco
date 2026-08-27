import { getSubcategoryOptions, type SidebarCategoryId } from './categoriesModal'
import { allProducts, getProductsByCategoryId, type Product } from './products'

export type CategoryListingSelection = {
  categoryId: SidebarCategoryId
  categoryLabel: string
  subcategoryLabel: string
  subcategoryOptions: string[]
}

export const allSubcategoryOptions = getSubcategoryOptions('all-categories')

export const allCategoriesListingSelection: CategoryListingSelection = {
  categoryId: 'all-categories',
  categoryLabel: 'All categories',
  subcategoryLabel: 'All products',
  subcategoryOptions: allSubcategoryOptions,
}

export const deliveryFilterOptions = [
  'Free delivery',
  'Delivery in 1 day',
  'Delivery in 3 days',
  'Delivery in 5 days',
  'Delivery in 7 days',
]

export const collapsedFilterSections = ['Brand', 'Color', 'Seller']

export function getListingProducts(
  selection: CategoryListingSelection,
  activeSubcategory?: string,
): Product[] {
  const products =
    selection.categoryId === 'all-categories'
      ? allProducts
      : getProductsByCategoryId(selection.categoryId)

  if (!activeSubcategory || !selection.subcategoryOptions.includes(activeSubcategory)) {
    return products
  }

  return products.filter((product) => product.subcategory === activeSubcategory)
}

export const categoryListingProducts: Product[] = allProducts
