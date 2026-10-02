# HandCO Frontend — Not Integrated

Backend capabilities from `docs/backend-docs` that are **not yet wired** into the UI, or only partially wired. Integrated items are tracked in [INTEGRATED.md](./INTEGRATED.md).

API base URL: `https://handco.craftsmanjohn.com/api/v1` (see `.env.example`).

---

## Authentication & security

| Item | Status | Notes |
|------|--------|-------|
| OAuth sign-in (Google, Facebook, Apple) | Not integrated | Social buttons in `SignInModal` are visual only. `authApi.oauthSignIn` exists but is not called. |
| Forgot / reset password | Not integrated | `authApi.forgotPassword` exists; no reset-password UI or email-token flow. |
| Token refresh retry | Partial | `api/client.ts` retries once on 401 via `/auth/refresh`; no dedicated session-expired UX. |
| 2FA enable / disable | Not integrated | Endpoints exist under `/users/me/...`; no account UI. |
| Account deletion | Not integrated | `accountApi.deleteAccount` exists; no UI. |
| Email / phone / password updates | Not integrated | Security panel still renders static `securitySettings`; `updateEmail`, `updatePhone`, `updatePassword` are unused. |

---

## CMS content

| Item | Status | Notes |
|------|--------|-------|
| CMS home content | Not integrated | `cmsApi.getHomeContent` unused; `HeroSection` and promo blocks remain static. |
| CMS footer content | Not integrated | `cmsApi.getFooterContent` unused; footer link columns remain static. |
| CMS about page | Not integrated | `AboutPageContent` uses static copy; `useCmsPage('about')` not applied. |
| Terms of Use | Integrated | Route `/terms-of-use` serves the `terms-of-use` CMS page (verified live: HTTP 200) via `useCmsPage`, with a full static fallback in `src/data/termsOfUse.ts`. Linked from the footer, checkout summary, and sign-in modal. |

---

## Inert links & buttons (audit 2026-10-02)

Every `<a href="#">` renders as a real link that does nothing when clicked — it scrolls nowhere and, worse, looks interactive. All of the following were verified inert in the browser via DOM inspection of `href` values.

### Footer — COMPANY column
| Link | Status | Notes |
|------|--------|-------|
| Affiliate, Partnership & Influencer Program | Inert | `href="#"`. `formsApi.submitPartnershipInquiry` exists but is unwired. |
| Press Releases | Inert | `href="#"`. No route and no CMS page behind it. |

### Footer — SOURCE ON H&CO. column
| Link | Status | Notes |
|------|--------|-------|
| Trending Products | Inert | `href="#"`. Could be a `/search?sort=trending` view, but no such route exists. |
| Request Quotation | Inert | `href="#"`. `formsApi.submitQuotation` exists but is unwired. |
| Connect with Agent | Inert | `href="#"`. `formsApi.submitAgentRequest` exists but is unwired. |

### Footer — CUSTOMER SUPPORT column
| Link | Status | Notes |
|------|--------|-------|
| Live Chat | Inert | `href="#"`. No chat widget is mounted. |

### Footer — social icons
| Link | Status | Notes |
|------|--------|-------|
| Facebook, Instagram, TikTok, YouTube, LinkedIn, X | Inert | All six are `href="#"` with no target URL configured in `socialIcons`. |

**Total: 13 inert links.**

---

## Payment methods

| Item | Status | Notes |
|------|--------|-------|
| Add / edit payment method | Removed | `POST /payment-methods` and `PATCH /payment-methods/:id` were removed from the API — clients never send card data. The add/edit UI and `createPaymentMethod`/`updatePaymentMethod` were deleted accordingly; saved tokens can only be set as default or deleted. |
| Payment networks list | Not integrated | `GET /payment-methods/networks` (`accountApi.getPaymentNetworks`) is defined but uncalled, so mobile-money networks are not sourced from the API. |

---

## Orders & checkout gaps

| Item | Status | Notes |
|------|--------|-------|
| Shipping quote on address change | Partial | `checkoutApi.getShippingQuote` is defined but uncalled. The shipping panel reads `GET /checkout/preview` once on mount, so changing the address does not re-quote. |
| Guest checkout | Not integrated | `POST /orders` requires auth; checkout submit no-ops when signed out (the sign-in modal opens first). |

---

## Public forms & newsletter

