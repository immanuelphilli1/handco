import type { ApiCategory, ApiCategoryNode, ApiSubcategory } from '../api/types'
import { resolveAssetUrl } from '../api/mappers'
import { images } from '../assets/images'
import type { CategoryListingSelection } from './categoryListing'
import {
  ALL_PRODUCTS_LABEL,
  categoryIdByTitle,
  categoryPanelContent,
  getSubcategoryOptions as getStaticSubcategoryOptions,
  sidebarCategories,
  type CategorySection,
  type SidebarCategoryId,
  type Subcategory,
} from './categoriesModal'

const SPECIAL_CATEGORY_IDS = new Set<string>(['all-categories', 'featured', 'new-releases'])

/**
 * Major categories as shown in the link bar, mapped to the API categories they
 * group together.
 *
 * The API models Accessories, Furniture and Decor as separate top-level
 * categories, but the link bar presents them under one major category. So every
 * member id resolves to the same grouped panel and highlights the same link bar
 * entry, rendered as one section per member (mirroring how Featured shows both
 * "Featured" and "New Releases").
 */
const MAJOR_CATEGORY_GROUPS: Partial<Record<SidebarCategoryId, SidebarCategoryId[]>> = {
  electronics: ['electronics'],
  fashion: ['fashion', 'accessories'],
  'home-garden': ['home-garden', 'furniture', 'decor'],
  construction: ['construction'],
  energy: ['energy'],
}

/**
 * Reverse lookup from a category id to its major link bar category, so browsing
 * Accessories or Furniture highlights "Fashion & Accessories" or "Home & Garden".
 */
const MAJOR_CATEGORY_BY_MEMBER = new Map<SidebarCategoryId, SidebarCategoryId>(
  Object.entries(MAJOR_CATEGORY_GROUPS).flatMap(([majorId, memberIds]) =>
    memberIds.map((memberId) => [memberId, majorId as SidebarCategoryId]),
  ),
)

/**
 * Resolves any category id to the major category that represents it in the link
 * bar. Ids outside a group (e.g. "decor" is grouped, but "all-categories" is
 * not) are returned unchanged.
 */
export function getMajorCategoryId(categoryId: SidebarCategoryId): SidebarCategoryId {
  return MAJOR_CATEGORY_BY_MEMBER.get(categoryId) ?? categoryId
}

export type CategoryPanelSectionView = CategorySection & {
  sectionId: SidebarCategoryId
}

export function isSpecialCategoryId(categoryId: string): boolean {
  return SPECIAL_CATEGORY_IDS.has(categoryId)
}

export function findApiCategory(
  categories: ApiCategory[],
  categoryId: string,
): ApiCategory | undefined {
  return categories.find((category) => category.id === categoryId)
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

export function getSubcategoryOptions(
  categoryId: SidebarCategoryId,
  apiCategories: ApiCategory[] = [],
): string[] {
  if (categoryId === 'all-categories') {
    if (apiCategories.length > 0) {
      return apiCategories.flatMap(getSubcategoryLabels)
    }

    return getStaticSubcategoryOptions('all-categories')
  }

  if (isSpecialCategoryId(categoryId)) {
    return getStaticSubcategoryOptions(categoryId)
  }

  // Deliberately NOT grouped. A subcategory label only resolves when paired with
  // the category that owns it (e.g. "Bags" needs categoryId=accessories), so
  // merging the chips under the major category makes them match zero products.
  const apiCategory = findApiCategory(apiCategories, categoryId)
  if (apiCategory) {
    return getSubcategoryLabels(apiCategory)
  }

  return getStaticSubcategoryOptions(categoryId)
}

const modalFallbackImages = images.categoriesModal.items

export function mapApiSubcategoriesToModalItems(
  subcategories: ApiSubcategory[],
  startIndex = 0,
): Subcategory[] {
  return subcategories.map((subcategory, index) => ({
    label: subcategory.label,
    image:
      resolveAssetUrl(subcategory.imageUrl ?? subcategory.image ?? undefined) ||
      modalFallbackImages[(startIndex + index) % modalFallbackImages.length],
  }))
}

export function getCategoryLabel(
  categoryId: SidebarCategoryId,
  apiCategories: ApiCategory[] = [],
): string {
  const apiCategory = findApiCategory(apiCategories, categoryId)
  if (apiCategory) {
    return apiCategory.label
  }

  return sidebarCategories.find((category) => category.id === categoryId)?.label ?? categoryId
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
  categoryId: SidebarCategoryId,
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
      : (subcategoryOptions[0] ?? ALL_PRODUCTS_LABEL)

  return {
    categoryId,
    categoryLabel: getCategoryLabel(categoryId, apiCategories),
    subcategoryLabel,
    subcategoryOptions,
  }
}

function resolveSectionId(
  title: string,
  apiCategories: ApiCategory[],
): SidebarCategoryId | undefined {
  const apiMatch = apiCategories.find((category) => category.label === title)
  if (apiMatch) {
    return apiMatch.id as SidebarCategoryId
  }

  return categoryIdByTitle[title]
}

function buildSectionsForCategory(
  categoryId: SidebarCategoryId,
  apiCategories: ApiCategory[],
): CategoryPanelSectionView[] {
  const apiCategory = findApiCategory(apiCategories, categoryId)
  if (apiCategory) {
    return [
      {
        title: apiCategory.label,
        sectionId: apiCategory.id as SidebarCategoryId,
        items: mapApiSubcategoriesToModalItems(flattenApiSubcategories(apiCategory)),
      },
    ]
  }

  const fallbackSections = categoryPanelContent[categoryId] ?? []
  return fallbackSections.flatMap((section) => {
    const sectionId = resolveSectionId(section.title, apiCategories) ?? categoryId
    return [{ ...section, sectionId }]
  })
}

export function getCategoryPanelSections(
  categoryId: SidebarCategoryId,
  apiCategories: ApiCategory[] = [],
): CategoryPanelSectionView[] {
  if (categoryId === 'featured') {
    return categoryPanelContent.featured.flatMap((section) => {
      const sectionId = resolveSectionId(section.title, apiCategories)
      if (!sectionId) {
        return []
      }

      return [{ ...section, sectionId }]
    })
  }

  if (categoryId === 'new-releases') {
    return categoryPanelContent['new-releases'].map((section) => ({
      ...section,
      sectionId: 'new-releases',
    }))
  }

  if (categoryId === 'all-categories') {
    return []
  }

  // Resolve to the major category first so every entry point (link bar, category
  // grid, and the mobile list) shows the same grouped panel. Without this, a
  // grouped member id like "accessories" would fall through to the
  // single-section path and hide the rest of its group.
  const group = MAJOR_CATEGORY_GROUPS[getMajorCategoryId(categoryId)]
  if (group) {
    return group.flatMap((groupedId) => buildSectionsForCategory(groupedId, apiCategories))
  }

  return buildSectionsForCategory(categoryId, apiCategories)
}
