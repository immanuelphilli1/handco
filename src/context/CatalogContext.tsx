import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { catalogApi } from '../api'
import { mapApiProduct } from '../api/mappers'
import type { ApiCategory, ProductFacets } from '../api/types'
import type { Product } from '../data/products'

type CatalogContextValue = {
  categories: ApiCategory[]
  featuredProducts: Product[]
  newArrivalProducts: Product[]
  /**
   * The whole catalog, paged to completion. The listing page needs the complete
   * set because filters are applied client-side, and because the API's default
   * page size would otherwise truncate the result.
   */
  allProducts: Product[]
  /** Live facet values (brands, colors, delivery, screen sizes) from the API. */
  facets: ProductFacets
  isReady: boolean
}

const emptyFacets: ProductFacets = {
  brands: [],
  colors: [],
  deliveryOptions: [],
  screenSizes: [],
}

const CatalogContext = createContext<CatalogContextValue | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [newArrivalProducts, setNewArrivalProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [facets, setFacets] = useState<ProductFacets>(emptyFacets)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadCatalog() {
      try {
        const [categoriesResponse, newArrivalsResponse, featuredResponse, allResponse] =
          await Promise.all([
            catalogApi.getCategories(),
            catalogApi.getNewArrivals({ limit: 100 }),
            catalogApi.getFeaturedProducts(),
            catalogApi.listAllProducts(),
          ])

        if (cancelled) {
          return
        }

        setCategories(categoriesResponse.categories)
        setNewArrivalProducts(newArrivalsResponse.items.map(mapApiProduct))
        setFeaturedProducts(featuredResponse.items.map(mapApiProduct))
        setAllProducts(allResponse.items.map(mapApiProduct))
        setFacets(allResponse.facets ?? emptyFacets)
      } catch {
        if (!cancelled) {
          setCategories([])
          setNewArrivalProducts([])
          setFeaturedProducts([])
          setAllProducts([])
          setFacets(emptyFacets)
        }
      } finally {
        if (!cancelled) {
          setIsReady(true)
        }
      }
    }

    void loadCatalog()

    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({
      categories,
      featuredProducts,
      newArrivalProducts,
      allProducts,
      facets,
      isReady,
    }),
    [allProducts, categories, facets, featuredProducts, isReady, newArrivalProducts],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) {
    throw new Error('useCatalog must be used within CatalogProvider')
  }
  return context
}