| Item | Status | Notes |
|------|--------|-------|
| Newsletter unsubscribe | Not integrated | `formsApi.unsubscribeNewsletter` exists; no token-handling UI. |
| Partnership inquiries | Not integrated | `formsApi.submitPartnershipInquiry` unwired; the footer link is inert (see audit above). |
| Quotation requests | Not integrated | `formsApi.submitQuotation` unwired; the footer link is inert (see audit above). |
| Agent support requests | Not integrated | `formsApi.submitAgentRequest` unwired; the footer link is inert (see audit above). |

---

## Security review (audit 2026-10-02)

Client-side storage, console output, and dependency audit.

| Check | Result | Notes |
|-------|--------|-------|
| `.env` committed to git | **Fixed** | `.env` was not covered by `.gitignore`, so it would have been committed. Added `.env`, `.env.*`, with `!.env.example` kept tracked. Verified `.env` was never in git history (`git log --all -- .env` is empty). |
| Hardcoded secrets in source | Pass | No API keys, tokens, passwords, or client secrets found. `.env` holds only the public API base URL. |
| Token storage | Pass | Access/refresh tokens live in `sessionStorage`, not `localStorage`, so they do not persist across browser restarts and are not written to disk-backed storage. |
| `localStorage` usage | Pass | No `localStorage` reads or writes anywhere in `src/`. |
| Cookies set by client | Pass | `document.cookie` is empty; the app sets no cookies. |
| Console leakage | Pass | The only `console.log` is a generic `console.log('Unable to subscribe right now.')` in `Footer`. No tokens, emails, addresses, or response bodies are logged. |
| Network leakage | Pass | Auth travels in an `Authorization` header only, never in a query string. Only `handco.*` session keys are stored. |
| Suspicious dependency | Pass | `package.json` has 5 runtime deps (React, React DOM, React Router, Tailwind, Remix Icon). No obfuscated or unexpected packages. `vite.config.ts` registers only the React and Tailwind plugins. |
| Vite env exposure | Pass | Only `VITE_API_BASE_URL` is declared in `vite-env.d.ts`. Anything prefixed `VITE_` is public by design, so no secret should ever be added to `.env` — see the note below. |

### Residual risks (not client-fixable)

- **Tokens are readable by any XSS.** `sessionStorage` is not protected from same-origin script. This is inherent to a browser SPA without `HttpOnly` cookies; the mitigation is keeping the token out of the DOM and avoiding `dangerouslySetInnerHTML`. A CSP would reduce the blast radius further and is worth adding at the server or via a `<meta http-equiv>` tag.
- **`getPaymentStatus` rid in the URL.** The return URL carries `?reference=<payment rid>` by design (backend requirement). It is a server-side identifier, not a credential, and `GET /payments/:id` is owner-scoped, so a leaked reference cannot read another user's payment.
- **Do not put secrets in `.env`.** Vite inlines every `VITE_`-prefixed variable into the JS bundle. `.env` is now gitignored, which stops accidental commits but does **not** make a `VITE_` variable secret — anything so named is public the moment the site is deployed.

---

## Known data-shape limitations

| Item | Status | Notes |
|------|--------|-------|
| New Releases subcategories | Partial | `Latest Arrivals` loads from `GET /products/new-arrivals`. `Just Dropped`, `Fresh Picks`, `Coming Soon` and `Limited Edition` have no backend data source — the product payload exposes no date field (no `createdAt`/`addedAt`/`publishedAt`) and no endpoint filters by date, so "added within the week" and "random per day" cannot be computed. They fall through to the standard `categoryId=new-releases` query. |
| Listing facets & filters | Partial | Products load from the API and server-side filters are applied, but some facet options still derive from locally loaded data rather than a dedicated facets endpoint. |

---

## Webhooks & admin

| Item | Status | Notes |
|------|--------|-------|
| Payment webhooks | N/A (client) | Server/QA only. The client polls `GET /payments/:paymentId` instead of receiving webhooks. |

---

## Environment & setup

Ensure `.env` contains:

```
VITE_API_BASE_URL=https://handco.craftsmanjohn.com/api/v1
```

Demo credentials (from backend docs): `demo@handco.test` / `password`, or `jaygrey.jg@gmail.com` / `password`.

---

## Suggested next steps

1. Call `checkoutApi.getShippingQuote` when the checkout address changes.
2. Wire the account security panel (email/phone/password/2FA) to its PATCH endpoints, which are still unused.
3. Add OAuth and password-reset flows matching Postman Flow 01.
4. Wire `cmsApi.getHomeContent` / `getFooterContent` / `useCmsPage('about')` to remove the remaining static CMS copy.
5. Wire the footer partnership / quotation / agent forms to `formsApi`.