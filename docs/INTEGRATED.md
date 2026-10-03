# HandCO Frontend — Integrated

This document describes what was wired to the HandCO customer API from `docs/backend-docs`. The UI layout and styling were **not changed** — only data sources and actions were connected to live endpoints.

**API base URL:** `https://handco.craftsmanjohn.com/api/v1`  
**Config:** `.env` / `.env.example` → `VITE_API_BASE_URL`  
**Demo account:** `demo@handco.test` / `password` (or `jaygrey.jg@gmail.com` / `password`)

For gaps and partial integrations, see [NOT-INTEGRATED.md](./NOT-INTEGRATED.md). For the API contract this client targets, see [FRONTEND-API-CHANGES.md](./FRONTEND-API-CHANGES.md) and [07-checkout-flow.postman_flow.json](./07-checkout-flow.postman_flow.json).

---

## Architecture

| Layer | Location | Purpose |
|-------|----------|---------|
| HTTP client | `src/api/client.ts` | JSON requests, Bearer auth, guest-only `X-Cart-Id`, 401 refresh retry |
| Token / cart storage | `src/api/storage.ts` | `sessionStorage` for access/refresh tokens and guest cart rid |
| Checkout handoff | `src/api/pendingPayment.ts` | Survives the provider redirect with the payment + cart lines to order |
| Types & mappers | `src/api/types.ts`, `src/api/mappers.ts` | API shapes → existing UI types; relative image URLs resolved |
| Services | `src/api/services/*.ts` | One module per backend area (auth, catalog, cart, etc.) |
| Auth state | `src/context/AuthContext.tsx` | Session bootstrap, sign-in, register, sign-out, `adoptSession` for OAuth |
| Shop state | `src/context/ShopContext.tsx` | Cart, wishlist, order summary, last placed order |
| Catalog state | `src/context/CatalogContext.tsx` | Categories, facets, featured and new-arrival products |
| Catalog hooks | `src/hooks/useCatalogProducts.ts` | Featured, new arrivals, listings, recommendations |
| Search hooks | `src/hooks/useProductSearch.ts` | Search results, facets and Nav suggestions |
| Default address | `src/hooks/useDefaultAddress.ts` | One source shared by Your Profile and Checkout |
| CMS hook | `src/hooks/useCmsPage.ts` | Legal pages with static fallback |

**Provider order:** `BrowserRouter` → `AuthProvider` → `ShopProvider` → routes

---

## Authentication

| Endpoint | UI / behavior |
|----------|----------------|
| `POST /auth/check-email` | Email-first flow in `SignInModal` |
| `POST /auth/login` | Sign in with password |
| `POST /auth/register` | New account registration |
| `GET /auth/me` | Session bootstrap on app load |
| `POST /auth/logout` | Sign out from account menu |
| `POST /auth/refresh` | Automatic retry in `api/client.ts` on 401 |
| `GET /auth/oauth/google/url` | “Continue with Google” — full-page redirect to Google |
| `POST /auth/oauth/google` | Callback page — exchanges the one-time `code` for a session |

**Wired components:** `SignInModal`, `Nav` (via `useAuth`), `AuthContext`, `GoogleOAuthCallbackPage`

### Google sign-in (OAuth)

Implemented per `docs/GOOGLE-OAUTH.md`. The API does all the Google work, so the client
ships no Google SDK, client id, or client secret.

1. **Start** — `handleGoogleSignIn` calls `GET /auth/oauth/google/url`, stores the
   `state` in `sessionStorage` (`api/googleOAuth.ts`), and redirects with
   `window.location.assign`. A fresh URL/`state` pair is fetched on every click
   because `state` is single-use and expires after 10 minutes.
2. **Callback** — route `/oauth/google/callback` (`GoogleOAuthCallbackPage`). This
   path must match the `redirect_uri` registered with Google
   (`https://handco.onrender.com/oauth/google/callback`); it is exposed as
   `getGoogleOAuthCallbackPath()` and is not configurable.
