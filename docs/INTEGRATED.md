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
| Auth state | `src/context/AuthContext.tsx` | Session bootstrap, sign-in, register, sign-out |
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

**Wired components:** `SignInModal`, `Nav` (via `useAuth`), `AuthContext`

**Also on login:** `POST /cart/merge` — guest cart merged after successful sign-in/register

---

## Catalog & products

| Endpoint | UI / behavior |
|----------|----------------|
| `GET /products/new-arrivals` | Home — `NewArrivalsSection` |
| `GET /products/featured` | Home — `FeaturedItemsSection` |
| `GET /categories` | `CatalogContext` — category list, link bar, modal, listings |
| `GET /categories/:id/panel` | Category panel sections — `catalogCategories` |
| `GET /products` | Category listings — `CategoryListingView` |
| `GET /products/search` | Search results — `SearchResultsView` via `useProductSearch` |
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
| `POST /checkout/payment-intent` | Starts payment on checkout submit — `HomePage` |
| `GET /payments/:paymentId` | Polled on the return page — `PaymentReturnView` |
| `POST /orders` | Places the order after payment is confirmed — `HomePage` |
| `GET /orders` | Account → Your orders — `YourOrdersView` / `OrdersPanel` |
| `GET /orders/buy-again` | “Buy this again” sidebar on orders page |

### Payment flow

The API owns payment end to end; the client never collects card details.

1. **Submit** — `handleSubmitOrder` resolves the address from `GET /checkout/preview`, then calls `POST /checkout/payment-intent` with an **empty body**. The backend picks the provider per currency, supplies the customer email, and builds the return/cancel URLs. Requires auth.
2. **Persist & redirect** — `paymentRid`, `provider`, the address id and the selected cart line ids are written to `sessionStorage` (`api/pendingPayment.ts`), because the provider handoff is a full page load that discards React state. The browser then navigates to `checkoutUrl`.
3. **Return** — `/checkout/return` and `/checkout/cancel` (`getPaymentReturnPath` / `getPaymentCancelPath`). Only `?reference=<payment rid>` is trusted; provider params like `session_id` are ignored.
4. **Confirm** — `PaymentReturnView` polls `GET /payments/:reference` every 2s (max 10 attempts) until the payment settles. 401/404 stop polling immediately. A cancel or missing reference resolves without a request.
5. **Place order** — on `succeeded`, `POST /orders` sends `addressId`, `cartItemIds` and `paymentToken` (the payment rid). `paymentMethodId` is no longer sent. The stored pending payment is consumed on first placement so a re-render or repeat visit cannot create a duplicate order, then the cart is cleared and `OrderCompletedView` is shown.

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
