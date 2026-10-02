import { apiRequest } from '../client'
import type {
  BuyAgainProductsResponse,
  CartResponse,
  OrderTrackingResponse,
  OrdersListResponse,
  ApiOrderDetail,
} from '../types'

export async function listOrders(params: {
  status?: string
  search?: string
  page?: number
  limit?: number
} = {}): Promise<OrdersListResponse> {
  return apiRequest<OrdersListResponse>('/orders', { searchParams: params })
}

export async function getOrder(orderRid: string): Promise<ApiOrderDetail> {
  return apiRequest<ApiOrderDetail>(`/orders/${orderRid}`)
}

export async function getOrderTracking(orderRid: string): Promise<OrderTrackingResponse> {
  return apiRequest<OrderTrackingResponse>(`/orders/${orderRid}/tracking`)
}

/**
 * Re-adds every line of the order back to the cart, server-side. Returns the
 * resulting cart so the caller can apply it directly — the response also carries
 * a fresh `X-Cart-Id`, which the API client has already persisted.
 */
export async function buyAgainOrder(orderRid: string): Promise<CartResponse> {
  return apiRequest<CartResponse>(`/orders/${orderRid}/buy-again`, {
    method: 'POST',
    body: {},
  })
}

/**
 * Suggested repurchase products. Note this endpoint returns a `products` array
 * rather than the paged `items` shape used elsewhere in the catalog API.
 */
export async function getBuyAgainProducts(): Promise<BuyAgainProductsResponse> {
  return apiRequest<BuyAgainProductsResponse>('/orders/buy-again')
}

export async function returnOrder(orderRid: string, reason: string): Promise<void> {
  await apiRequest<void>(`/orders/${orderRid}/return`, {
    method: 'POST',
    body: { reason },
  })
}