3. **Validate** — the query is parsed once in a lazy state initialiser, so an
   already-invalid or cancelled link shows its error immediately instead of
   flashing the loader. `error` → “Sign-in was cancelled.” and no API call.
   `code`/`state` are compared against the saved value (CSRF check), then both the
   query string and the saved state are cleared so a refresh cannot replay the
   single-use code.
4. **Exchange** — `POST /auth/oauth/google` with `{ code, state }`, sending the
   guest `X-Cart-Id` so the guest cart merges into the account. Tokens are stored
   exactly as for email sign-in, then `adoptSession` updates `AuthContext` without
   a redundant `/auth/me` round trip.
5. **Return** — the page redirects to the saved return path (e.g. checkout) or the
   home page. The callback path is rejected on both write and read, so it can
   never be used as a destination.

Documented error codes (`oauth_invalid_state`, `oauth_failed`,
`oauth_email_unverified`, `oauth_account_conflict`, `validation_error`) map to
their own copy, and any failure reopens the sign-in modal. `nextStep: "oauth"`
from `check-email` routes Google-only accounts to the Google button instead of a
password field they cannot use.

**Also on login:** `POST /cart/merge` — guest cart merged after successful sign-in/register

---

## Catalog & products

| Endpoint | UI / behavior |
|----------|----------------|
| `GET /products/new-arrivals` | Home — `NewArrivalsSection` |
| `GET /products/featured` | Home — `FeaturedItemsSection` |
| `GET /categories` | `CatalogContext` — category list, link bar, modal, listings |
| `GET /categories/:id/panel` | Category panel sections — `catalogCategories` |
| `GET /products` | Category listings — `CategoryListingView`; also search results via `?q=` |
| `GET /search/suggestions` | Nav typeahead — `NavSearchBar` via `useSearchSuggestions` |
| `GET /products/:productRid` | Product detail — `HomePage` + `ProductDetailView` |
| `GET /products/:productRid/related` | “You may also like” on product detail |
| `GET /products/:productRid/reviews` | Reviews section on product detail |
| `GET /products/recommendations` | Cart & order-complete recommendation strips |

**Notes:**
- Product URLs use API rids (e.g. `/products/aerosmart-earbuds`).
- Static product data remains as **fallback** when the API is unreachable.
- Add-to-cart and wishlist hearts use live product ids from the API.
- Search is API-first; the local `searchRelevance` synonym map only widens the
  query so related terms (e.g. "shoe" → sneakers) reach the same endpoint.

### API cleanup migration (2026-10-03)

Migrated per `docs/backend-docs/CLIENT-CHANGE-NOTES.md`. The server no longer
owns wording or formatting, so raw values are read and formatted in the client.

| Deprecated wire field | Now read from | Rendered by |
|-----------------------|---------------|-------------|
| product `price`, `originalPrice` | `priceMoney`, `originalPriceMoney` | `formatAmount` |
| detail `priceAmount` + `priceCurrency` | `priceMoney` | `formatAmount` |
| detail `shippingFee` | `shippingFeeMoney` | `formatAmount` |
| cart item `price` (number) | `priceMoney`, `previousPrice` | `formatAmount` |
| order list `total` | `totalMoney` | `formatAmount` |
| review `priceAmount` | `priceMoney` | `formatAmount` |
| product `discount` (`"-18%"`) | `discountPercent: number` | `formatDiscountPercent` |
| product `rating` (`"4.6"`) | `ratingValue: number` | `String(...)` |
| product `delivery` | `deliveryQuote: { free, fee, minDays, maxDays }` | `formatDeliveryQuote` |
| detail `deliveryEstimate` | `deliveryDays: { min, max }` | `formatDeliveryDays` |
| checkout `fee`, `deliveryWindow` | `feeMoney`, `deliveryDays` | `formatAmount` / `formatDeliveryDays` |
| order `statusDateLabel`, `statusBadgeLabel` | `status` + `statusDate` | `getOrderStatusLabel` |
| order `orderTime` | `placedAt` (ISO) | `formatIsoDate` |
| review `date`, waiting `deliveredOn` | `createdAt`, `deliveredAt` | `formatIsoDate` |
| `GET /products/search` | `GET /products?q=` | `catalogApi.searchProducts` |

