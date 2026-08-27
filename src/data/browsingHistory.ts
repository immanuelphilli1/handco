import type { Product } from './products'
import { featuredProducts } from './products'

export type BrowsingHistoryItem = {
  id: string
  product: Product
}

export type BrowsingHistorySection = {
  id: string
  label: string
  items: BrowsingHistoryItem[]
}

const todayProducts: Product[] = [
  featuredProducts[0],
  { ...featuredProducts[1], priceOrange: true },
  featuredProducts[2],
]

const olderProducts: Product[] = featuredProducts.slice(0, 10)

function toHistoryItems(products: Product[], prefix: string): BrowsingHistoryItem[] {
  return products.map((product, index) => ({
    id: `${prefix}-${index}`,
    product,
  }))
}

export const browsingHistorySections: BrowsingHistorySection[] = [
  {
    id: 'today',
    label: 'Today',
    items: toHistoryItems(todayProducts, 'today'),
  },
  {
    id: '2026-11-12',
    label: '12 Nov 2026',
    items: toHistoryItems(olderProducts, 'nov-12'),
  },
]

export function getAllHistoryItemIds(sections: BrowsingHistorySection[]): string[] {
  return sections.flatMap((section) => section.items.map((item) => item.id))
}
