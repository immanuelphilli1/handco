import { images } from '../assets/images'

export type OrderStatus = 'delivered' | 'processing' | 'shipped'

export type OrderFilter = 'all' | OrderStatus | 'returns'

export type OrderRecord = {
  id: string
  status: OrderStatus
  statusDateLabel: string
  statusBadgeLabel: string
  itemCount: number
  total: string
  orderTime: string
  productImages: string[]
  /** Lines the order was placed for, used by Buy Again and the tracker. */
  lines?: OrderLine[]
}

/**
 * A single product line inside an order. The product id is what makes Buy Again
 * and Add to cart work, since the cart is keyed by product rid rather than name.
 */
export type OrderLine = {
  productId: string
  name: string
  image: string
  price: string
  quantity: number
}

/**
 * One delivery event from `GET /orders/:rid/tracking`. The API owns these labels
 * and timestamps, so the timeline renders whatever the server reports rather
 * than a client-side guess.
 */
export type OrderTrackingEvent = {
  id: string
  label: string
  description: string
  /** ISO timestamp of when the event occurred. */
  occurredAt: string
}

/**
 * Fallback stages used only when tracking has not loaded (or the request
 * failed), so the modal still shows a sensible journey instead of an empty box.
 */
export type OrderTrackingStage = {
  key: string
  label: string
  description: string
}

export type BuyAgainProduct = {
  id: string
  name: string
  price: string
  image: string
}

const orderProductImage = images.featured.headphones

/**
 * Product ids match the local catalog so Buy Again can look the line up as a
 * real `Product` and hand it to the cart. The API replaces these when it sends
 * its own order payloads.
 */
const sampleOrderLines: OrderLine[] = [
  {
    productId: 'o0uf6x5aznwk',
    name: 'Apple AirPods Pro (2nd Gen)',
    image: orderProductImage,
    price: 'AED 899.00',
    quantity: 1,
  },
  {
    productId: 'opdbhq3dvxzy',
    name: 'Sony WH-1000XM5 Headphones',
    image: orderProductImage,
    price: 'AED 1299.00',
    quantity: 1,
  },
]

export const orderFilterTabs: { id: OrderFilter; label: string }[] = [
  { id: 'all', label: 'All Orders' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'returns', label: 'Returns' },
]

export const orders: OrderRecord[] = [
  {
    id: 'PO-077-08907616420471803',
    status: 'delivered',
    statusDateLabel: 'Delivered on Jul 7, 2026',
    statusBadgeLabel: 'Delivered on time',
    itemCount: 15,
    total: 'AED 253.90',
    orderTime: 'Jun 19, 2025',
    productImages: [orderProductImage, orderProductImage, orderProductImage, orderProductImage],
    lines: sampleOrderLines,
  },
  {
    id: 'PO-077-08907616420471804',
    status: 'processing',
    statusDateLabel: 'Delivered on Jul 7, 2026',
    statusBadgeLabel: 'Processing Order',
    itemCount: 15,
    total: 'AED 253.90',
    orderTime: 'Jun 19, 2025',
    productImages: [orderProductImage, orderProductImage, orderProductImage, orderProductImage],
    lines: sampleOrderLines,
  },
  {
    id: 'PO-077-08907616420471805',
    status: 'shipped',
    statusDateLabel: 'Delivered on Jul 7, 2026',
    statusBadgeLabel: 'Order Shipped',
    itemCount: 15,
    total: 'AED 253.90',
    orderTime: 'Jun 19, 2025',
    productImages: [orderProductImage, orderProductImage, orderProductImage, orderProductImage],
    lines: sampleOrderLines,
  },
]

export const orderTrackingStages: OrderTrackingStage[] = [
  {
    key: 'placed',
    label: 'Order placed',
    description: 'We have received your order and payment is confirmed.',
  },
  {
    key: 'processing',
    label: 'Processing',
    description: 'Your items are being packed and prepared for dispatch.',
  },
  {
    key: 'shipped',
    label: 'Shipped',
    description: 'Your parcel is on its way with our courier partner.',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Your parcel has been delivered. We hope you love it.',
  },
]

/**
 * How far along the journey each status sits. An order is treated as complete
 * through the stage matching its own status, which is how the tracker decides
 * which steps to tick off.
 */
export function getReachedStageCount(status: OrderStatus): number {
  const stageIndex = orderTrackingStages.findIndex((stage) => stage.key === status)
  return stageIndex === -1 ? 1 : stageIndex + 1
}

/**
 * Reasons offered when requesting a return. These are posted verbatim as the
 * return `reason`, so they are worded for the support team that reads them.
 */
export const returnReasons = [
  'Item arrived damaged or faulty',
  'Wrong item was delivered',
  'Item does not match the description',
  'No longer needed',
  'Changed my mind',
  'Other',
]

/** Copy for the return request dialog and its submitted state. */
export const refundCopy = {
  description:
    'Tell us why you are returning this order. Our team will review your request and contact you about the next steps.',
  submitLabel: 'Submit return request',
  policyLabel: 'Read our Return & Refund Policy',
  submitError: 'We could not submit your return request. Please try again.',
  successTitle: 'Return request received',
  successDescription:
    'Our team will review your request and get back to you shortly. Once approved, we will arrange the refund.',
}

export const buyAgainProducts: BuyAgainProduct[] = [
  {
    id: 'buy-again-1',
    name: 'Monolith Bluetooth S...',
    price: '$179.00',
    image: images.featured.speaker,
  },
  {
    id: 'buy-again-2',
    name: 'Monolith Bluetooth S...',
    price: '$179.00',
    image: images.featured.speaker,
  },
]

export function filterOrders(activeFilter: OrderFilter): OrderRecord[] {
  if (activeFilter === 'all') return orders
  if (activeFilter === 'returns') return []
  return orders.filter((order) => order.status === activeFilter)
}

/**
 * Flattens every order line into a repurchase list, most recent order first and
 * de-duplicated by product. This is what "Buy this again" shows, so the sidebar
 * only ever advertises something the customer has actually bought.
 */
export function getBuyAgainProductsFromOrders(sourceOrders: OrderRecord[]): BuyAgainProduct[] {
  const seen = new Set<string>()
  const result: BuyAgainProduct[] = []

  for (const order of sourceOrders) {
    for (const line of order.lines ?? []) {
      if (seen.has(line.productId)) continue
      seen.add(line.productId)
      result.push({
        id: line.productId,
        name: line.name,
        price: line.price,
        image: line.image,
      })
    }
  }

  return result
}

export function getOrdersEmptyStateMessage(
  activeFilter: OrderFilter,
  hasSearchQuery: boolean,
): string {
  if (hasSearchQuery) {
    return 'No orders match your search'
  }

  switch (activeFilter) {
    case 'all':
      return "You don't have any orders"
    case 'processing':
      return "You don't have any processing orders"
    case 'shipped':
      return "You don't have any shipped orders"
    case 'delivered':
      return "You don't have any delivered orders"
    case 'returns':
      return "You don't have any orders to return"
    default: {
      const exhaustiveCheck: never = activeFilter
      return exhaustiveCheck
    }
  }
}