New fields also wired: `imageUrls`, `variantOptions[].size/color`,
`taxRatePercent`/`priceInclTaxMoney` (typed, not yet displayed),
cart `summary.tax` (shown on the checkout summary), and
`order.returnEligibility` (the return dialog now explains an ineligible order
instead of submitting a request the API would reject with `return_not_allowed`).

All formatting lives in `src/data/format.ts`; `src/api/mappers.ts` normalizes
wire shapes into domain models.

### Catalog destination & delivery (2026-10-03)

The API only computes `deliveryQuote`, `deliveryDays`, `shippingFeeMoney` and
`priceInclTaxMoney` for a **known destination**, supplied as `?country=<ISO
alpha-2>`. Without it every product returns `deliveryQuote: null` and
`facets.delivery: null`. A delivery filter without a destination is rejected
with 422 `destination_required`.

`src/hooks/useProductDestination.ts` resolves the country once and shares it:

1. the signed-in customer's default address country;
2. otherwise `DEFAULT_DESTINATION_COUNTRY` (`AE`), so signed-out browsing still
   gets delivery information.

It is threaded through every catalog read: `listAllProducts`, `getFeaturedProducts`,
`getNewArrivals`, `getProductDetail`, `getRelatedProducts`, `searchAllProducts`.

**Delivery filter.** `facets.delivery` is a summary — `{ freeCount, maxDays[] }` —
not a list of values, so `mapApiProductFacets` builds the panel options from it
(`Free delivery`, `Within N days`), ascending. `deliveryOptionToParams` in
`src/data/deliveryFilter.ts` translates the selected option back into the
`freeDelivery=true` / `maxDeliveryDays=N` params the API accepts. The section
hides entirely when no options are available. Verified live against the API: the
facet's `freeCount: 8` matches `GET /products?country=AE&freeDelivery=true`
(`total: 8`).

**Note:** the old `delivery=<label>` param the panel previously sent is silently
ignored by the API (total unchanged), so it never actually filtered anything.

### Stock and price changes (2026-10-03)

Cart lines are always priced at today's price, so the cart surfaces movement
before checkout rather than letting `POST /orders` reject the attempt:

- `previousPrice` is mapped onto `CartItem` and rendered as a "Price changed"
  strike-through next to the new figure on both the mobile and desktop rows;
- `stockQuantity` (null = made to order, never sells out) caps the
  `QuantityStepper`, so the shopper cannot select more than exists;
- `available: false` marks the line as no longer orderable;
- `POST /cart/items` and `PATCH /cart/items/:id` return `422 insufficient_stock`
  or `422 currency_mismatch`. `src/data/cartErrors.ts` turns those into a
  shopper-facing message shown in `ShopContext.cartError`; the cart re-reads the
  authoritative list on a rejected quantity so the stepper snaps back.

### Order status and payment status (2026-10-03)

`status` and `paymentStatus` are now separate. `status` gained `pending_payment`
and `cancelled` (replacing `pending` and `failed`), and
`ApiOrderRecord.paymentStatus` (`unpaid`/`paid`/`failed`/`refunded`) is carried
but not yet rendered as its own badge — only `status` drives the badge label.
`pending_payment` uses the server's documented wording, "Awaiting payment".

### Product attributes (2026-10-03)

List items carry `attributes[]` as `{ key, label, value }`, rendered directly as
`label: value` on a new Specifications section in `ProductDetailView` — the
`label` comes from the API, so renaming an attribute in the admin needs no client
change. Facets also expose `attributes` (`{ name: [values] }`) and
`attributeLabels` (`{ name: "Screen size" }`).

Attribute filters serialize as `?attributes[material]=Leather` via
`toAttributeSearchParams` (verified live: `attributes[color]=Black` -> 9 products,
`attributes[color]=Beige` -> 1). **The generic attribute filter UI is not yet
built** — the filter panel still exposes only brand, colour, screen size, price,
rating and delivery. See NOT-INTEGRATED.md.

### Reviews are moderated (2026-10-03)

