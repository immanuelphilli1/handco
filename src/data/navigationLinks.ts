/**
 * Shortcut links for the quick navigation bar under the search field.
 *
 * Staff edit this list in the admin and the storefront reads it from
 * `GET /navigation-links` (`{ items: [{ label, linkUrl }] }`, already in display
 * order). Until that endpoint is live, or whenever it fails, the bar falls back
 * to this static list. It uses the same shape, so the two can be swapped freely.
 *
 * A `linkUrl` is either a storefront path (`/categories/fashion`) or a full URL.
 * `BannerLink` decides between a router link and a plain anchor.
 */
export type NavigationLink = {
  label: string
  linkUrl: string
}

export type NavigationLinksResponse = {
  items: NavigationLink[]
}

export const fallbackNavigationLinks: NavigationLink[] = [
  { label: 'New Arrivals', linkUrl: '/categories/new-releases' },
  { label: 'Best Sellers', linkUrl: '/categories/featured' },
  { label: "Women's Dresses", linkUrl: '/categories/fashion-women' },
  { label: 'Sneakers', linkUrl: '/categories/fashion-shoes-sneakers' },
  { label: 'Bags', linkUrl: '/categories/accessories-bags' },
  { label: 'Jewelry', linkUrl: '/categories/accessories-jewelry' },
  { label: 'Phone Accessories', linkUrl: '/categories/electronics-phones-tablets' },
  { label: 'Home Decor', linkUrl: '/categories/decor' },
  { label: 'Smart Gadgets', linkUrl: '/categories/electronics-wearables' },
  { label: 'Deals', linkUrl: '/categories/deals' },
]
