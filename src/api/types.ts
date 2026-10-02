import type { AuthUser } from '../data/auth'
import type { CartItem } from '../data/cart'
import type { PrivacyPolicyBlock } from '../data/privacyPolicy'
import type { Product } from '../data/products'

export type Rid = string

export type Money = {
  amount: number
  currency: string
}

export type ApiErrorBody = {
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  message?: string
  errors?: Record<string, string[]>
}

export type ApiUser = AuthUser & { rid?: Rid }

export type { AuthUser }

export type AuthResponse = {
  user: ApiUser
  accessToken: string
  refreshToken: string
}

export type CheckEmailResponse = {
  exists: boolean
  nextStep: 'password' | 'register'
}

export type ApiProductCard = Product & {
  rid?: Rid
  priceMoney?: Money
  brand?: string
  color?: string
  screenSize?: string | null
}

/** Facet values the listing page renders as filter options. */
export type ProductFacets = {
  brands: string[]
  colors: string[]
  deliveryOptions: string[]
  screenSizes: string[]
}

export type PaginatedProductsResponse = {
  items: ApiProductCard[]
  total: number
  page?: number
  limit?: number
  facets?: ProductFacets
}

export type ApiProductVariant = {
  rid: Rid
  name: string
  sku: string
  priceMoney: Money
  isDefault: boolean
}

export type ApiProductDetailResponse = {
  product: ApiProductCard
  images: string[]
  ratingValue: number
  reviewCount: number
  soldCount: number
  priceAmount: string
  priceCurrency: string
  discountNotice?: string
  modelOptions: string[]
  variants?: ApiProductVariant[]
  descriptionLines?: string[]
  shippingFee?: string
  deliveryEstimate?: string
}

export type ApiProductReview = {
  author: string
  location: string
  date: string
  rating: number
  text: string
}

export type ApiCartItem = CartItem & {
  rid?: Rid
  productRid?: Rid
}

export type CartSummary = {
  itemsTotal: Money
  itemsDiscount: Money
  subtotal: Money
  shipping: Money
  total: Money
}

export type CartResponse = {
  items: ApiCartItem[]
  summary: CartSummary
}

/**
 * Category tree node. The API nests child nodes under `children`; `subcategories`
 * is accepted as an alias because some endpoints (e.g. the modal panel) used it
 * before the tree shape landed. Treat both via `getApiChildNodes`.
 */
export type ApiCategoryNode = {
  id: string
  rid: Rid
  label: string
  image: string | null
  imageUrl?: string | null
  parent?: string | null
  children?: ApiCategoryNode[]
  subcategories?: ApiCategoryNode[]
}

export type ApiCategory = ApiCategoryNode

export type ApiSubcategory = ApiCategoryNode

export type CategoriesResponse = {
  categories: ApiCategory[]
}

export type CategoryPanelSection = {
  title: string
  items: Array<{ label: string; image: string; rid?: Rid }>
}

export type CategoryPanelResponse = {
  sections: CategoryPanelSection[]
}

export type CheckoutPreviewResponse = {
  items: ApiCartItem[]
  address?: {
    rid?: Rid
    contact: string
    line1: string
    line2: string
  }
  defaultAddressRid?: Rid
  shipping?: {
    fee: string
    deliveryWindow: string
    courierLabel: string
  }
  paymentMethods?: Array<{
    id: string
    label: string
    icon?: string
    secondaryIcon?: string
    note?: string
  }>
  summary?: CartSummary
}

export type PaymentIntentResponse = {
  checkoutUrl: string
  paymentRid: Rid
  provider: string
}

/** Payment lifecycle states reported by `GET /payments/:paymentId`. */
export type PaymentStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded'

export type PaymentStatusResponse = {
  rid: Rid
  provider: string
  status: PaymentStatus | string
  amount?: {
    amount: number
    currency: string
  }
  /** Null until the order has been placed against this payment. */
  orderId?: Rid | null
}

export type PlaceOrderResponse = {
  orderId: Rid
  orderReference: string
  estimatedDelivery: string
  status: string
}

export type ApiOrderRecord = {
  id: Rid
  rid?: Rid
  status: 'delivered' | 'processing' | 'shipped'
  statusDateLabel: string
  statusBadgeLabel: string
  itemCount: number
  total: string
  orderTime: string
  productImages: string[]
}

export type OrdersListResponse = {
  orders: ApiOrderRecord[]
  total: number
}

/** A single product line on an order, as returned by `GET /orders/:rid`. */
export type ApiOrderItem = {
  id: Rid
  rid?: Rid
  /** Product this line refers to; the key used to re-add it to the cart. */
  productRid?: Rid
  name: string
  image?: string
  imageUrl?: string
  variant?: string
  quantity: number
  reviewed?: boolean
  unitPrice: Money
}

/** One delivery event on the tracking timeline. */
export type ApiTrackingEvent = {
  id: Rid
  rid?: Rid
  label: string
  description: string
  /** ISO timestamp for when the event occurred. */
  occurredAt: string
}

