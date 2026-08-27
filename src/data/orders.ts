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
}

export type BuyAgainProduct = {
  id: string
  name: string
  price: string
  image: string
}

const orderProductImage = images.featured.headphones

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
  },
]

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
