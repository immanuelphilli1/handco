# Backend work for the H&CO. storefront update (handco-api)

The storefront (handco-web-client) has been updated for the client's UI requirements (`HCO_Website_UI_Ecommerce_Requirements.docx`): a SHEIN-style categories menu, a quick-navigation bar, mobile banners, 3:4 product images, size/colour variants, and a right-to-left layout for UAE shoppers. The frontend is finished, but several features only work fully once the API supports them. This brief lists what the storefront expects, field by field.

Keep every change backward compatible. The live storefront must keep working while the work is deployed piece by piece, so add fields rather than rename or remove them. Use the same conventions as the existing public endpoints: `/api/v1`, JSON, no auth, absolute asset URLs, and the same CORS rules.

## Required

### 1. Mobile banner image

Phones currently crop the sides off the wide desktop banner. The storefront now uses a separate portrait image below 768 px when one exists.

- Add a nullable `mobile_image` column to `inhouse_placements`.
- In Admin > Placements, create and edit: add an optional "Mobile image" upload with the hint "3:2 (1080 × 720) or square (1080 × 1080). Shown on phones. Leave empty to use the desktop image." Staff must also be able to remove it.
- Return `mobileImageUrl` on every item from `GET /api/v1/placements/home`, for both `hero` and `promo`:
  - an absolute URL, in the same form as `imageUrl`;
  - `null` when no mobile image is set (not an empty string, not omitted).
- Optional: also return `mobileImageWidth` and `mobileImageHeight` in pixels, so the storefront can reserve the space and avoid layout shift.

Example item:

```json
{ "rid": "…", "position": "hero", "imageUrl": "https://…/hero-desktop.jpg", "mobileImageUrl": "https://…/hero-mobile.jpg", "altText": "…", "title": null, "description": null, "buttonText": null, "linkUrl": "/categories/fashion" }
```

### 2. Quick navigation links (staff-editable)

The bar under the search shows shortcut links. It currently falls back to a hard-coded list because this endpoint returns 404.

- **Table:** `navigation_links`, with:
  - `id`
  - `label` (required, max 40 characters)
  - `link_url` (required)
  - `sort_order` (int)
  - `is_active` (bool, default true)
  - timestamps
- **Admin:** a "Navigation links" page to list, create, edit, delete, reorder and activate or deactivate links.
- **Validation:** `link_url` must be either a storefront path starting with a single `/` (for example `/categories/fashion-women`) or an `https://` URL. Reject anything else (`javascript:`, `//host`, relative paths).
- **Public endpoint:** `GET /api/v1/navigation-links`, with no auth. It returns active links only, ordered by `sort_order`, then `id`:

```json
{ "items": [ { "label": "New Arrivals", "linkUrl": "/categories/new-releases" } ] }
```

- **Seed** these defaults, in this order:

| Label | Link |
|---|---|
| New Arrivals | `/categories/new-releases` |
| Best Sellers | `/categories/featured` |
| Women's Dresses | `/categories/fashion-women` (repoint to the Dresses category once it exists, see section 5) |
| Sneakers | `/categories/fashion-shoes-sneakers` |
| Bags | `/categories/accessories-bags` |
| Jewelry | `/categories/accessories-jewelry` |
| Phone Accessories | `/categories/electronics-phones-tablets` |
| Home Decor | `/categories/decor` |
| Smart Gadgets | `/categories/electronics-wearables` |
| Deals | `/categories/deals` |

- **Help text on the admin page:** "Link to a category page (`/categories/<slug>`) so that hovering the link opens the Categories menu on that category. `/categories/featured`, `/categories/new-releases` and `/categories/deals` are also valid."

### 3. "On sale" filter for Deals

The Deals page lists discounted products. The storefront already sends `onSale=1`. Until the API supports it, the storefront downloads everything and filters in the browser, which won't scale.

- Support `GET /api/v1/products?onSale=1`: return only products whose original price is set and higher than their selling price (`original_price_minor > price_minor`). Use the same price the listing card shows.
- It must work together with every existing parameter: `categoryId` (a slug, including its descendants, as today), `country`, `freeDelivery`, `maxDeliveryDays`, `sort`, `page` and `limit` (the storefront pages with `limit=100`).
- `total` and `facets` must describe the filtered set.
- A missing `onSale` or `onSale=0` means no filter.
- Discounted items must keep returning `originalPriceMoney` and `discountPercent`, as they do now.