export type ApiOrderAddress = {
  firstName?: string
  lastName?: string
  phoneCountryCode?: string
  phoneNumber?: string
  addressLine?: string
  cityLine?: string
  city?: string
  region?: string
  country?: string
}

export type ApiOrderDetail = {
  id: Rid
  rid?: Rid
  orderId?: Rid
  orderReference?: string
  status: ApiOrderRecord['status']
  statusDateLabel: string
  statusBadgeLabel: string
  orderTime: string
  itemCount: number
  total: string
  currency?: string
  estimatedDelivery?: string
  paymentMethod?: string
  items: ApiOrderItem[]
  productImages?: string[]
  tracking?: ApiTrackingEvent[]
  returns?: { rid?: Rid; id?: Rid; status?: string; reason?: string; createdAt?: string }[]
  address?: ApiOrderAddress
  shipping?: { method?: string; label?: string; feeMinor?: number }
  totals?: {
    itemsTotal: Money
    itemsDiscount: Money
    shipping: Money
    total: Money
  }
}

/** `GET /orders/:rid/tracking` wraps its events; the order detail nests them. */
export type OrderTrackingResponse = {
  events: ApiTrackingEvent[]
}

/** `GET /orders/buy-again` returns `products`, not the paged `items` shape. */
export type BuyAgainProductsResponse = {
  products: ApiProductCard[]
}

export type CmsPageResponse = {
  rid?: Rid
  slug: string
  title: string
  lastUpdated: string
  intro: string[]
  blocks: PrivacyPolicyBlock[]
}

/** A single typeahead hit. Product suggestions carry a rid so the row can link
 * straight to the product page. */
export type ApiSearchSuggestion = {
  rid?: Rid
  name: string
  image?: string
  imageUrl?: string
}

export type SearchSuggestionsResponse = {
  suggestions: ApiSearchSuggestion[]
}

/* -------------------------------------------------------------------------- */
/* Account & profile                                                          */
/* -------------------------------------------------------------------------- */

/** `GET /users/me/profile` returns the profile and the default address preview. */
export type ApiProfile = {
  fullName: string
  displayName?: string
  email?: string
  /** The API may echo the avatar initials directly. */
  initials?: string
  /** Returned as `null` until the account sets one. */
  phone?: string | null
  rid?: Rid
}

export type ApiDefaultAddress = {
  contactName?: string
  firstName?: string
  lastName?: string
  phone?: string
  phoneCountryCode?: string
  phoneNumber?: string
  line1?: string
  line2?: string
}

export type ProfileResponse = {
  profile: ApiProfile
  defaultAddress?: ApiDefaultAddress
}

/** Addresses are returned as `items` (or a bare array on some deployments). */
export type ApiAddress = {
  id?: Rid
  rid?: Rid
  country?: string
  firstName?: string
  lastName?: string
  phoneCountryCode?: string
  phoneNumber?: string
  addressLine?: string
  region?: string
  city?: string
  cityLine?: string
  isDefault?: boolean
}

export type AddressesResponse = {
  items?: ApiAddress[]
  addresses?: ApiAddress[]
}

export type ApiPaymentMethod = {
  id?: Rid
  rid?: Rid
  type?: string
  network?: string
  cardholderName?: string
  maskedDetail?: string
  isDefault?: boolean
}

export type PaymentMethodsResponse = {
  items?: ApiPaymentMethod[]
  paymentMethods?: ApiPaymentMethod[]
}

/**
 * A pending review slot from `GET /reviews/waiting`, or a past review from
 * `GET /reviews/reviewed`. The list endpoints may wrap the rows under `items`
 * or `reviews`.
 */
export type ApiReviewSlot = {
  id?: Rid
  rid?: Rid
  productName?: string
  productImage?: string
  productImageUrl?: string
  orderId?: string
  orderReference?: string
  deliveredOn?: string
  priceCurrency?: string
  priceAmount?: string
  quantity?: number
  rating?: number
  title?: string
  detailedReview?: string
}

export type ReviewsResponse = {
  items?: ApiReviewSlot[]
  reviews?: ApiReviewSlot[]
}

export type ApiBrowsingHistoryItem = {
  id?: Rid
  rid?: Rid
  productRid?: Rid
  name?: string
  image?: string
  imageUrl?: string
  viewedAt?: string
  section?: string
  sectionLabel?: string
}

export type BrowsingHistoryResponse = {
  sections?: Array<{
    id?: string
    rid?: Rid
    label?: string
    items?: ApiBrowsingHistoryItem[]
  }>
  items?: ApiBrowsingHistoryItem[]
}

export type ApiNotificationSetting = {
  id?: string
  rid?: Rid
  title?: string
  description?: string
  enabled?: boolean
}

export type NotificationSettingsResponse = {
  settings?: ApiNotificationSetting[]
}
