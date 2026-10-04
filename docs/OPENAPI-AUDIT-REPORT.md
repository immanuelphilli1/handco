# Frontend ↔ OpenAPI Contract Audit

**Spec audited:** `docs/backend-docs/openapi.yaml` (OpenAPI 3.0.3, 79 path items)
**Code audited:** `src/api/**` (client, config, 9 service modules, `types.ts`, `mappers.ts`)
**Date:** 2026-10-04

## Verdict

The integration is in good shape structurally: every request body the client
sends matches the spec's field names, the `rid`-based identifier convention is
respected in all path params, and error handling branches on `error.code`
rather than message text as the spec requires.

Nine real defects were found. Four are silent — the request goes out, the server
answers, and the client reads a field that is not on the wire, so the UI shows
empty or `undefined` with no error. Two would fail validation outright.

---

## Method

Base URL is `https://handco.craftsmanjohn.com/api/v1` (`src/api/config.ts`), so
spec paths `/v1/...` are called as `/...`. Every `apiRequest` call was extracted
and compared against the spec's method, path, path/query parameters, request
body schema, and response schema. Response types in `types.ts` were then compared
field-by-field against the `components/schemas` they reference, and mapper
consumption was checked for each field flagged as divergent.

## Severity summary

| # | Severity | Area | Defect |
|---|---|---|---|
| 1 | High — silent | Checkout | `PlaceOrderResponse.total` should be `totalMoney` |
| 2 | High — fails | Account | `deleteBrowsingHistory` sends `rids`, spec requires `ids` |
| 3 | High — fails | Content | `submitQuotation` sends `details`, spec requires `name` |
| 4 | Medium — silent | Catalog | Delivery facet reads `maxDays`, spec sends `deliveryDays` |
| 5 | Medium — silent | Payments | `getPaymentNetworks` typed `string[]`, spec returns objects |
| 6 | Medium — silent | Wishlist | `getWishlistCategories` typed `string[]`, spec returns objects |
| 7 | Low — silent | Orders | `returnOrder` typed `void`, spec returns a body |
| 8 | Low — waste | Catalog | `page`/`limit` sent to endpoints that accept neither |
| 9 | Low — gap | Account | `avatar` accepted by profile PATCH, never sent |

---

## 1. `PlaceOrderResponse.total` — field does not exist (silent)

**Severity: High.** Silent: `total` is declared as required on the frontend type
but the API never sends it, so it reads `undefined` on every successful order.

Spec, `POST /v1/orders` 201:

```yaml
1097|                required: [orderId, orderReference, estimatedDelivery, status, paymentStatus, totalMoney]
1105|                  totalMoney: { $ref: '#/components/schemas/Money' }
```

```385:393:src/api/types.ts
export type PlaceOrderResponse = {
  orderId: Rid
  orderReference: string
  estimatedDelivery: string
  status: ApiOrderStatus
  paymentStatus: ApiOrderPaymentStatus
  total: Money
}
```

The rest of the API is consistent about `*Money` naming, and `OrderRecord`
(the order-list schema) also uses `totalMoney` — so this is a genuine field-name
mistake, not an intentional alias.

**Currently latent:** the only call site reads `orderId`, `orderReference`, and
`estimatedDelivery`, all of which are correct. Nothing renders `order.total` from
this response today, so no user-visible breakage yet — but the type promises a
field that cannot arrive, and the next feature that trusts it will render
nothing.

**Fix:** rename to `totalMoney: Money`. Note this type also drops `total` from
`PlaceOrderResponse` while `YourOrdersView`/`OrderTrackingModal` read
`order.total` — those come from the order *detail/list* mappers, a different
path, and are fine.

---

## 2. `deleteBrowsingHistory` sends the wrong body key (fails)

**Severity: High.** This is a hard failure: the body key does not match, so the
request fails validation and history cannot be deleted.

```233:237:src/api/services/account.ts
export async function deleteBrowsingHistory(rids: string[]): Promise<void> {
  await apiRequest('/browsing-history', { method: 'DELETE', body: { rids } })
}
```

Spec requires `ids`:

```83:90:docs/backend-docs/openapi.yaml
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [ids]
              properties:
                ids:
                  type: array
                  minItems: 1
```

The spec is explicit that `ids` are "History entry rids", and `BrowsingHistoryItem.rid`
is that field — so the client has the right values under the wrong key. The
caller at `BrowsingHistoryPanel.tsx:384` builds `serverRids` correctly.

**Fix:** `body: { ids: rids }`. Rename the parameter to `ids` for clarity, and
align with the spec's `minItems: 1` — an empty array should be skipped client-side.

---

## 3. `submitQuotation` sends `details`, spec requires `name` (fails)

