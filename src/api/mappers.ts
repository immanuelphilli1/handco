import type { SidebarCategoryId } from '../data/categoriesModal'
import type { CartItem } from '../data/cart'
import type { AddressRecord } from '../data/addresses'
import type { BrowsingHistorySection } from '../data/browsingHistory'
import { defaultNotificationSettings } from '../data/notifications'
import type { NotificationSetting, NotificationSettingId } from '../data/notifications'
import { getProfileInitials } from '../data/profile'
import type { DefaultAddress, UserProfile } from '../data/profile'
import type { PaymentMethodRecord, PaymentMethodType } from '../data/paymentMethods'
import type { WaitingReviewRecord } from '../data/reviews'
import type { OrderLine, OrderRecord, OrderTrackingEvent } from '../data/orders'
import type { Product } from '../data/products'
import type { ProductDetail, ProductDetailContext } from '../data/productDetail'
import type { CategoryListingSelection } from '../data/categoryListing'
import { getCategoryLabel, getSubcategoryOptions } from '../data/catalogCategories'
import { getApiOrigin } from './config'
import type {
  AddressesResponse,
  ApiAddress,
  ApiBrowsingHistoryItem,
  ApiCartItem,
  ApiCategory,
  ApiDefaultAddress,
  ApiNotificationSetting,
  ApiOrderDetail,
  ApiOrderRecord,
  ApiPaymentMethod,
  ApiProductCard,
  ApiProductDetailResponse,
  ApiProductReview,
  ApiProfile,
  ApiReviewSlot,
  BrowsingHistoryResponse,
  CartSummary,
  Money,
  NotificationSettingsResponse,
  OrderTrackingResponse,
  PaymentMethodsResponse,
  ReviewsResponse,
} from './types'

export function resolveAssetUrl(path: string | undefined): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const origin = getApiOrigin()
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

export function formatMoney(money: Money): string {
  return `${money.currency} ${money.amount.toFixed(2)}`
}

export function mapApiProduct(product: ApiProductCard): Product {
  return {
    id: product.rid ?? product.id,
    categoryId: product.categoryId as SidebarCategoryId,
    subcategory: product.subcategory,
    image: resolveAssetUrl(product.image),
    tag: product.tag,
    category: product.category,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    discount: product.discount,
    delivery: product.delivery,
    rating: product.rating,
    liked: product.liked ?? undefined,
    showAddButton: product.showAddButton,
    priceOrange: product.priceOrange,
    imageObjectPosition: product.imageObjectPosition,
    // Facets power the listing filters, so they are carried onto the domain
    // model rather than being dropped during mapping.
    priceAmount: product.priceMoney?.amount,
    brand: product.brand,
    color: product.color,
    screenSize: product.screenSize,
  }
}

export function mapApiCartItem(item: ApiCartItem): CartItem {
  return {
    id: item.rid ?? item.id,
    productRid: item.productRid,
    name: item.name,
    variant: item.variant,
    image: resolveAssetUrl(item.image),
    currency: item.currency,
    price: item.price,
    quantity: item.quantity,
    selected: item.selected,
  }
}

export function mapApiOrder(order: ApiOrderRecord): OrderRecord {
  return {
    id: order.rid ?? order.id,
    status: order.status,
    statusDateLabel: order.statusDateLabel,
    statusBadgeLabel: order.statusBadgeLabel,
    itemCount: order.itemCount,
    total: order.total,
    orderTime: order.orderTime,
    productImages: order.productImages.map(resolveAssetUrl),
  }
}

/**
 * Order lines from `GET /orders/:rid`. The list endpoint returns only product
 * images, so the lines that drive Buy Again and the tracker come from the
 * detail call and are merged onto the record by id.
 */
export function mapApiOrderLines(order: ApiOrderDetail): OrderLine[] {
  return order.items.map((item) => ({
    productId: item.productRid ?? item.id,
    name: item.name,
    image: resolveAssetUrl(item.imageUrl ?? item.image),
    price: formatMoney(item.unitPrice),
    quantity: item.quantity,
  }))
}

/**
 * Tracking events from `GET /orders/:rid/tracking`, or the copy embedded in the
 * order detail when only that has been fetched. Events arrive oldest-first.
 */
