import { useMemo } from 'react'
import { images } from '../assets/images'
import { useCatalog } from '../context/CatalogContext'
import { sidebarCategories, type SidebarCategoryId } from '../data/categoriesModal'
import { getCategoryNodeId } from '../data/catalogCategories'

const GRID_CATEGORY_IDS = [
  'electronics',
  'furniture',
  'accessories',
  'decor',
  'fashion',
  'home-garden',
] as const satisfies readonly SidebarCategoryId[]

type GridCategoryId = (typeof GRID_CATEGORY_IDS)[number]

type CategoryGridCard = {
  id: GridCategoryId
  image: string
  badge: string
  title: string
}

const categoryImages: Record<GridCategoryId, string> = {
  electronics: images.categories.electronics,
  furniture: images.categories.furniture,
  accessories: images.categories.accessories,
  decor: images.categories.decor,
  fashion: images.categories.fashion,
  'home-garden': images.categories.homeGarden,
}

function getFallbackTitle(categoryId: GridCategoryId): string {
  return sidebarCategories.find((category) => category.id === categoryId)?.label ?? categoryId
}

function formatProductBadge(count: number): string {
  if (count === 1) {
    return '1 Product'
  }

  return `${count} Products`
}

/**
 * Counts catalog products per grid category.
 *
 * Products carry a leaf categoryId (e.g. "electronics-headphones-audio") while
 * the grid shows roots (e.g. "electronics"), so the prefix is matched instead of
 * an exact comparison. This is what the badge reports: the number of products
 * actually in that category, not how many happen to be new arrivals.
 */
function countProductsByCategory(
  items: Array<{ categoryId?: string }>,
): Partial<Record<GridCategoryId, number>> {
  const counts: Partial<Record<GridCategoryId, number>> = {}

  for (const item of items) {
    const categoryId = item.categoryId
    if (!categoryId) {
      continue
    }

    const gridCategoryId = GRID_CATEGORY_IDS.find(
      (id) => categoryId === id || categoryId.startsWith(`${id}-`),
    )

    if (!gridCategoryId) {
      continue
    }

    counts[gridCategoryId] = (counts[gridCategoryId] ?? 0) + 1
  }

  return counts
}

function buildCategoryGridCards(
  apiLabels: Partial<Record<GridCategoryId, string>>,
  productCounts: Partial<Record<GridCategoryId, number>>,
): CategoryGridCard[] {
  return GRID_CATEGORY_IDS.map((id) => ({
    id,
    image: categoryImages[id],
    badge: formatProductBadge(productCounts[id] ?? 0),
    title: apiLabels[id] ?? getFallbackTitle(id),
  }))
}

const fallbackCategories = buildCategoryGridCards({}, {})

function CategoryCardItem({
  id,
  image,
  badge,
  title,
  onOpenCategories,
  className = '',
}: CategoryGridCard & {
  onOpenCategories: (categoryId: SidebarCategoryId, label: string) => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenCategories(id, title)}
      aria-label={`Browse ${title}`}
      className={`relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-lg border border-border-primary text-left ${className}`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <img alt="" className="absolute size-full object-cover" src={image} />
        <div className="absolute inset-0 bg-[rgba(0,6,7,0.2)]" />
      </div>
      <div className="relative p-4">
        <span className="inline-flex rounded-full bg-glass px-2 py-1 text-xs font-medium tracking-[-0.24px] text-text-inverse">
          {badge}
        </span>
      </div>
      <div className="relative p-4">
        <h3 className="text-sm font-medium tracking-[-0.28px] text-text-inverse">{title}</h3>
      </div>
    </button>
  )
}

export function CategoryGridSection({
  onOpenCategories,
}: {
  onOpenCategories: (categoryId: SidebarCategoryId, label?: string) => void
}) {
  const { categories: apiCategories, allProducts, isReady } = useCatalog()

  const categories = useMemo(() => {
    if (!isReady) {
      return fallbackCategories
    }

    // Keyed by `slug`, the wire field the API uses for the category id (see
    // `getCategoryNodeId`). Reading `.id` yielded `undefined` for every
    // category, so all cards fell back to their static labels.
    const apiLabels = Object.fromEntries(
      apiCategories.map((category) => [getCategoryNodeId(category), category.label]),
    ) as Partial<Record<GridCategoryId, string>>

    return buildCategoryGridCards(apiLabels, countProductsByCategory(allProducts))
  }, [allProducts, apiCategories, isReady])

  return (
    <section className="px-4 lg:px-16">
      <h2 className="text-base pt-6 lg:pt-0 font-medium leading-6 tracking-[-0.32px] text-text-primary lg:text-2xl lg:leading-10 lg:tracking-[-0.64px]">Shop by Category</h2>
      <div className="py-4 lg:py-6">
        <div className="flex gap-2 overflow-x-auto scroll-smooth [-ms-overflow-style:none] scrollbar-none lg:grid lg:grid-cols-6 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <div key={category.id} className="shrink-0 lg:min-w-0 lg:shrink">
              <CategoryCardItem
                {...category}
                onOpenCategories={onOpenCategories}
                className="size-40 lg:aspect-square lg:size-auto lg:w-full"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