`POST /reviews` creates the review as `pending`, so the success copy now says it
is awaiting approval instead of implying it went live. `GET /reviews/reviewed`
items carry `status`. A `404` (line already left the waiting list) and
`409 review_exists` (two submits raced) are translated by
`src/data/reviewErrors.ts`.

### Address country codes (2026-10-03)

The addresses API stores the country as the ISO 3166-1 alpha-2 **code**
(`"GH"`), not the name, but the form previously submitted the name. The country
dropdown now displays the name while storing the code, and fills the country's
dialling prefix into the phone field. `AddressRecord` keeps both `country` (the
code, used as the catalog destination) and `countryName` (for display).

Region and city are now sent as `regionId`/`cityId` when they came from a lookup
list, so the backend can match shipping rules by identity rather than by name. A
typed region or city still works and is matched by name, and its rid is cleared
when the country changes.

---

## Cart & wishlist

| Endpoint | UI / behavior |
|----------|----------------|
| `GET /cart` | Cart loaded on app start; badge count in `Nav` |
| `POST /cart/items` | Add to cart from product cards / detail |
| `PATCH /cart/items/:cartItemRid` | Quantity and selection toggles in `CartView` |
| `DELETE /cart/items/:cartItemRid` | Remove single line |
| `DELETE /cart/items` | Delete selected lines |
| `PATCH /cart/items/select-all` | Select all checkbox |
| `POST /cart/items/move-to-wishlist` | Move selected to wishlist |
| `POST /cart/merge` | After login in `SignInModal` |
| `GET /wishlist` | Wishlist page — `WishlistView` |
| `POST /wishlist/:productRid` | Add to wishlist (signed-in) |
| `DELETE /wishlist/:productRid` | Remove from wishlist |

**Guest carts:** `X-Cart-Id` is persisted from cart responses and sent only while signed out (see “Cart identity” above).

**Wired components:** `CartView`, `OrderSummaryPanel`, `ProductDetailView`, `ProductCard`, `WishlistView`, `ShopContext`

---

## Checkout & orders

| Endpoint | UI / behavior |
|----------|----------------|
| `GET /checkout/preview` | Checkout address & shipping preview — `CheckoutView` |
| `POST /orders` | **First** step of submit — creates the order awaiting payment |
| `POST /checkout/payment-intent` | **Second** step — opens payment for that order |
| `GET /payments/:paymentId` | Polled on the return page — `PaymentReturnView` |
| `GET /orders` | Account → Your orders — `YourOrdersView` / `OrdersPanel` |
| `GET /orders/buy-again` | “Buy this again” sidebar on orders page |

### Payment flow (order-first)

Checkout was reversed: the order is now created **before** payment, so totals are
fixed at current prices and stock is held, and the provider is opened for exactly
that order total. Previously the cart was paid first and the order attached
afterwards, which allowed unpaid orders and mismatched payments. The client still
never collects card details.

1. **Place order** — `handleSubmitOrder` resolves the address from `GET /checkout/preview`, then `POST /orders` with `{ addressId, cartItemIds }`. `paymentToken` is gone. Requires auth. The ordered lines leave the cart at this point, so the cart is refreshed before the redirect.
2. **Open payment** — `POST /checkout/payment-intent` with `{ orderId }` returns `checkoutUrl`, `paymentRid`, `provider` and the `amount`. `paymentRid`/`provider`/`orderId`/order reference are written to `sessionStorage` (`api/pendingPayment.ts`), because the provider handoff is a full page load that discards React state. The browser then navigates to `checkoutUrl`.
3. **Return** — `/checkout/return` and `/checkout/cancel` (`getPaymentReturnPath` / `getPaymentCancelPath`). Only `?reference=<payment rid>` is trusted; provider params like `session_id` are ignored.
4. **Confirm** — `PaymentReturnView` polls `GET /payments/:reference` every 2s (max 10 attempts) until the payment settles. 401/404 stop polling immediately. A cancel or missing reference resolves without a request.
5. **Reconcile** — on `succeeded` there is nothing left to place: the order already exists. The stored pending payment is consumed once (guarded on the payment rid) so a re-render or repeat visit cannot run it twice, then the cart is cleared and `OrderCompletedView` is shown.

### Idempotency-Key

