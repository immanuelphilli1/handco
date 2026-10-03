import { apiRequest } from '../client'
import type {
  CheckoutPreviewResponse,
  Money,
  ApiDeliveryDays,
  PaymentIntentResponse,
  PaymentStatusResponse,
  PlaceOrderResponse,
} from '../types'

export async function getCheckoutPreview(): Promise<CheckoutPreviewResponse> {
  return apiRequest<CheckoutPreviewResponse>('/checkout/preview')
}

/**
 * Shipping quote for a specific saved address.
 *
 * The quote returns structured `feeMoney` and `deliveryDays`; the old `fee` and
 * `deliveryWindow` strings are deprecated, so callers format these themselves.
 */
export async function getShippingQuote(addressRid: string): Promise<{
  feeMoney?: Money
  deliveryDays?: ApiDeliveryDays
  courierLabel?: string
}> {
  return apiRequest<{
    feeMoney?: Money
    deliveryDays?: ApiDeliveryDays
    courierLabel?: string
  }>('/checkout/shipping-quote', { method: 'POST', body: { addressRid } })
}

/**
 * Opens payment for an order created by `placeOrder`.
 *
 * Order-first checkout means this is the *second* step: the order already exists
 * and holds stock, and this opens provider checkout for exactly that order's
 * total. The backend rejects an unknown order (404 `order_not_found`), one that is
 * already paid (409 `order_already_paid`) or no longer payable (409
 * `order_not_payable`, e.g. cancelled after the payment window expired).
 *
 * A failed or abandoned payment leaves the order awaiting payment, so calling
 * this again for the same `orderId` retries it.
 *
 * `paymentRid` and `provider` must be persisted before redirecting to
 * `checkoutUrl`, because the return URL only echoes back the reference.
 */
export async function createPaymentIntent(
  orderId: string,
  idempotencyKey: string,
): Promise<PaymentIntentResponse> {
  return apiRequest<PaymentIntentResponse>('/checkout/payment-intent', {
    method: 'POST',
    body: { orderId },
    idempotencyKey,
  })
}

/**
 * Authoritative payment state. The provider redirect is UX only — this endpoint
 * (plus webhooks) is the source of truth, so it is what the return page polls.
 *
 * Owner-scoped: a 404 means either an unknown rid or one belonging to another
 * user, which are deliberately indistinguishable.
 */
export async function getPaymentStatus(paymentRid: string): Promise<PaymentStatusResponse> {
  return apiRequest<PaymentStatusResponse>(`/payments/${paymentRid}`)
}

/**
 * Creates the order for the selected cart lines. This is the *first* step of
 * order-first checkout.
 *
 * The order is created awaiting payment with totals fixed at current prices and
 * stock held; the ordered lines leave the cart immediately. Payment is opened
 * afterwards with `createPaymentIntent(orderId)`.
 *
 * `paymentToken` is gone: the order no longer attaches to a pre-existing
 * payment. Instead an `Idempotency-Key` is required, and the caller must reuse
 * the same key when retrying the *same* attempt (a timeout is ambiguous and a
 * retry without the key could create a duplicate order). A retry after the
 * shopper has reviewed a `price_changed` conflict is a new decision and needs a
 * new key.
 *
 * The guest cart id accompanies the request so an unauthenticated guest cart can
 * be merged into the order.
 */
export async function placeOrder(
  input: {
    addressId: string
    cartItemIds: string[]
  },
  idempotencyKey: string,
): Promise<PlaceOrderResponse> {
  return apiRequest<PlaceOrderResponse>('/orders', {
    method: 'POST',
    body: input,
    guestCartId: true,
    idempotencyKey,
  })
}