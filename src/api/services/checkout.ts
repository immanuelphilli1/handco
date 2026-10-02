import { apiRequest } from '../client'
import type {
  CheckoutPreviewResponse,
  PaymentIntentResponse,
  PaymentStatusResponse,
  PlaceOrderResponse,
} from '../types'

export async function getCheckoutPreview(): Promise<CheckoutPreviewResponse> {
  return apiRequest<CheckoutPreviewResponse>('/checkout/preview')
}

export async function getShippingQuote(addressRid: string): Promise<{
  fee: string
  deliveryWindow: string
  courierLabel?: string
}> {
  return apiRequest<{ fee: string; deliveryWindow: string; courierLabel?: string }>(
    '/checkout/shipping-quote',
    { method: 'POST', body: { addressRid } },
  )
}

/**
 * Creates the payment intent for the current cart.
 *
 * The body is empty by design: the backend picks the provider per currency, the
 * customer email from the authenticated account, and the return/cancel URLs.
 * Auth is required, and no card details are collected here.
 *
 * `paymentRid` and `provider` must be persisted before redirecting to
 * `checkoutUrl`, because the return URL only echoes back the reference.
 */
export async function createPaymentIntent(): Promise<PaymentIntentResponse> {
  return apiRequest<PaymentIntentResponse>('/checkout/payment-intent', {
    method: 'POST',
    body: {},
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
 * Places the order for the selected cart lines.
 *
 * `paymentToken` is the `paymentRid` returned by `createPaymentIntent`; the
 * order records the provider server-side. `paymentMethodId` is no longer sent.
 * The guest cart id accompanies the request so an unauthenticated guest cart can
 * be merged into the order.
 */
export async function placeOrder(input: {
  addressId: string
  cartItemIds: string[]
  paymentToken?: string
}): Promise<PlaceOrderResponse> {
  return apiRequest<PlaceOrderResponse>('/orders', {
    method: 'POST',
    body: input,
    guestCartId: true,
  })
}