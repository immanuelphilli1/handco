import type { ApiCategory, ApiCategoryNode } from '../api/types'
import { resolveAssetUrl } from '../api/mappers'
import { flattenApiSubcategories, getApiChildNodes, getCategoryNodeId } from './catalogCategories'

/**
 * Content of the SHEIN-style Categories menu.
 *
 * The menu lists main categories down the start edge. Picking one shows:
 *  - "Shop by category": a View All tile for the whole category, then its
 *    direct children (the second level).
 *  - One group per child that has children of its own, titled with the child
 *    and holding a View All tile plus the child's descendants (third level and
 *    deeper).
 *
 * Every tile carries the storefront path it opens, so the menu never has to
 * resolve labels back to slugs.
 */
export type MegaMenuTile = {
  key: string
  label: string
  path: string
  image?: string
  /** Category id whose nav icon fills the circle when there is no image. */
  iconCategoryId?: string
  isViewAll?: boolean
}

export type MegaMenuGroup = {
  key: string
  title: string
  tiles: MegaMenuTile[]
}

export type MegaMenuContent = {
  shopByCategory: MegaMenuTile[]
  groups: MegaMenuGroup[]
}

export type MegaMenuEntry = {
  id: string
  label: string
}

/**
 * Virtual entries shown above the API's main categories. Each is a real
 * listing (`/categories/<id>`) rather than a category in the tree.
 */
const VIRTUAL_ENTRIES: MegaMenuEntry[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'new-releases', label: 'New Releases' },
  { id: 'deals', label: 'Deals' },
]

const VIRTUAL_IDS = new Set(VIRTUAL_ENTRIES.map((entry) => entry.id))

export function isVirtualMegaMenuEntry(id: string): boolean {
  return VIRTUAL_IDS.has(id)
}

export function buildMegaMenuEntries(apiCategories: ApiCategory[]): MegaMenuEntry[] {
  return [
    ...VIRTUAL_ENTRIES,
    ...apiCategories.map((category) => ({
      id: getCategoryNodeId(category),
      label: category.label,
    })),
  ]
}

export function getCategoryListingPath(categoryId: string): string {
  return `/categories/${encodeURIComponent(categoryId)}`
}

function nodeImage(node: ApiCategoryNode): string | undefined {
  return resolveAssetUrl(node.imageUrl ?? node.image ?? undefined) || undefined
}

function viewAllTile(key: string, path: string): MegaMenuTile {
  return { key: `${key}-view-all`, label: 'View All', path, isViewAll: true }
}

function nodeTile(node: ApiCategoryNode, iconCategoryId?: string): MegaMenuTile {
  const id = getCategoryNodeId(node)
  const image = nodeImage(node)
  return {
    key: id,
    label: node.label,
    path: getCategoryListingPath(id),
    ...(image ? { image } : { iconCategoryId }),
  }
}

/** Removes repeated labels, keeping the first, so a grid never shows a name twice. */
function uniqueByLabel(tiles: MegaMenuTile[]): MegaMenuTile[] {
  const seen = new Set<string>()
  return tiles.filter((tile) => {
    const key = tile.label.trim().toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function buildRealCategoryContent(root: ApiCategory): MegaMenuContent {
  const rootId = getCategoryNodeId(root)
  const children = getApiChildNodes(root)

  return {
    shopByCategory: [
      viewAllTile(rootId, getCategoryListingPath(rootId)),
      ...children.map((child) => nodeTile(child, rootId)),
    ],
    groups: children
      .filter((child) => getApiChildNodes(child).length > 0)
      .map((child) => {
        const childId = getCategoryNodeId(child)
        return {
          key: childId,
          title: child.label,
          tiles: [
            viewAllTile(childId, getCategoryListingPath(childId)),
            ...uniqueByLabel(flattenApiSubcategories(child).map((node) => nodeTile(node, rootId))),
          ],
        }
      }),
  }
}

/**
 * Featured, New Releases and Deals are not categories, so their panel offers
 * the main categories as shortcuts, then each category's own children.
 */
function buildVirtualContent(entryId: string, apiCategories: ApiCategory[]): MegaMenuContent {
  return {
    shopByCategory: [
      viewAllTile(entryId, getCategoryListingPath(entryId)),
      ...apiCategories.map((root) => {
        const rootId = getCategoryNodeId(root)
        return nodeTile(root, rootId)
      }),
    ],
    groups: apiCategories
      .filter((root) => getApiChildNodes(root).length > 0)
      .map((root) => {
        const rootId = getCategoryNodeId(root)
        return {
          key: `${entryId}-${rootId}`,
          title: root.label,
          tiles: [
            viewAllTile(`${entryId}-${rootId}`, getCategoryListingPath(rootId)),
            ...getApiChildNodes(root).map((child) => nodeTile(child, rootId)),
          ],
        }
      }),
  }
}

export function buildMegaMenuContent(
  entryId: string,
  apiCategories: ApiCategory[],
): MegaMenuContent {
  if (isVirtualMegaMenuEntry(entryId)) {
    return buildVirtualContent(entryId, apiCategories)
  }

  const root = apiCategories.find((category) => getCategoryNodeId(category) === entryId)
  return root ? buildRealCategoryContent(root) : { shopByCategory: [], groups: [] }
}

/**
 * The category slug a storefront link opens (`/categories/<slug>`), or null for
 * any other link (search, product, external URL).
 */
export function getCategorySlugFromLink(linkUrl: string): string | null {
  const match = /^\/categories\/([^/?#]+)\/?(?:[?#].*)?$/.exec(linkUrl.trim())
  if (!match) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}

/**
 * The main-category entry a category belongs to: itself when it is an entry,
 * else its top-level ancestor. Null when the category is not in the tree.
 */
export function findMegaMenuEntryId(
  categoryId: string,
  apiCategories: ApiCategory[],
): string | null {
  if (isVirtualMegaMenuEntry(categoryId)) return categoryId

  for (const root of apiCategories) {
    const rootId = getCategoryNodeId(root)
    if (rootId === categoryId) return rootId
    if (flattenApiSubcategories(root).some((node) => getCategoryNodeId(node) === categoryId)) {
      return rootId
    }
  }

  return null
}

/** The main category to open the menu on, falling back to Featured. */
export function resolveMegaMenuEntryId(
  categoryId: string | undefined,
  apiCategories: ApiCategory[],
): string {
  return (categoryId && findMegaMenuEntryId(categoryId, apiCategories)) || 'featured'
}
