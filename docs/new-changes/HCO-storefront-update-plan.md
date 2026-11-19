# H&CO storefront update: work plan

Source: client document HCO_Website_UI_Ecommerce_Requirements.docx (sections 1 to 8).

## Part 1: Frontend (handco-web-client)

The client sent new UI requirements (HCO_Website_UI_Ecommerce_Requirements.docx). Here is the work for the storefront. The file names are in `src/`.

**1. Categories mega-menu (doc sections 1 and 7)**
- Today, the "Categories" button opens `CategoriesModal`, which already has the main categories on the left and the subcategory panel on the right.
- Change it to a dropdown that opens under the Categories button, not a full modal. On desktop, hover on a main category opens its subcategories beside it. Click must also work, for touch.
- The shopper stays on the current page. Close the menu on outside click, Escape and route change.
- Keep the data from `useCatalog()` / `catalogCategories.ts` and the `categories/{category}/panel` endpoint. No API change is necessary.
- On mobile, keep the current list, then detail flow.

**2. Header layout (doc sections 5 and 7)**
- Make the Categories button compact ("Categories" + chevron). Today it is `w-44` (`categoriesButtonClass` in `Nav.tsx`). Give the search bar the free width.
- Target header: Logo | Categories ▼ | Search | Account | Wishlist | Cart.
- Note: section 5 says "move Categories beside Best Sellers", but section 7 puts it beside the logo. We will confirm with the client. Build section 7 for now.

**3. Quick navigation bar under the search (doc section 6)**
- `CategoryLinksBar` now shows Best Sellers, New Releases and then every top level category from the API. This duplicates the Categories menu.
- Replace it with a short list of shortcuts: New Arrivals, Best Sellers, Women's Dresses, Sneakers, Bags, Jewelry, Phone Accessories, Home Decor, Smart Gadgets, Deals.
- Staff will edit this list in the admin (decision: option A). Read it from `GET /api/v1/navigation-links`, which returns `{ items: [{ label, linkUrl }] }` in display order. Until that endpoint is ready, use a static list in `src/data/` with the same shape. Reuse `BannerLink` for the links (a link can be a full URL or a store path such as `/category/fashion`).
- The bar must scroll sideways on mobile. Do not wrap it to two lines.
- "Deals" needs a new API filter (see backend notes). Until then, link it to Best Sellers or hide it.

**4. Mobile banner (doc section 2)**
- `HeroSection` and `PromoBannerSection` use one image with `object-cover` (`h-52` on mobile, `lg:h-80`). On phones, the sides of the desktop banner are cut off.
- The placements API will add `mobileImageUrl` (it can be null). Render a `<picture>`: `<source media="(min-width: 1024px)" srcSet={imageUrl}>` and the `<img>` with `mobileImageUrl ?? imageUrl`.
- When a mobile image is present, let it set the height (for example `aspect-[4/5]` or the uploaded ratio) instead of the fixed `h-52`, so nothing is cut off. Check tablet widths too (768 to 1023 px).

**5. Product images 2:3 portrait (doc section 3)**
- Change `aspect-square` to `aspect-[2/3]` with `object-cover` in `ProductCard.tsx` and on the product detail gallery (`ProductDetailView.tsx`, line 134).
- Use the same ratio everywhere a product image shows: listings, category pages, search, new arrivals, featured, recommendations, wishlist, cart and order thumbnails.
- Check that the cards still line up in the grid and that the badges and wishlist heart sit correctly on the taller image.

**6. Sizes and colours (doc section 4)**
- This is already built. The API returns `variants` with `size`, `color`, stock and `imageIndex`, and `productVariantSelection.ts` handles the picker. The cart and the orders store the exact variant.
- Please test a product with 6 sizes x 4 colours: pick colour, then size; sold out sizes are disabled; the gallery jumps to the colour's photo; "Add to cart" stays disabled until both are picked; the cart line shows the colour and size.
- Show colours as swatches and sizes as buttons (SHEIN style), if they are not already like that.

Please send screenshots at 375 px, 768 px and 1440 px when it is ready.

## Part 2: Backend (handco-api)

I checked both repos (`LHDexpress/handco-api` main at 2800a4c, `LHDexpress/handco-web-client` main at a275fe3).

Necessary:
1. **Mobile banner image (you were right).** Add a nullable `mobile_image` column to `inhouse_placements`. Add an optional "Mobile image" upload in Admin > Placements (create and edit), with a size hint (for example 1080 x 1350). Return `mobileImageUrl` from `GET /api/v1/placements/{page}`. It is a small change: 1 migration, the model, the admin controller, 2 admin pages and the API controller.
2. **Quick navigation links.** The new bar under the search needs a list that staff can edit (label + link + order + active). Decision: a small "Navigation links" page in the admin (label, link, order, active) and a public `GET /api/v1/navigation-links` that returns the active links in order.
3. **"Deals" filter.** Products have `original_price_minor`, but the listing API has no "on sale" filter. Add `?onSale=1` (original price higher than price) so the Deals link can show discounted products.

Nice to have:
4. **Variant generator in the product form.** Sizes and colours already exist (product + variants with their own size, colour, SKU, stock and photos; the cart and orders keep the exact variant). Today staff add every combination by hand, and the limit is 50 rows. A "Generate variants" helper (choose sizes and colours, it makes the rows and the SKUs) saves a lot of time. The CSV import already reads size and colour.
5. **2:3 image hint.** No image is cropped on upload. Add a hint on the product image upload ("use 2:3 portrait, for example 1000 x 1500") and a warning when the image is not near 2:3.
6. **Size filter** on category listings (the API filters by colour, not by size).

No backend change for: the mega-menu (the category tree and `categories/{category}/panel` exist already) and the header layout.

Open question for the client: section 5 says to put Categories beside Best Sellers, but section 7 puts it beside the logo. I told the frontend developer to build section 7 until they confirm.
