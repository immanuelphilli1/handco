import { images } from '../assets/images'
import type { HomeBannerPlacement } from '../api/services/catalog'

/** Shown when `GET /placements/home` is empty or unavailable (e.g. local dev). */
export const fallbackHeroPlacements: HomeBannerPlacement[] = images.hero.banners.map(
  (imageUrl, index) => ({
    rid: `fallback-hero-${index}`,
    position: 'hero',
    imageUrl,
    altText: `Hero banner slide ${index + 1}`,
    title: null,
    description: null,
    buttonText: null,
    linkUrl: null,
  }),
)

export const fallbackPromoPlacements: HomeBannerPlacement[] = [
  {
    rid: 'fallback-promo-0',
    position: 'promo',
    imageUrl: images.promo.banner,
    altText: "Promo banner",
    title: null,
    description: null,
    buttonText: null,
    linkUrl: null,
  },
  {
    rid: 'fallback-promo-1',
    position: 'promo',
    imageUrl: images.categories.fashion,
    altText: 'Fashion and apparel',
    title: null,
    description: null,
    buttonText: null,
    linkUrl: null,
  },
  {
    rid: 'fallback-promo-2',
    position: 'promo',
    imageUrl: images.categories.homeGarden,
    altText: 'Home and garden essentials',
    title: null,
    description: null,
    buttonText: null,
    linkUrl: null,
  },
]