### 4. Variants: what the storefront relies on

Most of this exists already. Please confirm it, or fix it.

- **Cart and order labels:** the cart line's `variant` string must name both options, for example `"Black / L"`. The same applies to order lines: the orders list, order detail and tracking. The storefront shows that string as it is.
- **Exact variant recorded:** cart items and order items keep `variantRid`. Orders store the exact variant bought (SKU, size, colour) at the time of purchase.
- **Stock per variant:** stock is tracked per size/colour combination. Adding or ordering an out-of-stock variant is rejected with a clear error code. Every variant returns `inStock` and `stockQuantity`.
- **Photo per colour:** every variant of a given colour returns an `imageIndex` pointing to that colour's photo in `gallery`.
- **New: colour swatches.** The product page wants SHEIN-style colour circles, but the API has no colour codes.
  - Add a global colour table (name, hex) managed in the admin, so staff don't enter a hex per product.
  - On the product detail response, add an optional `swatches` array to the colour group in `optionGroups`, keeping `values` unchanged:

```json
{ "key": "color", "label": "Colour", "values": ["Black", "White"], "swatches": [ { "value": "Black", "hex": "#000000", "imageUrl": null } ] }
```

  - `hex` is null for a colour with no mapping; the storefront then keeps a text chip.
- **New: flag products with a choice to make.** The "+" button on product cards adds a product without choosing a variant, so the server picks the default one. Add `hasVariantChoice: true` to listing cards (`/products`, `/products/featured`, `/products/new-arrivals`, recommendations) when a product has more than one variant. The storefront will then open the product page instead of adding straight to the cart.

### 5. Category tree (data and content)

The new Categories menu shows the tree from `GET /api/v1/categories` as it is:
- the main categories on the left;
- their children under "Shop by category";
- one section per child, holding everything beneath that child.

So what the client sees depends entirely on this data.

- Confirm the endpoint returns the full depth: `slug`, `label` and an absolute `imageUrl` on every node.
- Every node below the main categories needs an image. Images are shown as 64 px circles, so use square images of at least 300 × 300 with the subject centred.
- Build the structure from section 7 of the client document, with the client confirming the names:
  - Women: Dresses, Tops, Bottoms, Shoes, Bags, Accessories
  - Men: Shirts, T-Shirts, Trousers, Shoes, Watches
  - Electronics: Phones, Accessories, Audio, Smart Devices
  - Home & Garden: Furniture, Decor, Kitchen, Lighting, Garden

  Today Women and Men sit under Fashion. Ask the client whether they want WOMEN and MEN as main categories, as section 7 shows.
- Add Beauty if the client wants the Beauty shortcut from section 6.
- Keep slugs stable once they're live. Quick links and shared URLs point at them.

### 6. Visitor country (`GET /api/v1/locale`)

For shoppers who aren't signed in, the storefront switches to right-to-left when `/locale` returns `country.code = "AE"`.

- Work out the country from the real client IP behind the proxy or CDN: trust the right forwarding header, and only from trusted proxies.
- Make sure CDNs and proxies never cache the response across visitors. Use `Cache-Control: private, no-store`, or vary on the client IP.
- Check that a UAE IP returns `AE` and a Ghana IP returns `GH`.

## Nice to have

7. **Variant generator in the product form.**
   - Staff pick sizes and colours, and the form creates every missing combination with a SKU such as `{PRODUCT-SKU}-{COLOUR}-{SIZE}` and stock 0.
   - Existing rows are left alone.
   - Raise the 50-variant limit (8 sizes × 8 colours = 64).
8. **3:4 image hint on product uploads:** "Use 3:4 portrait, e.g. 1200 × 1600". Show a warning (not a block) when an image's ratio is more than about 5% away from 3:4.
9. **Size filter:** `GET /api/v1/products?size=L`, plus `facets.sizes: string[]`, built the same way as `color` and `facets.colors`.

## When you're done, report back with

- The migrations added.
- A real example response for `/placements/home`, `/navigation-links`, `/products?onSale=1&limit=2` and one product detail with `swatches`.
- Anything you couldn't do as described, or did differently (field names, behaviour), so the storefront can be matched to it.