`POST /orders` and `POST /checkout/payment-intent` both require
`Idempotency-Key: <uuid>` (missing header -> `428 idempotency_key_required`).
`src/api/idempotency.ts` holds one key per checkout **attempt**, which is the
granularity the backend expects:

- a retry after a timeout or network error **reuses** the key, so the stored
  response is replayed instead of creating a duplicate order;
- acknowledging a `price_changed` conflict **resets** the key, because agreeing
  to a new price is a new decision rather than a retry of the same one.

The same key is used for both endpoints: the order is created once and the
payment intent is opened for that order.

### Order-time conflicts

`POST /orders` returns `409` for several expected conditions. All mean the order
was **not** created and the cart is untouched. `src/data/orderConflicts.ts`
normalises them into a shopper-facing message:

| Code | Shown as |
|---|---|
| `price_changed` | Old and new price per line, with an "Accept new prices" action. The conflict records that the shopper has now seen the new price, so resubmitting succeeds. |
| `insufficient_stock` | Remaining quantity per variant. |
| `item_unavailable` | Tells the shopper to remove the lines. |
| `cart_changed` | Plain retry. |
| `currency_mismatch` | Not retryable — explains the mixed currencies. |

Unpaid orders are cancelled after 60 minutes
(`PAYMENTS_ORDER_PAYMENT_WINDOW_MINUTES`), and the window restarts on each
payment attempt. A cancelled order returns `409 order_not_payable` on
payment-intent, which sends the shopper back to place a new order.

### Cart identity

`X-Cart-Id` is **guest-only**. `api/client.ts` omits it whenever a Bearer token is present, because the server resolves the user's cart from the token and ignores the header. Two endpoints opt back in via `guestCartId: true` because they deliberately consume the guest cart: `POST /cart/merge` (merge on sign-in) and `POST /orders`.

**Requirements:** User must be signed in to start payment; at least one cart line must be selected; a default address must exist.

---

## Account

| Endpoint | UI / behavior |
|----------|----------------|
| `GET /addresses` | Addresses list on load — `AddressesPanel` |
| `GET /payment-methods` | Saved payment methods list — `PaymentMethodsPanel` |
| `GET /browsing-history` | Browsing history on load — `BrowsingHistoryPanel` |
| `GET /notifications/settings` | Notification toggles on load — `NotificationsPanel` |
| `PATCH /notifications/settings/:id` | Toggle promotions / order updates |

**Payment methods are read-and-manage only.** The API removed `POST /payment-methods` and `PATCH /payment-methods/:id`, because clients never send card data — only provider tokens and masked details are stored. The add/edit UI was removed; a saved method can be set as default (`PATCH /payment-methods/:id/default`) or deleted (`DELETE /payment-methods/:id`). Failures roll the optimistic update back and surface the server's message.

---

## CMS & legal pages

| Endpoint | CMS slug | Page |
|----------|----------|------|
| `GET /content/pages/:slug` | `privacy-policy` | Privacy Policy |
| `GET /content/pages/:slug` | `warranty` | Warranty |
| `GET /content/pages/:slug` | `shipping-delivery` | Shipping & Delivery |
| `GET /content/pages/:slug` | `return-refund` | Return & Refund |
| `GET /content/pages/:slug` | `secure-payments` | Secure Payments |
| `GET /content/pages/:slug` | `intellectual-property` | Intellectual Property |
| `GET /content/pages/:slug` | `terms-of-use` | Terms of Use |

**Hook:** `useCmsPage(slug, fallback)` — uses API content when available, otherwise static copy from `src/data/*`.

---

## Public forms

| Endpoint | UI / behavior |
|----------|----------------|
| `POST /newsletter/subscribe` | Footer email subscribe — `Footer` |

---

## Account & profile (detail)

