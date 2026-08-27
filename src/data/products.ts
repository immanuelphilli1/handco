import type { SidebarCategoryId } from './categoriesModal'
import productsCatalog from './products.json'

export type Product = {
  id: string
  categoryId: SidebarCategoryId
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
}

type ProductRecord = Omit<Product, 'categoryId'>

type CategoryCatalog = {
  id: SidebarCategoryId
  label: string
  products: ProductRecord[]
}

const catalog = productsCatalog as { categories: CategoryCatalog[] }

function withCategoryId(categoryId: SidebarCategoryId, product: ProductRecord): Product {
  return { ...product, categoryId }
}

const productsByCategoryId = Object.fromEntries(
  catalog.categories.map((category) => [
    category.id,
    category.products.map((product) => withCategoryId(category.id, product)),
  ]),
) as Record<SidebarCategoryId, Product[]>

export const allProducts: Product[] = catalog.categories.flatMap((category) =>
  category.products.map((product) => withCategoryId(category.id, product)),
)

export function getProductById(productId: string): Product | undefined {
  return allProducts.find((product) => product.id === productId)
}

export function getProductsByCategoryId(categoryId: SidebarCategoryId): Product[] {
  return productsByCategoryId[categoryId] ?? []
}

export const featuredProducts: Product[] = getProductsByCategoryId('featured')

export const newArrivalProducts: Product[] = getProductsByCategoryId('new-releases')

export function getProductKey(product: Pick<Product, 'id'>): string {
  return product.id
}