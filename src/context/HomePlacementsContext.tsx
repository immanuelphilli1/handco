import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getHomePlacements, type HomeBannerPlacement } from '../api/services/catalog'
import { fallbackHeroPlacements, fallbackPromoPlacements } from '../data/homeBannerFallbacks'

type HomePlacementsContextValue = {
  hero: HomeBannerPlacement[]
  promo: HomeBannerPlacement[]
  isLoading: boolean
}

const HomePlacementsContext = createContext<HomePlacementsContextValue | null>(null)

export function HomePlacementsProvider({ children }: { children: ReactNode }) {
  const [hero, setHero] = useState<HomeBannerPlacement[]>(fallbackHeroPlacements)
  const [promo, setPromo] = useState<HomeBannerPlacement[]>(fallbackPromoPlacements)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const response = await getHomePlacements()
        if (cancelled) return

        const heroItems: HomeBannerPlacement[] = []
        const promoItems: HomeBannerPlacement[] = []
        for (const item of response.items ?? []) {
          if (item.position === 'hero') heroItems.push(item)
          else if (item.position === 'promo') promoItems.push(item)
        }
        setHero(heroItems.length > 0 ? heroItems : fallbackHeroPlacements)
        setPromo(promoItems.length > 0 ? promoItems : fallbackPromoPlacements)
      } catch {
        if (!cancelled) {
          setHero(fallbackHeroPlacements)
          setPromo(fallbackPromoPlacements)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <HomePlacementsContext.Provider value={{ hero, promo, isLoading }}>
      {children}
    </HomePlacementsContext.Provider>
  )
}

export function useHomePlacements(): HomePlacementsContextValue {
  const value = useContext(HomePlacementsContext)
  if (!value) {
    return { hero: [], promo: [], isLoading: true }
  }
  return value
}