**Severity: High.** `name` is required and absent, so every quotation request
fails with `422 validation_error`.

```34:41:src/api/services/forms.ts
export async function submitQuotation(input: { email: string; details: string }): Promise<void> {
  await apiRequest('/quotations', {
    method: 'POST',
    body: input,
    auth: false,
    cart: false,
  })
}
```

Spec requires `email` **and** `name`:

```1524:1534:docs/backend-docs/openapi.yaml
              type: object
              required: [email, name]
              properties:
                email: { type: string, format: email, maxLength: 255 }
                name: { type: string, maxLength: 120 }
                company: { type: string, maxLength: 160 }
                phone: { type: string, maxLength: 40 }
                message: { type: string, maxLength: 5000 }
                productIds:
```

`details` is not a spec field at all. The spec's free-text field is `message`.

**Fix:** `{ email, name, message }`. This requires a product decision — the
current signature has no `name`, so either add a name input or use a sensible
placeholder. Not auto-fixable without knowing the intended UX.

**Related, same root cause:** `submitAgentRequest` sends `{ email, message }` but
`/v1/support/agent-requests` also requires `name`. Same latent `422`. Neither
function is called anywhere in the app today (only `subscribeNewsletter` is
wired up, in `Footer.tsx:204`), which is why this has not surfaced.

---

## 4. Delivery facet reads the wrong key (silent)

**Severity: Medium.** Silent: the array reads `undefined`, the `??` guard makes it
empty, and the "delivery within N days" filter options silently vanish from the
filter panel. Free-delivery counting still works because `freeCount` matches.

Spec, `ProductListing.facets.delivery`:

```3180:3190:docs/backend-docs/openapi.yaml
            delivery:
              type: object
              nullable: true
              required: [freeCount, deliveryDays]
              properties:
                freeCount: { type: integer }
                deliveryDays:
                  type: array
                  items: { type: integer }
                  description: Distinct upper delivery-day cut-offs present in this listing; build the maxDeliveryDays filter options from it.
```

The client reads `maxDays`:

```98:99:src/api/mappers.ts
  const maxDays = [...new Set(delivery.maxDays ?? [])].sort((a, b) => a - b)
  for (const days of maxDays) {
```

and the type declares it:

```136:139:src/api/types.ts
export type ApiDeliveryFacet = {
  freeCount: number
  maxDays: number[]
}
```

The spec's wording is unusually explicit — "build the maxDeliveryDays filter
options from it" — which reads like it was written to correct exactly this
mismatch. The `maxDeliveryDays` *query* param name is what likely misled the
implementation into naming the response field `maxDays` too.

**Impact:** only when a destination country is known, since `delivery` is null
otherwise. So the filter section hides correctly for guests, and quietly loses
its day options for signed-in shoppers with a saved address.

**Fix:** rename to `deliveryDays` in `ApiDeliveryFacet` and in
`buildDeliveryOptions`. Also update the doc comment at `mappers.ts:137` which
describes the wire format as `{ freeCount, maxDays }`.

---

## 5. `getPaymentNetworks` typed `string[]` (silent)

**Severity: Medium.** The function returns objects typed as strings, so any
caller would get `{id, label}` objects where strings were promised.

```197:202:src/api/services/account.ts
export async function getPaymentNetworks(): Promise<string[]> {
  const response = await apiRequest<{ networks?: string[]; items?: string[] }>(
    '/payment-methods/networks',
    { auth: false, cart: false },
  )
  return response.networks ?? response.items ?? []
}
```

Spec returns objects:

```1360:1372:docs/backend-docs/openapi.yaml
  /v1/payment-methods/networks:
    get:
      ...
              schema:
                type: object
                required: [networks]
                properties:
                  networks:
                    type: array
                    items:
                      type: object
                      required: [id, label]
                      properties:
                        id: { type: string, example: mtn }
                        label: { type: string, example: MTN }
```

The spec's own conventions section flags this: the mobile-money network `id`
("mtn, vodafone_cash, ...") is one of the documented non-rid `id` fields — it is
a stable key, not a resource identifier, so `rid` is correctly absent.

**Fix:** return `{ id: string; label: string }[]`. `items` is not in the spec, so
the fallback should go; the `?? []` guard is enough.

**Currently latent:** no caller exists.

---

## 6. `getWishlistCategories` typed `string[]` (silent)

**Severity: Medium.** Same shape of mistake as #5.

```11:13:src/api/services/wishlist.ts
export async function getWishlistCategories(): Promise<{ categories: string[] }> {
  return apiRequest<{ categories: string[] }>('/wishlist/categories')
}
```

Spec returns objects:

