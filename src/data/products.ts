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
 * Top-level category slugs whose product images show as 1:1 squares instead of
 * the store-wide 3:4 portrait. The client asked for this for the EV category.
 * Staging has no category called EV, so this matches the likely slugs and
 * Energy (solar, batteries, chargers); edit the list to match the live slug.
 */
const SQUARE_IMAGE_CATEGORY_SLUGS = ['ev', 'evs', 'electric-vehicles', 'energy']

/**
 * True when a product's images should be square. `categoryId` is the leaf
 * slug (for example `energy-solar`), and child slugs start with their parent's.
 */
export function usesSquareProductImages(categoryId: string | null | undefined): boolean {
  const slug = (categoryId ?? '').toLowerCase()
  return SQUARE_IMAGE_CATEGORY_SLUGS.some((root) => slug === root || slug.startsWith(`${root}-`))
}
