import type { CategoryListingSelection } from './categoryListing'
import { allProducts } from './products'
import type { Product } from './products'

export type ProductReview = {
  author: string
  location: string
  date: string
  rating: number
  text: string
}

export type ProductDetail = {
  product: Product
  images: string[]
  ratingValue: number
  reviewCount: number
  soldCount: number
  priceAmount: string
  priceCurrency: string
  discountNotice: string
  modelOptions: string[]
  descriptionLines: string[]
  reviews: ProductReview[]
  shippingAddress: {
    line1: string
    line2: string
  }
  shippingFee: string
  deliveryEstimate: string
  itemsTotal: string
  subtotal: string
}

const defaultReviews: ProductReview[] = [
  {
    author: 'vik***r',
    location: 'UAE',
    date: 'Aug 2, 2026',
    rating: 4,
    text: 'Great product for the price, delivered on time  would buy again A++',
  },
  {
    author: 'vik***r',
    location: 'UAE',
    date: 'Aug 2, 2026',
    rating: 4,
    text: 'Great product for the price, delivered on time  would buy again A++',
  },
  {
    author: 'vik***r',
    location: 'UAE',
    date: 'Aug 2, 2026',
    rating: 4,
    text: 'Great product for the price, delivered on time  would buy again A++',
  },
  {
    author: 'vik***r',
    location: 'UAE',
    date: 'Aug 2, 2026',
    rating: 4,
    text: 'Great product for the price, delivered on time  would buy again A++',
  },
]

const defaultModelOptions = [
  '50-inch 50Q21BG-CA',
  '55-inch 50Q21BG-CA',
  '55-inch 50Q21BG-CA',
  '55-inch 50Q21BG-CA',
]

function parsePriceAmount(price: string): string {
  const numeric = price.replace(/[^0-9.]/g, '')
  if (!numeric) return price
  const value = Number.parseFloat(numeric)
  if (Number.isNaN(value)) return price
  return value % 1 === 0 ? String(Math.round(value)) : value.toFixed(2)
}

function parseCurrency(price: string): string {
  if (price.includes('AED')) return 'AED'
  if (price.includes('$')) return '$'
  return 'AED'
}

export function buildProductDetail(product: Product): ProductDetail {
  const priceAmount = parsePriceAmount(product.price)
  const priceCurrency = parseCurrency(product.price)
  const ratingMatch = product.rating.match(/^([\d.]+)/)
  const ratingValue = ratingMatch ? Number.parseFloat(ratingMatch[1]) : 4

  return {
    product,
    images: [product.image, product.image, product.image, product.image],
    ratingValue,
    reviewCount: 23,
    soldCount: 20,
    priceAmount,
    priceCurrency,
    discountNotice: 'Get 10% off on your first order',
    modelOptions: defaultModelOptions,
    descriptionLines: [
      `${product.name} with premium build quality and smart features.`,
      'Premium build quality with manufacturer warranty',
      'Genuine product — all items verified authentic',
      'Easy 30-day return policy',
    ],
    reviews: defaultReviews,
    shippingAddress: {
      line1: 'Hse 8 M Street',
      line2: 'Accra Ghana',
    },
    shippingFee: `${priceCurrency} ${priceAmount}`,
    deliveryEstimate: '2-5 business days',
    itemsTotal: `${priceCurrency} ${priceAmount}`,
    subtotal: `${priceCurrency} ${priceAmount}`,
  }
}

export function getRelatedProducts(currentProduct: Product): Product[] {
  return allProducts.filter((product) => product.id !== currentProduct.id).slice(0, 10)
}

export type ProductDetailContext = {
  detail: ProductDetail
  selection: CategoryListingSelection
}

export function buildProductDetailContext(
  product: Product,
  selection: CategoryListingSelection,
): ProductDetailContext {
  return {
    detail: buildProductDetail(product),
    selection,
  }
}

const homeNewArrivalsSelection: CategoryListingSelection = {
  categoryId: 'featured',
  categoryLabel: 'New Arrivals',
  subcategoryLabel: 'Featured',
  subcategoryOptions: [],
}

const homeFeaturedSelection: CategoryListingSelection = {
  categoryId: 'featured',
  categoryLabel: 'Featured items',
  subcategoryLabel: 'Featured',
  subcategoryOptions: [],
}

const wishlistSelection: CategoryListingSelection = {
  categoryId: 'featured',
  categoryLabel: 'Wishlist',
  subcategoryLabel: 'Liked items',
  subcategoryOptions: [],
}

export function buildWishlistProductDetailContext(product: Product): ProductDetailContext {
  return buildProductDetailContext(product, wishlistSelection)
}

export function buildHomeProductDetailContext(product: Product): ProductDetailContext {
  return buildProductDetailContext(product, homeNewArrivalsSelection)
}

export function buildFeaturedProductDetailContext(product: Product): ProductDetailContext {
  return buildProductDetailContext(product, homeFeaturedSelection)
}