```1618:1631:docs/backend-docs/openapi.yaml
  /v1/wishlist/categories:
    get:
      ...
                type: object
                required: [categories]
                properties:
                  categories:
                    type: array
                    items:
                      type: object
                      required: [rid, slug, label]
                      properties:
                        rid: { type: string }
                        slug: { type: string }
                        label: { type: string }
```

**Fix:** `{ categories: Array<{ rid: string; slug: string; label: string }> }`.
Callers should filter on `slug` (the field the spec marks as present, and the
one `GET /wishlist?category=` expects), not the object identity.

**Currently latent:** no caller exists — wishlist category filtering is not yet
wired up in the UI.

---

## 7. `returnOrder` discards a response body (low)

**Severity: Low.** Not a bug today, but the spec returns a meaningful body that
the client throws away, so it cannot show a return reference or status.

```48:53:src/api/services/orders.ts
export async function returnOrder(orderRid: string, reason: string): Promise<void> {
  await apiRequest<void>(`/orders/${orderRid}/return`, {
    method: 'POST',
    body: { reason },
  })
}
```

Spec returns `201` with:

```1271:1281:docs/backend-docs/openapi.yaml
                type: object
                required: [success, returnId, rid, status]
                properties:
                  success: { type: boolean, example: true }
                  returnId: { type: string }
                  rid: { type: string }
                  status: { type: string, example: requested }
```

Note this endpoint takes **no** `X-Cart-Id`/`CartId` parameter in the spec, and
the client correctly does not force one.

**Fix:** return a typed `{ success: boolean; returnId: string; rid: string; status: string }`
so the UI can confirm with the actual reference.

---

## 8. `page`/`limit` sent to endpoints that accept neither (low)

**Severity: Low.** Wasteful, and quietly misleading — these suggest the endpoints
paginate when they do not.

`GET /v1/reviews/waiting` and `GET /v1/reviews/reviewed` declare **no** query
parameters at all, yet:

```205:211:src/api/services/account.ts
export async function getWaitingReviews(page = 1, limit = 3): Promise<ReviewsResponse> {
  return apiRequest('/reviews/waiting', { searchParams: { page, limit } })
}

export async function getReviewedReviews(page = 1, limit = 4): Promise<ReviewsResponse> {
  return apiRequest('/reviews/reviewed', { searchParams: { page, limit } })
}
```

Both responses are `{ items: [...] }` with no `total`, `page`, or `limit`. The
client-side `limit` parameter does nothing; the caller must truncate itself.

**Fix:** drop `page`/`limit` from these calls and slice the returned `items`
where a shorter list is wanted, or ask the backend to add real pagination.

**Also worth noting:** `GET /v1/products/{product}/reviews` *does* paginate
(`page`, `limit`, and echoes both back), and `getProductReviews` handles that
correctly. So the review-list endpoints are the inconsistent ones.

---

## 9. `avatar` accepted but never sent (low)

**Severity: Low.** Spec allows it, client omits it — no breakage, but it means
the avatar field the spec describes is unreachable from the UI.

```1967:1975:docs/backend-docs/openapi.yaml
              type: object
              properties:
                fullName: { type: string, maxLength: 120 }
                displayName: { type: string, maxLength: 60, nullable: true }
                avatar: { type: string, maxLength: 500, nullable: true }
```

`updateProfile` sends only `fullName`/`displayName`:

```37:47:src/api/services/account.ts
export async function updateProfile(input: {
  fullName?: string
  displayName?: string
}): Promise<ProfileResponse> {
  return normalizeProfileResponse(
    await apiRequest<ProfileResponse | ApiProfile>('/users/me/profile', {
      method: 'PATCH',
      body: input,
    }),
  )
}
```

**Fix:** optional. Add `avatar?: string | null` to the input if avatar uploads
are wanted.

---

## Verified correct

These were checked and are right; recording them so they are not re-litigated.

**Endpoint coverage.** Every spec endpoint the storefront needs is called. The
full mapping, all confirmed against the spec's `operationId`:

| Area | Endpoints | Status |
|---|---|---|
| Auth | check-email, register, login, logout, refresh, forgot-password, me, oauth url + exchange | complete |
| Catalog | categories, category panel, products, featured, new-arrivals, recommendations, detail, related, reviews, search suggestions | complete |
| Cart | get cart, add, patch item, delete item, delete selected, select-all, move-to-wishlist, merge | complete |
| Checkout | preview, shipping-quote, payment-intent, payment-methods/checkout | complete |
| Orders | list, detail, tracking, buy-again (both), return, place | complete |
| Payments | status, networks, list, delete, set default | complete |
| Reviews | waiting, reviewed, submit | complete |
| Wishlist | list, categories, add, remove | complete |
| Account | profile, security, email, phone, password, delete account, browsing history, notifications | complete |
| Addresses | list, create, update, delete, default, duplicate, 3 lookups | complete |
| Content | page, home, footer, newsletter ×2, partnership, quotation, agent | complete |