export function mapApiOrderTracking(
  tracking: OrderTrackingResponse | ApiOrderDetail,
): OrderTrackingEvent[] {
  const events = 'events' in tracking ? tracking.events : (tracking.tracking ?? [])

  return events.map((event) => ({
    id: event.rid ?? event.id,
    label: event.label,
    description: event.description,
    occurredAt: event.occurredAt,
  }))
}

export function mapApiProductDetail(
  response: ApiProductDetailResponse,
  selection: CategoryListingSelection,
): ProductDetailContext {
  const product = mapApiProduct(response.product)
  const detail: ProductDetail = {
    product,
    images: response.images.map(resolveAssetUrl),
    ratingValue: response.ratingValue,
    reviewCount: response.reviewCount,
    soldCount: response.soldCount,
    priceAmount: response.priceAmount,
    priceCurrency: response.priceCurrency,
    discountNotice: response.discountNotice ?? 'Get 10% off on your first order',
    modelOptions: response.modelOptions,
    descriptionLines: response.descriptionLines ?? [
      `${product.name} with premium build quality and smart features.`,
      'Premium build quality with manufacturer warranty',
      'Genuine product — all items verified authentic',
      'Easy 30-day return policy',
    ],
    reviews: [],
    shippingAddress: {
      line1: 'Hse 8 M Street',
      line2: 'Accra Ghana',
    },
    shippingFee: response.shippingFee ?? product.price,
    deliveryEstimate: response.deliveryEstimate ?? '2-5 business days',
    itemsTotal: `${response.priceCurrency} ${response.priceAmount}`,
    subtotal: `${response.priceCurrency} ${response.priceAmount}`,
  }

  return { detail, selection }
}

export function buildSelectionForProduct(
  product: Product,
  from?: string | null,
  categoryId?: string | null,
  subcategory?: string | null,
  apiCategories: ApiCategory[] = [],
): CategoryListingSelection {
  if (from === 'wishlist') {
    return {
      categoryId: 'featured',
      categoryLabel: 'Wishlist',
      subcategoryLabel: 'Liked items',
      subcategoryOptions: [],
    }
  }

  if (from === 'featured') {
    return {
      categoryId: 'featured',
      categoryLabel: 'Featured items',
      subcategoryLabel: 'Featured',
      subcategoryOptions: [],
    }
  }

  if (from === 'home') {
    return {
      categoryId: 'featured',
      categoryLabel: 'New Arrivals',
      subcategoryLabel: 'Featured',
      subcategoryOptions: [],
    }
  }

  if (categoryId && subcategory) {
    return {
      categoryId: categoryId as SidebarCategoryId,
      categoryLabel: getCategoryLabel(categoryId as SidebarCategoryId, apiCategories),
      subcategoryLabel: subcategory,
      subcategoryOptions: getSubcategoryOptions(categoryId as SidebarCategoryId, apiCategories),
    }
  }

  return {
    categoryId: product.categoryId,
    categoryLabel: getCategoryLabel(product.categoryId, apiCategories),
    subcategoryLabel: product.subcategory,
    subcategoryOptions: getSubcategoryOptions(product.categoryId, apiCategories),
  }
}

export function mapApiReviews(reviews: ApiProductReview[]) {
  return reviews
}

export function mapCartSummaryToDisplay(summary: CartSummary) {
  return {
    itemsTotal: formatMoney(summary.itemsTotal),
    itemsDiscount: formatMoney(summary.itemsDiscount),
    subtotal: formatMoney(summary.subtotal),
    shipping: formatMoney(summary.shipping),
    total: formatMoney(summary.total),
  }
}

/* -------------------------------------------------------------------------- */
/* Account & profile                                                          */
/* -------------------------------------------------------------------------- */

/** Stable client key for an address; the mutations address it by this rid. */
export function getApiAddressId(address: ApiAddress): string {
  return address.rid ?? address.id ?? ''
}

