import type { ApiCategory, ApiCategoryNode } from '../api/types'
import type { CategoryListingSelection } from './categoryListing'
import { ALL_PRODUCTS_LABEL, type SidebarCategoryId } from './categoriesModal'

const SPECIAL_CATEGORY_IDS = new Set<string>(['all-categories', 'featured', 'new-releases', 'deals'])

const VIRTUAL_CATEGORY_LABELS: Record<string, string> = {
  'all-categories': 'All categories',
  featured: 'Featured',
  'new-releases': 'New Releases',
  deals: 'Deals',
}

export function getMajorCategoryId(categoryId: SidebarCategoryId | string): SidebarCategoryId | string {
  return categoryId
}

export function isSpecialCategoryId(categoryId: string): boolean {
  return SPECIAL_CATEGORY_IDS.has(categoryId)
}

/**
 * Whether the URL segment can be mapped to a listing query without guessing.
 * Until the category tree has loaded, a child slug in `/categories/:id` is
 * indistinguishable from a bogus top-level id, which would fire the wrong
 * `GET /products` request before the real selection arrives.
 */
export function isCategoryRouteReady(
  routeCategoryId: string | undefined,
  apiCategories: ApiCategory[],
  catalogReady: boolean,
): boolean {
  if (!catalogReady) {
    return false
  }

  if (!routeCategoryId || routeCategoryId === 'all-categories') {
    return true
  }

  if (isSpecialCategoryId(routeCategoryId)) {
    return true
  }

  if (apiCategories.length === 0) {
    return false
  }

  if (findCategoryInTree(apiCategories, routeCategoryId)) {
    return true
  }

  return apiCategories.some((category) => getCategoryNodeId(category) === routeCategoryId)
}

/**
 * The category's identifier as used by the rest of the app.
 *
 * The API sends the identifier as `slug`; `id` is accepted as a fallback. Every
 * lookup in this module goes through here rather than reading `.id` directly,
 * because a node without a `slug` used to read as `undefined` and silently sent
 * every lookup down the static-placeholder path.
 */
export function getCategoryNodeId(node: ApiCategoryNode): string {
  return node.slug ?? node.id ?? ''
}

export function findApiCategory(
  categories: ApiCategory[],
  categoryId: string,
): ApiCategory | undefined {
  return categories.find((category) => getCategoryNodeId(category) === categoryId)
}

type CategoryTreeMatch = {
  node: ApiCategoryNode
  root: ApiCategory
}

/** Finds a category node anywhere in the tree and its top-level root. */
export function findCategoryInTree(
  categories: ApiCategory[],
  categoryId: string,
): CategoryTreeMatch | null {
  function search(
    nodes: ApiCategoryNode[],
    root: ApiCategory,
  ): CategoryTreeMatch | null {
    for (const node of nodes) {
      const nodeId = getCategoryNodeId(node)
      if (nodeId === categoryId) {
        return { node, root }
      }
      const childMatch = search(getApiChildNodes(node), root)
      if (childMatch) {
        return childMatch
      }
    }
    return null
  }

  for (const root of categories) {
    const rootId = getCategoryNodeId(root)
    if (rootId === categoryId) {
      return { node: root, root }
    }
    const match = search(getApiChildNodes(root), root)
    if (match) {
      return match
    }
  }

  return null
}

/**
 * Breadcrumb order: parent department, then the product's leaf category label.
 * Listing `categoryId` is always the top-level slug; `subcategoryLabel` is the
 * leaf label the API filters on.
 */
export function resolveProductListingSelection(
  productCategoryId: string,
  productSubcategory: string | undefined,
  apiCategories: ApiCategory[] = [],
): Pick<
  CategoryListingSelection,
  'categoryId' | 'categoryLabel' | 'subcategoryLabel' | 'subcategoryOptions'
> {
  const match = findCategoryInTree(apiCategories, productCategoryId)
  if (match) {
    const rootId = getCategoryNodeId(match.root)
    const nodeId = getCategoryNodeId(match.node)
    const subcategoryOptions = getSubcategoryOptions(rootId, apiCategories)

    if (rootId === nodeId) {
      const subcategoryLabel =
        productSubcategory && subcategoryOptions.includes(productSubcategory)
          ? productSubcategory
          : (subcategoryOptions[0] ?? ALL_PRODUCTS_LABEL)

      return {
        categoryId: rootId,
        categoryLabel: match.root.label,
        subcategoryLabel,
        subcategoryOptions,
      }
    }

    return {
      categoryId: rootId,
      categoryLabel: match.root.label,
      subcategoryLabel: match.node.label,
      subcategoryOptions,
    }
  }

  return {
    categoryId: productCategoryId,
    categoryLabel: getCategoryLabel(productCategoryId, apiCategories),
    subcategoryLabel: productSubcategory ?? ALL_PRODUCTS_LABEL,
    subcategoryOptions: getSubcategoryOptions(productCategoryId, apiCategories),
  }
}