**Deliberately not called** (correctly):
- `/webhooks/{provider}` — spec says "Never called by clients."
- `/users/me/2fa/enable` and `/2fa/disable` — no 2FA UI exists yet; `getSecurity`
  does read `twoFactorEnabled`, so this is a gap only if 2FA is planned.
- `POST /auth/reset-password` — reachable only via the emailed link.

**Request bodies.** All match. Spot-checked the ones most likely to drift:
`POST /auth/register` correctly sends the Laravel pair `password` +
`password_confirmation` plus the required `fullName`; `PATCH /users/me/password`
sends all three required keys; `POST /cart/items` omits `variantId` rather than
sending `undefined`; `POST /checkout/payment-intent` omits `paymentMethodId`
entirely when unset, which the spec permits.

**Idempotency.** Correct and carefully handled — `POST /orders` and
`POST /checkout/payment-intent` both take a key, they get *separate* keys because
the bodies differ (the spec rejects the same key with a different body as
`422 idempotency_key_reused`), and a retry after a `price_changed` conflict
correctly takes a new key. This matches the spec's documented rules precisely.

**Cart-Id header discipline.** The `guestCartId` flag is applied to exactly the
two endpoints that consume the guest cart to merge it (`POST /cart/merge`,
`POST /orders`), which matches the client's own documented reasoning. Note
`POST /auth/register` and `POST /auth/login` also declare `CartId` and merge the
guest cart server-side, and the client does send the header there too — correct,
though the `guestCartId` flag is not needed for it since login/register are not
user-cart endpoints.

**Identifier convention.** Path params use `rid` throughout
(`/orders/{orderRid}`, `/addresses/{addressRid}`, `/wishlist/{productRid}`), and
`productId`/`cartItemIds`/`addressId` are sent as the spec's *body* field names,
which are explicitly `rid`-valued in the descriptions. Correct.

**Error handling.** `parseError` reads `error.code` / `error.message` /
`error.details`, and `HomePage` branches on `isOrderConflictCode(error.code)` —
never on message text, as the spec demands. All five `409` order conflict codes
are enumerated in `ORDER_CONFLICT_CODES`.

**Deprecated fields.** The client consistently prefers the new `*Money` /
`*Days` / ISO-timestamp fields over the deprecated display strings, with
`@deprecated` markers and fallbacks only. This matches
`docs/backend-docs/CLIENT-CHANGE-NOTES.md`. Good discipline.

---

## Wider observation: `rid ?? id` fallbacks

Several places fall back to an `id` field the spec says does not exist —
e.g. `catalog.ts` de-duplicates with `item.rid ?? item.id`, and `types.ts` keeps
`id?: Rid` alongside `rid` on `ApiProductCard`, `ApiAddress`, `ApiOrderRecord`,
`ApiCategoryNode`, and others.

The spec is unambiguous: "There is no parallel `id` field anywhere in the API,"
and it enumerates the only legitimate `id`s — `NotificationSetting.id`, the
browsing-history bucket id, the mobile-money network id, and `facets` keys.
None of those are product, address, or order records.

This is **defensive rather than wrong**, and it does not misread anything: when
`rid` is present the fallback never fires. But it does hide a real problem —
the fallbacks are load-bearing for at least one case where a field genuinely
does not match the spec, and they make it harder to notice. Worth pruning once
you have confirmed the backend ships `rid` everywhere.

Note the categories case is different: `CategoryNode` in the spec has **no**
`slug` field (only `rid`, `label`, `image`, `imageUrl`, `children`), yet the
client treats `slug` as "the wire field and the value used everywhere as the
category id." `CategoryPanel.parent` does have `slug`, and the `categoryId`
query param accepts a slug. So `slug` on a plain `CategoryNode` is an assumption
worth confirming against a live response.

---

## Suggested order of work

1. **#2 `deleteBrowsingHistory`** — one-word fix, currently 100% broken.
2. **#3 `submitQuotation` + `submitAgentRequest`** — need a `name` input first;
   both endpoints are dead until then.
3. **#1 `totalMoney`** — rename now, before anything reads it.
4. **#4 `deliveryDays`** — rename, restores a filter that silently vanished.
5. **#5 / #6** — retype to the real shapes when those features get built.
6. **#7 / #8 / #9** — opportunistic.

## Verification note

This audit is static: spec text compared against TypeScript source. The findings
above are each traceable to a specific line in either file, and no claim depends
on a running server. Before acting on #1 and #4 in particular, a single live
request is worth it — `GET /products?country=AE` will show whether the delivery
facet key is `deliveryDays` or `maxDays` in the deployed build, and it is the
one place where the spec and the client disagree on a field the UI depends on.