export function mapApiAddress(address: ApiAddress): AddressRecord {
  const firstName = address.firstName ?? ''
  const lastName = address.lastName ?? ''
  const city = address.city ?? ''
  const region = address.region ?? ''
  const country = address.country ?? ''

  // The API only guarantees the individual parts, but the cards read a single
  // "city line", so compose one and fall back to whatever is available.
  const composedCityLine = [city, region, country].filter(Boolean).join(', ').trim()
  const cityLine = address.cityLine ?? (composedCityLine || '—')

  return {
    id: getApiAddressId(address),
    country,
    firstName,
    lastName,
    phoneCountryCode: address.phoneCountryCode ?? '',
    phoneNumber: address.phoneNumber ?? '',
    addressLine: address.addressLine ?? '',
    region,
    city,
    cityLine,
    isDefault: address.isDefault ?? false,
  }
}

/** Addresses may arrive as a bare array, or under `items`/`addresses`. */
export function mapApiAddresses(response: AddressesResponse | ApiAddress[]): AddressRecord[] {
  const source = Array.isArray(response) ? response : (response.items ?? response.addresses ?? [])
  return source.filter((address) => getApiAddressId(address) !== '').map(mapApiAddress)
}

export function getApiPaymentMethodId(payment: ApiPaymentMethod): string {
  return payment.rid ?? payment.id ?? ''
}

/** Card/mobile-money network ids are lowercase; the UI's union is not. */
export function mapApiPaymentMethodType(
  type: string | undefined,
  network: string | undefined,
): PaymentMethodType {
  const raw = (type ?? network ?? '').toLowerCase()

  if (raw.includes('paypal')) return 'paypal'
  if (raw.includes('money') || raw.includes('mtn') || raw.includes('vodafone')) {
    return 'mobile_money'
  }
  if (raw.includes('visa') || raw.includes('master') || raw.includes('card')) return 'visa'

  return 'visa'
}

export function mapApiPaymentMethod(payment: ApiPaymentMethod): PaymentMethodRecord {
  return {
    id: getApiPaymentMethodId(payment),
    cardholderName: payment.cardholderName ?? '',
    type: mapApiPaymentMethodType(payment.type, payment.network),
    maskedDetail: payment.maskedDetail ?? '',
    network: payment.network,
    isDefault: payment.isDefault ?? false,
  }
}

export function mapApiPaymentMethods(
  response: PaymentMethodsResponse | ApiPaymentMethod[],
): PaymentMethodRecord[] {
  const source = Array.isArray(response)
    ? response
    : (response.items ?? response.paymentMethods ?? [])
  return source
    .filter((payment) => getApiPaymentMethodId(payment) !== '')
    .map(mapApiPaymentMethod)
}

export function mapApiProfile(profile: ApiProfile): UserProfile {
  const fullName = profile.fullName ?? profile.displayName ?? ''
  return {
    fullName,
    email: profile.email ?? '',
    initials: profile.initials ?? getProfileInitials(fullName),
  }
}

export function mapApiDefaultAddress(address?: ApiDefaultAddress): DefaultAddress {
  const contactName =
    address?.contactName ??
    [address?.firstName, address?.lastName].filter(Boolean).join(' ').trim()

  const phone =
    address?.phone ??
    [address?.phoneCountryCode, address?.phoneNumber].filter(Boolean).join(' ').trim()

  return {
    contactName,
    phone,
    line1: address?.line1 ?? '',
    line2: address?.line2 ?? '',
  }
}

/**
 * Reshapes an entry from the addresses list into the profile's preview shape.
 *
 * The profile shows the account's default address, which is the same record the
 * Addresses tab lists and marks with `isDefault`. `mapApiDefaultAddress` cannot
 * be reused directly because the two endpoints spell their fields differently:
 * the list returns `addressLine` plus `city`/`region`/`country`, while the
 * profile preview expects two composed `line1`/`line2` strings.
 */
export function addressRecordToDefaultPreview(address: AddressRecord): DefaultAddress {
  const contactName = [address.firstName, address.lastName].filter(Boolean).join(' ').trim()
  const phone = [address.phoneCountryCode, address.phoneNumber].filter(Boolean).join(' ').trim()

  const cityParts = [address.city, address.region, address.country].filter(Boolean)

  return {
    contactName,
    phone,
    line1: address.addressLine,
    // `cityLine` is already composed as "city, region, country" by the mapper.
    line2: address.cityLine ?? cityParts.join(', '),
  }
}

