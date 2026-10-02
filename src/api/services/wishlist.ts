import { apiRequest } from '../client'
import type { PaginatedProductsResponse } from '../types'

export async function getWishlist(params: {
  category?: string
  minRating?: number
} = {}): Promise<PaginatedProductsResponse> {
  return apiRequest<PaginatedProductsResponse>('/wishlist', { searchParams: params })
}

export async function getWishlistCategories(): Promise<{ categories: string[] }> {
  return apiRequest<{ categories: string[] }>('/wishlist/categories')
}

export async function addToWishlist(productRid: string): Promise<void> {
  await apiRequest<void>(`/wishlist/${productRid}`, { method: 'POST' })
}

export async function removeFromWishlist(productRid: string): Promise<void> {
  await apiRequest<void>(`/wishlist/${productRid}`, { method: 'DELETE' })
}
