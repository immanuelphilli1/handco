import { buildCacheKey, cachedGet } from '../cache'
import { apiRequest } from '../client'
import type {
  ApiProductCard,
  ApiProductDetailResponse,
  ApiProductReview,
  CategoriesResponse,
  CategoryPanelResponse,
  PaginatedProductsResponse,
  SearchSuggestionsResponse,
} from '../types'

export type ProductSearchParams = {
  q: string
  categoryId?: string
  subcategory?: string
  sort?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  delivery?: string
  brand?: string
  color?: string
  screenSize?: string
}

export type ProductListParams = {
  page?: number
  limit?: number
  categoryId?: string
  subcategory?: string
  q?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  delivery?: string
  brand?: string
  color?: string
  screenSize?: string
  sort?: string
}

export async function getCategories(): Promise<CategoriesResponse> {
  return cachedGet('categories', () =>
    apiRequest<CategoriesResponse>('/categories', { auth: false, cart: false }),
  )
}

export async function getCategoryPanel(categoryId: string): Promise<CategoryPanelResponse> {
  return cachedGet(buildCacheKey(`categories/${categoryId}/panel`), () =>
    apiRequest<CategoryPanelResponse>(`/categories/${categoryId}/panel`, {
      auth: false,
      cart: false,
    }),
  )
}

export async function listProducts(params: ProductListParams = {}): Promise<PaginatedProductsResponse> {
  return cachedGet(buildCacheKey('products', params), () =>
    apiRequest<PaginatedProductsResponse>('/products', {
      auth: false,
      cart: false,
      searchParams: params,
    }),
  )
}

/** Items requested per page while walking the catalog. */
const AUTO_PAGINATE_PAGE_SIZE = 100

/**
 * Fetches every product matching the params, following the API's `total`.
 *
 * A single request with a large `limit` would work today but re-creates the
 * original bug at a higher ceiling: the moment the catalog outgrows whatever
 * limit is hardcoded, the listing silently truncates again. Reading `total` and
 * paging until it is satisfied means the result is always the full set, whatever
 * the catalog size.
 *
 * Two backend behaviours shape this:
 *  - `limit` is clamped server-side to 100, so a larger request is not an option.
 *  - Page offsets are not fully disjoint; a product can appear in more than one
 *    page, so items are de-duplicated by `rid` before returning.
 */
/**
 * Page size the server actually used, which can be lower than requested.
 *
 * The API clamps `limit` to its own maximum and echoes back the effective value
 * in the response. Paging must be driven by that number rather than the
 * requested one, otherwise the computed page count comes up short and the tail
 * of the results is silently dropped.
 */
function effectivePageSize(response: PaginatedProductsResponse): number {
  return response.limit ?? response.items.length
}

export async function listAllProducts(
  params: Omit<ProductListParams, 'page' | 'limit'> = {},
): Promise<PaginatedProductsResponse> {
  const first = await listProducts({ ...params, page: 1, limit: AUTO_PAGINATE_PAGE_SIZE })
  const total = first.total ?? first.items.length

  if (first.items.length >= total) {
    return first
  }

  const totalPages = Math.ceil(total / effectivePageSize(first))
  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      listProducts({ ...params, page: index + 2, limit: AUTO_PAGINATE_PAGE_SIZE }),
    ),
  )

  // `rid` is optional on the card type, so fall back to `id` the same way
  // mapApiProduct does. Items without any usable identity are kept rather than
  // collapsed, since dropping them would silently lose products.
  const byIdentity = new Map<string, ApiProductCard>()
  const unidentifiable: ApiProductCard[] = []
  for (const response of [first, ...remainingPages]) {
    for (const item of response.items) {
      const identity = item.rid ?? item.id
      if (identity) {
        byIdentity.set(identity, item)
      } else {
        unidentifiable.push(item)
      }
    }
  }

  return {
    ...first,
    items: [...Array.from(byIdentity.values()), ...unidentifiable],
  }
}

export async function getFeaturedProducts(): Promise<PaginatedProductsResponse> {
  return cachedGet('products/featured', () =>
    apiRequest<PaginatedProductsResponse>('/products/featured', { auth: false, cart: false }),
  )
}