export function mapApiReviewSlot(slot: ApiReviewSlot): WaitingReviewRecord {
  return {
    id: slot.rid ?? slot.id ?? '',
    productName: slot.productName ?? '',
    productImage: resolveAssetUrl(slot.productImageUrl ?? slot.productImage),
    orderId: slot.orderReference ?? slot.orderId ?? '',
    deliveredOn: slot.deliveredOn ?? '',
    priceCurrency: slot.priceCurrency ?? '',
    priceAmount: slot.priceAmount ?? '',
    quantity: slot.quantity ?? 1,
  }
}

/**
 * `GET /reviews/waiting` and `GET /reviews/reviewed` wrap their rows under
 * `items` or `reviews`; the flow scripts probe both.
 */
export function mapApiReviewSlots(response: ReviewsResponse): WaitingReviewRecord[] {
  const source = response.items ?? response.reviews ?? []
  return source.filter((slot) => (slot.rid ?? slot.id ?? '') !== '').map(mapApiReviewSlot)
}

/**
 * Browsing history rows carry only what the card needs (id, name, image), so a
 * minimal `Product` is built for them. `delivery` and `rating` are required by
 * the `Product` type but unused on the history card, so they get neutral values.
 */
function mapApiHistoryProduct(item: ApiBrowsingHistoryItem, fallbackId: string): Product {
  return {
    id: item.productRid ?? item.rid ?? item.id ?? fallbackId,
    categoryId: 'featured',
    subcategory: '',
    image: resolveAssetUrl(item.imageUrl ?? item.image),
    tag: '',
    category: 'Recently viewed',
    name: item.name ?? '',
    price: '',
    delivery: '',
    rating: '',
  }
}

/**
 * Browsing history arrives either grouped into sections or as a flat list. A
 * flat list is grouped by its `viewedAt` day so the panel keeps its sections.
 */
export function mapApiBrowsingHistory(
  response: BrowsingHistoryResponse,
): BrowsingHistorySection[] {
  if (response.sections) {
    return response.sections
      .map((section) => ({
        id: section.id ?? section.rid ?? section.label ?? '',
        label: section.label ?? 'Recently viewed',
        items: (section.items ?? []).map((item, index) => ({
          id: item.rid ?? item.id ?? `${section.id ?? 'item'}-${index}`,
          product: mapApiHistoryProduct(item, `${section.id ?? 'item'}-${index}`),
        })),
      }))
      .filter((section) => section.items.length > 0)
  }

  const items = response.items ?? []
  if (items.length === 0) return []

  const today = new Date().toISOString().slice(0, 10)
  const grouped = new Map<string, BrowsingHistorySection>()

  for (const [index, item] of items.entries()) {
    const viewedAt = item.viewedAt ?? ''
    const day = viewedAt ? viewedAt.slice(0, 10) : today
    const isToday = day === today
    const label = isToday
      ? 'Today'
      : new Date(day).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })

    const key = isToday ? 'today' : day
    const section = grouped.get(key) ?? { id: key, label, items: [] }

    section.items.push({
      id: item.rid ?? item.id ?? `history-${index}`,
      product: mapApiHistoryProduct(item, `history-${index}`),
    })
    grouped.set(key, section)
  }

  return [...grouped.values()]
}

export function mapApiNotificationSettings(
  response: NotificationSettingsResponse | ApiNotificationSetting[],
): NotificationSetting[] {
  const source = Array.isArray(response) ? response : (response.settings ?? [])
  const defaults = new Map(defaultNotificationSettings.map((item) => [item.id, item]))

  return source.map((setting, index) => {
    const id = (setting.id ?? setting.rid ?? '') as NotificationSettingId
    const fallback = defaults.get(id) ?? defaultNotificationSettings[index % defaultNotificationSettings.length]

    return {
      id: id in defaults ? id : fallback.id,
      title: setting.title ?? fallback.title,
      description: setting.description ?? fallback.description,
      enabled: setting.enabled ?? fallback.enabled,
    }
  })
}

