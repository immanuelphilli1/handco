/**
 * What checkout must remember across the provider redirect: the payment it
 * created, plus the address and cart lines to order against once payment
 * succeeds.
 *
 * The provider return URL only carries the payment reference, so the rest is
 * persisted (see `api/pendingPayment.ts`) rather than held in React state, which
 * a full page load to the provider would discard.
 */
export type PendingPayment = {
  paymentRid: string
  provider: string
  addressId: string
  cartItemIds: string[]
}