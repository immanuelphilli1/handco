import type { SidebarCategoryId } from './categoriesModal'

/** One product attribute, ready to display. */
export type ProductAttribute = {
  key: string
  label: string
  value: string
}

export type Product = {
  id: string
  categoryId: SidebarCategoryId | string
  subcategory: string
  image: string
  tag: string
  category: string
  name: string
  price: string
  originalPrice?: string
  discount?: string
  delivery: string
  rating: string
  liked?: boolean
  showAddButton?: boolean
  priceOrange?: boolean
  imageObjectPosition?: string
  /**
   * Numeric facets. The API sends these alongside the display strings above and
   * the listing filters compare against them, so they must survive mapping.
   */
  priceAmount?: number
  /** ISO currency code from `priceMoney`, used by listing price filters. */
  priceCurrency?: string
  brand?: string
  color?: string
  screenSize?: string | null
  /**
   * Every attribute with its display name, in the order the category lists them.
   * Rendered directly as `label: value`; `key` is what attribute filters use.
   */
  attributes?: ProductAttribute[]
  /** False when the default variant cannot currently be bought. */
  inStock?: boolean
  /**
   * True when the product has more than one variant (size, colour, model), so
   * the shopper has to choose before it can go in the cart.
   */
  hasVariantChoice?: boolean
}

export function getProductKey(product: Pick<Product, 'id'>): string {
  return product.id
}

/**
 * Category slugs whose product images show as 1:1 squares instead of the
 * store-wide 3:4 portrait, together with every category under them. The client
 * asked for this for EV (`/categories/ev`: Cars, Electric Bikes, Scooters).
 */
export const SQUARE_IMAGE_ROOT_SLUGS = ['ev']

type CategoryTreeNode = { slug?: string; children?: CategoryTreeNode[] }

/**
 * Every slug that takes square images: each root above plus all of its
 * descendants in the category tree. Subcategory slugs do not carry their
 * parent's prefix (EV's children are `cars`, `used`, `scooters`), so the tree is
 * the only way to tell which products sit under EV.
 */
export function collectSquareImageSlugs(categories: CategoryTreeNode[]): Set<string> {
  const slugs = new Set<string>(SQUARE_IMAGE_ROOT_SLUGS)

  const addAll = (nodes: CategoryTreeNode[] | undefined) => {
    for (const node of nodes ?? []) {
      if (node.slug) slugs.add(node.slug.toLowerCase())
      addAll(node.children)
    }
  }
  const visit = (nodes: CategoryTreeNode[] | undefined) => {
    for (const node of nodes ?? []) {
      if (node.slug && SQUARE_IMAGE_ROOT_SLUGS.includes(node.slug.toLowerCase())) {
        addAll(node.children)
      } else {
        visit(node.children)
      }
    }
  }

  visit(categories)
  return slugs
}