/**
 * Returns a node's child nodes, preferring the API's `children` key and falling
 * back to the legacy `subcategories` key. Both are optional on the wire, so this
 * never returns undefined.
 */
export function getApiChildNodes(node: ApiCategoryNode): ApiCategoryNode[] {
  return node.children ?? node.subcategories ?? []
}

/**
 * Depth-first flatten of a category subtree, excluding the root node itself.
 * Grandchild nodes (e.g. "Gaming Laptops" under Computers > Laptops) are real
 * categories that products are assigned to, so they belong in the option list.
 */
export function flattenApiSubcategories(node: ApiCategoryNode): ApiCategoryNode[] {
  return getApiChildNodes(node).flatMap((child) => [child, ...flattenApiSubcategories(child)])
}

export function getSubcategoryLabels(category: ApiCategory): string[] {
  return flattenApiSubcategories(category).map((subcategory) => subcategory.label)
}

/** Resolves a subcategory label under a parent to the child's API slug. */
export function findSubcategorySlugByLabel(
  parentCategoryId: string,
  subcategoryLabel: string,
  apiCategories: ApiCategory[] = [],
): string | null {
  if (subcategoryLabel === ALL_PRODUCTS_LABEL) {
    return null
  }

  const parent = findApiCategory(apiCategories, parentCategoryId)
  if (!parent) {
    return null
  }

  for (const node of flattenApiSubcategories(parent)) {
    if (node.label === subcategoryLabel) {
      return getCategoryNodeId(node)
    }
  }

  return null
}

/**
 * Resolves a subcategory label to its slug under any top-level category, for
 * listings that span the whole catalog (Deals).
 */
export function findSubcategorySlugAcrossCatalog(
  subcategoryLabel: string,
  apiCategories: ApiCategory[] = [],
): string | null {
  for (const category of apiCategories) {
    const slug = findSubcategorySlugByLabel(getCategoryNodeId(category), subcategoryLabel, apiCategories)
    if (slug) return slug
  }
  return null
}

export function getSubcategoryOptions(
  categoryId: SidebarCategoryId | string,
  apiCategories: ApiCategory[] = [],
): string[] {
  if (categoryId === 'all-categories') {
    if (apiCategories.length === 0) return []
    return apiCategories.flatMap(getSubcategoryLabels)
  }

  if (isSpecialCategoryId(categoryId)) {
    if (apiCategories.length === 0) return []
    return apiCategories.flatMap((category) =>
      getApiChildNodes(category).map((child) => child.label),
    )
  }

  const apiCategory = findApiCategory(apiCategories, categoryId)
  if (apiCategory) {
    return getSubcategoryLabels(apiCategory)
  }

  return []
}

export function getCategoryLabel(
  categoryId: SidebarCategoryId | string,
  apiCategories: ApiCategory[] = [],
): string {
  const apiCategory = findApiCategory(apiCategories, categoryId)
  if (apiCategory) {
    return apiCategory.label
  }

  return VIRTUAL_CATEGORY_LABELS[categoryId] ?? categoryId
}

/**
 * UI-only sentinel for "no subcategory filter". Re-exported from
 * `categoriesModal` so the label is defined once and can be listed as a real
 * subcategory entry (e.g. under Featured) without duplicating the string.
 */
export { ALL_PRODUCTS_LABEL }

export function buildAllCategoriesListingSelection(
  apiCategories: ApiCategory[] = [],
): CategoryListingSelection {
  return {
    categoryId: 'all-categories',
    categoryLabel: 'All categories',
    subcategoryLabel: ALL_PRODUCTS_LABEL,
    subcategoryOptions: getSubcategoryOptions('all-categories', apiCategories),
  }
}

export function buildCategoryListingSelection(
  categoryId: SidebarCategoryId | string,
  apiCategories: ApiCategory[] = [],
  subcategoryParam: string | null = null,
): CategoryListingSelection {
  if (categoryId === 'all-categories') {
    return buildAllCategoriesListingSelection(apiCategories)
  }

  const subcategoryOptions = getSubcategoryOptions(categoryId, apiCategories)
  const subcategoryLabel =
    subcategoryParam && subcategoryOptions.includes(subcategoryParam)
      ? subcategoryParam
      : ALL_PRODUCTS_LABEL

  return {
    categoryId,
    categoryLabel: getCategoryLabel(categoryId, apiCategories),
    subcategoryLabel,
    subcategoryOptions,
  }
}
