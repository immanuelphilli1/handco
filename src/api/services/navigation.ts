import { cachedGet } from '../cache'
import { apiRequest } from '../client'
import {
  fallbackNavigationLinks,
  type NavigationLink,
  type NavigationLinksResponse,
} from '../../data/navigationLinks'

function isNavigationLink(value: unknown): value is NavigationLink {
  if (!value || typeof value !== 'object') return false
  const { label, linkUrl } = value as Record<string, unknown>
  return (
    typeof label === 'string' &&
    label.trim() !== '' &&
    typeof linkUrl === 'string' &&
    linkUrl.trim() !== ''
  )
}

/**
 * Staff-managed shortcuts for the quick navigation bar, in display order.
 *
 * Falls back to the static list when the endpoint is missing (404 until the
 * backend ships it), fails, or returns nothing usable, so the bar is never
 * empty. The fallback is cached like a real response, so a missing endpoint
 * is not requested again on every page that mounts the header.
 */
export async function getNavigationLinks(): Promise<NavigationLink[]> {
  return cachedGet('navigation-links', async () => {
    try {
      const response = await apiRequest<NavigationLinksResponse>('/navigation-links', {
        auth: false,
        cart: false,
      })
      const items = Array.isArray(response?.items)
        ? response.items.filter(isNavigationLink)
        : []
      return items.length > 0 ? items : fallbackNavigationLinks
    } catch {
      return fallbackNavigationLinks
    }
  })
}
