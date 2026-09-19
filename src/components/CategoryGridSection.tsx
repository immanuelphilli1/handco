import { images } from '../assets/images'
import { resolveCategoryId, type SidebarCategoryId } from '../data/categoriesModal'

type CategoryCard = {
  image: string
  badge: string
  title: string
}

const categories: CategoryCard[] = [
  { image: images.categories.electronics, badge: '14 New arrivals', title: 'Electronics & Tech' },
  { image: images.categories.furniture, badge: '5 New arrivals', title: 'Furniture' },
  { image: images.categories.accessories, badge: '30 New arrivals', title: 'Accessories' },
  { image: images.categories.decor, badge: '30 New arrivals', title: 'Decor' },
  {
    image: images.categories.fashion,
    badge: '30 New arrivals',
    title: 'Fashion & Accessories',
  },
  { image: images.categories.fashion, badge: '30 New arrivals', title: 'Home & Garden' },
]

function CategoryCardItem({
  image,
  badge,
  title,
  onOpenCategories,
  className = '',
}: CategoryCard & {
  onOpenCategories: (categoryId: SidebarCategoryId) => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenCategories(resolveCategoryId(title))}
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
  onOpenCategories: (categoryId: SidebarCategoryId) => void
}) {
  return (
    <section className="px-4 lg:px-16">
      <div className="py-4 lg:py-6">
        <div className="flex gap-2 overflow-x-auto scroll-smooth [-ms-overflow-style:none] scrollbar-none lg:grid lg:grid-cols-6 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <div key={category.title} className="shrink-0 lg:min-w-0 lg:shrink">
              <CategoryCardItem
                image={category.image}
                badge={category.badge}
                title={category.title}
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