export async function getNewArrivals(
  params: { limit?: number; categoryId?: string } = {},
): Promise<PaginatedProductsResponse> {
  return cachedGet(buildCacheKey('products/new-arrivals', params), () =>
    apiRequest<PaginatedProductsResponse>('/products/new-arrivals', {
      auth: false,
      cart: false,
      searchParams: params,
    }),
  )
}

export async function getProductDetail(productRid: string): Promise<ApiProductDetailResponse> {
  return cachedGet(buildCacheKey(`products/${productRid}`), () =>
    apiRequest<ApiProductDetailResponse>(`/products/${productRid}`, { auth: false, cart: false }),
  )
}

export async function getRelatedProducts(productRid: string): Promise<PaginatedProductsResponse> {
  return cachedGet(buildCacheKey(`products/${productRid}/related`), () =>
    apiRequest<PaginatedProductsResponse>(`/products/${productRid}/related`, {
      auth: false,
      cart: false,
    }),
  )
}

export async function getProductReviews(
  productRid: string,
  page = 1,
  limit = 10,
): Promise<{ reviews: ApiProductReview[]; total: number; avgRating?: number }> {
  return cachedGet(buildCacheKey(`products/${productRid}/reviews`, { page, limit }), () =>
    apiRequest<{ reviews: ApiProductReview[]; total: number; avgRating?: number }>(
      `/products/${productRid}/reviews`,
      { auth: false, cart: false, searchParams: { page, limit } },
    ),
  )
}

export async function searchProducts(
  params: ProductSearchParams & { page?: number; limit?: number },
): Promise<PaginatedProductsResponse> {
  return cachedGet(buildCacheKey('products/search', params), () =>
    apiRequest<PaginatedProductsResponse>('/products/search', {
      auth: false,
      cart: false,
      searchParams: params,
    }),
  )
}

export async function getSearchSuggestions(q: string): Promise<SearchSuggestionsResponse> {
  return cachedGet(buildCacheKey('search/suggestions', { q }), () =>
    apiRequest<SearchSuggestionsResponse>('/search/suggestions', {
      auth: false,
      cart: false,
      searchParams: { q },
    }),
  )
}

/** One page of search results. */

/**
 * Every product matching the search, following the API's `total`.
 *
 * Same reasoning as `listAllProducts`: the endpoint caps `limit` at 100, so a
 * single oversized request is not available and paging to `total` is what keeps
 * results from silently truncating as the catalog grows.
 */
export async function searchAllProducts(
  params: ProductSearchParams,
): Promise<PaginatedProductsResponse> {
  const first = await searchProducts({ ...params, page: 1, limit: AUTO_PAGINATE_PAGE_SIZE })
  const total = first.total ?? first.items.length

  if (first.items.length >= total) {
    return first
  }

  // The server clamps `limit` to its own maximum, which is lower than the value
  // requested (it reports back the page size it actually used). Paging has to be
  // driven by that effective size, otherwise the page count comes up short and
  // the tail of the results is silently dropped.
  const pageSize = effectivePageSize(first)
  if (pageSize <= 0) {
    return first
  }

  const totalPages = Math.ceil(total / pageSize)
  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      searchProducts({ ...params, page: index + 2, limit: AUTO_PAGINATE_PAGE_SIZE }),
    ),
  )

  // Page offsets can overlap, so items are de-duplicated by identity.
  const byIdentity = new Map<string, ApiProductCard>()
  const unidentifiable: ApiProductCard[] = []
  for (const response of [first, ...remainingPages]) {
    for (const item of response.items) {
      const identity = item.rid ?? item.id
      if (identity) {
        byIdentity.set(identity, item)
      } else {
        unidentifiable.push(item)
      }
    }
  }

  return {
    ...first,
    items: [...Array.from(byIdentity.values()), ...unidentifiable],
  }
}

export async function getRecommendations(context?: string): Promise<PaginatedProductsResponse> {
  return cachedGet(buildCacheKey('products/recommendations', { context }), () =>
    apiRequest<PaginatedProductsResponse>('/products/recommendations', {
      auth: false,
      cart: false,
      searchParams: { context },
    }),
  )
}