| Endpoint | UI / behavior |
|----------|----------------|
| `GET /users/me/profile` | Name/email in Your Profile — `ProfilePanel` |
| `PATCH /users/me/profile` | Save name, then refresh the session so the Nav updates |
| `GET /addresses`, `POST /addresses` | List and create — `AddressesPanel`, `AddAddressModal` |
| `PATCH`/`DELETE /addresses/:rid` | Edit and remove; optimistic with rollback |
| `PATCH /addresses/:rid/default` | Set default address |
| `POST /addresses/:rid/duplicate` | Duplicate an address |
| `GET /addresses/lookup/countries\|regions\|cities` | Address form cascade |
| `GET /reviews/waiting`, `GET /reviews/reviewed` | Reviews tabs — `ReviewsPanel` |
| `POST /reviews` | Submit review — `AddReviewModal` |
| `GET /browsing-history`, `POST /browsing-history` | History list and recording on product views |
| `DELETE /browsing-history`, `DELETE /browsing-history/all` | Remove selected rows / clear all |

**Notes:**
- `GET`/`PATCH /users/me/profile` return the profile document at the **top level** on the live backend, not nested under `profile`, so `getProfile`/`updateProfile` normalise both shapes to `{ profile, defaultAddress }`.
- The default address is read from the Addresses list (the entry flagged `isDefault`) through `useDefaultAddress`, which both Your Profile and Checkout consume so they cannot drift. The profile payload's embedded copy is only a fallback for when no list entry carries the flag.
- Address lookups are keyed differently: regions by country **rid/code**, cities by region **rid**.

---

## Files touched (summary)

### New
- `src/api/` — client, config, storage, types, mappers, services
- `src/api/pendingPayment.ts` — survives the provider redirect
- `src/api/googleOAuth.ts` — survives the Google redirect (`state` + return path)
- `src/context/AuthContext.tsx`
- `src/context/CatalogContext.tsx`
- `src/hooks/useCatalogProducts.ts`
- `src/hooks/useCmsPage.ts`
- `src/hooks/useDefaultAddress.ts`
- `src/hooks/useProductSearch.ts`
- `src/components/PaymentReturnView.tsx` — polls payment status after redirect
- `src/components/NavSearchBar.tsx`
- `src/vite-env.d.ts`
- `.env.example`
- `docs/INTEGRATED.md` (this file)
- `docs/NOT-INTEGRATED.md`

### Updated (data wiring only)
- `src/App.tsx` — providers, simplified routes
- `src/context/ShopContext.tsx` — API-backed cart & wishlist
- `src/pages/HomePage.tsx` — product detail, checkout, cart flow, payment handoff
- `src/pages/*Page.tsx` — Nav/auth props simplified
- `src/components/Nav.tsx`, `SignInModal.tsx`, `CartView.tsx`, `CheckoutView.tsx`, `OrderCompletedView.tsx`, `OrderSummaryPanel.tsx`
- `src/components/NewArrivalsSection.tsx`, `FeaturedItemsSection.tsx`, `CategoryListingView.tsx`, `ProductDetailView.tsx`
- `src/components/*PolicyPageContent.tsx` — CMS via `useCmsPage` (includes `TermsOfUsePageContent.tsx`)
- `src/components/Footer.tsx` — newsletter
- `src/components/YourOrdersView.tsx`, `AddressesPanel.tsx`, `PaymentMethodsPanel.tsx`, `BrowsingHistoryPanel.tsx`, `NotificationsPanel.tsx`

---

## Route protection

`src/components/RequireAuth.tsx` gates signed-in-only surfaces. The account routes
(`/account/:section`) are wrapped in it, so a signed-out visitor hitting those URLs
directly is redirected home and prompted via the sign-in modal.

- Holds a `ListingLoader` while `AuthProvider` restores the session from storage, so a
  page refresh does not bounce a signed-in user out before they are resolved.
- Calls `requestSignIn()` when blocked, which the `Nav` watches to open the sign-in modal
  (same mechanism as the wishlist heart and cart checkout).
- Re-evaluates on session change, so signing out while on an account page ejects
  immediately rather than leaving stale private panels on screen.

This is a **UX guard, not a security boundary** — the backend authorises its own
endpoints, and that server-side check is what actually protects the data.

---

## How to run

```bash
cp .env.example .env   # set VITE_API_BASE_URL if needed
npm install
npm run dev
```

Sign in with the demo account to test cart merge, wishlist, checkout, and account sections against the live API.
