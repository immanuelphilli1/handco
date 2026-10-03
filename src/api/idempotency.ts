/**
 * `Idempotency-Key` generation for the order-first checkout endpoints.
 *
 * `POST /orders` and `POST /checkout/payment-intent` both require the header. The
 * key identifies one *user action*, not one HTTP request:
 *
 *  - a retry after a timeout or network error must reuse the key, because the
 *    server cannot know whether the first call succeeded and replaying the stored
 *    response is what prevents a duplicate order;
 *  - a retry after the shopper has reviewed a `price_changed` conflict is a new
 *    decision about a new price, so it must use a fresh key.
 *
 * A session-scoped in-memory key holder covers the first case without persisting
 * anything sensitive to storage: the key is only needed while the page that
 * created it is alive, and a reload already produces a new key.
 */

let currentAttemptKey: string | null = null

function generateKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // Fallback for environments without `crypto.randomUUID`. The header only needs
  // to be unique per attempt, not cryptographically strong.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

/**
 * Returns the key for the current checkout attempt, generating one if needed.
 *
 * Call this once per user action and pass the result to every retry of that same
 * action.
 */
export function getCheckoutAttemptKey(): string {
  currentAttemptKey ??= generateKey()
  return currentAttemptKey
}

/**
 * Discards the current attempt's key so the next call starts a fresh one.
 *
 * Called when an attempt has definitively succeeded, or when the shopper has
 * acknowledged a conflict and is submitting again as a new decision.
 */
export function resetCheckoutAttemptKey(): void {
  currentAttemptKey = null
}