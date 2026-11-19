# H&CO backend update: testing details

The backend work from your brief (`backend-prompt.md`) is on the staging API. It is not on production yet.

- **API base:** `https://handco.craftsmanjohn.com/api/v1`
- **CORS:** `http://localhost:5173`, `http://localhost:3000` and `https://handco.onrender.com` are allowed. If you test from another origin, send it to us and we add it.
- **Test product:** `GET /products/n1ntezjjmb80` ("Test Variant Hoodie (sizes and colours)"): 3 colours (Black, Grey, Navy) x 6 sizes (S to XXXL). Navy XXL and Navy XXXL are out of stock. Each colour has its own photo.
- **Test banner:** one hero banner with a desktop image and a mobile image (staging only).
- **Admin access:** the PM sends it to you separately.

## 1. Mobile banner (section 1)

`GET /placements/home`: every item has `mobileImageUrl` (absolute URL, or `null` when not set).

```json
{"rid":"jnrn707xumzy","position":"hero","imageUrl":"https://handco.craftsmanjohn.com/images/products/relaxed-fleece-hoodie.jpg","mobileImageUrl":"https://handco.craftsmanjohn.com/images/products/relaxed-fleece-hoodie-2.jpg","videoUrl":null,"altText":"Test banner (staging)","title":null,"description":null,"buttonText":null,"linkUrl":"/categories/fashion"}
```

Admin > Banners: the create and edit forms have an optional "Mobile image" upload, with a remove button.
Not done: `mobileImageWidth` / `mobileImageHeight` (optional in your brief). Tell us if you need them.

## 2. Quick navigation links (section 2)

`GET /navigation-links`: active links only, in display order. The 10 defaults from your brief are in, in your order.

```json
{"items":[{"label":"New Arrivals","linkUrl":"/categories/new-releases"},{"label":"Best Sellers","linkUrl":"/categories/featured"}, ... ,{"label":"Deals","linkUrl":"/categories/deals"}]}
```

Admin > Content > Navigation links: list, create, edit, delete, order (`sort_order` field) and active switch. A link must be a path that starts with one `/` or an `https://` URL.

## 3. Deals filter (section 3)

`GET /products?onSale=1`: only products with an original price higher than the price. It works with all the other parameters, and `total` and `facets` describe the filtered set. A missing `onSale` or `onSale=0` means no filter. Staging has 21 products on sale.

## 4. Variants (section 4)

- **Labels:** the cart line `variant` and the order detail `items[].variant` are "Colour / Size", for example `"Black / L"`. When a variant has no colour or size, the label is the variant name. The orders list and tracking responses do not return item lines, so nothing changed there.
- **Recorded on orders:** order items now keep the SKU, the size and the colour at the time of purchase.
- **Stock:** adding an out of stock variant returns 422 `insufficient_stock` with `details.variantRid` and `details.available`. If stock runs out after the item is in the cart, placing the order returns 409 `insufficient_stock`.
- **Photo per colour:** every size of a colour returns the `imageIndex` of that colour's photo (before, a size with no photo of its own returned `null`).
- **Swatches:** the colour group in `optionGroups` has `swatches`. `values` is unchanged. `hex` is `null` for a colour with no hex in the admin, so keep the text chip for it. The group label stays `"Color"` (not "Colour"), so current clients keep working.

```json
{"key":"color","label":"Color","values":["Black","Grey","Navy"],"swatches":[{"value":"Black","hex":"#000000","imageUrl":"https://handco.craftsmanjohn.com/images/products/relaxed-fleece-hoodie.jpg"},{"value":"Grey","hex":"#808080","imageUrl":"..."},{"value":"Navy","hex":"#1B2A4A","imageUrl":"..."}]}
```

Admin > Catalog > Colours: staff add the colour names and hex codes. Black, White, Grey, Blue, Red, Green, Navy, Beige, Brown and Pink are already in.

- **`hasVariantChoice`:** every product card has it (`/products`, `/products/featured`, `/products/new-arrivals`, `/products/recommendations`, related, wishlist and the other card lists). It is `true` when the product has more than one variant.

## 5. Category tree (section 5)

`GET /categories` returns every level with `slug`, `label` and an absolute `imageUrl` (`null` when the category has no image). Inactive subcategories are now left out of the tree. Before, they showed in the tree and their link gave a 404.
The category names and the images are content work for the client. Nothing changed in the data.

## 6. Visitor country (section 6)

`GET /locale` now sends `Cache-Control: no-store, private`. The country comes from the client IP, and tests cover a UAE IP (`AE`) and a Ghana IP (`GH`). Note: on staging, the country is the country of your own IP.

## 7 to 9. Nice to have (all done)

- **Variant generator:** in the admin product form, staff enter sizes and colours, and "Generate variants" adds every missing combination (SKU `{BASE}-{COLOUR}-{SIZE}`, stock 0). Existing rows stay. A product can now have up to 100 variants.
- **2:3 hint:** product image uploads show "Use 2:3 portrait, for example 1000 x 1500." and a warning (not a block) when an image is far from 2:3.
- **Size filter:** `GET /products?size=L` and `facets.sizes`. Letter sizes come in wearing order (S, M, L, XL, ...). The size and colour filters and facets also read the variant size and colour, not only the product attributes, so fashion products show up.

```
GET /products?size=XL        -> the test hoodie
GET /products?color=Navy&size=M -> the test hoodie
facets.sizes: ["S","M","L","XL","XXL","XXXL"]
```

Please send us anything that does not match what the storefront expects.
