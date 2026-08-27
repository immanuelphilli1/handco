import { images } from '../assets/images'
import { resolveCategoryId, type SidebarCategoryId } from '../data/categoriesModal'

type CategoryCard = {
  image: string
  badge: string
  title: string
  span?: 1 | 2
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
    span: 2,
  },
]

function CategoryCardItem({
  image,
  badge,
  title,
  onOpenCategories,
}: Omit<CategoryCard, 'span'> & { onOpenCategories: (categoryId: SidebarCategoryId) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpenCategories(resolveCategoryId(title))}
      aria-label={`Browse ${title}`}
      className="category-card relative flex h-85 w-full cursor-pointer flex-col justify-between overflow-hidden rounded-[12px] border border-border-primary text-left transition-[filter] duration-300 group-hover/grid:blur-[2px] hover:blur-none"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[12px]">
        <img alt="" className="absolute size-full max-w-none rounded-[12px] object-cover" src={image} />
        <div className="absolute inset-0 rounded-[12px] bg-[rgba(0,6,7,0.2)]" />
      </div>
      <div className="relative p-8">
        <span className="inline-flex rounded-full bg-glass px-2 py-1 text-sm tracking-[-0.28px] text-text-inverse">
          {badge}
        </span>
      </div>
      <div className="relative p-8">
        <h3 className="text-2xl font-medium tracking-[-0.48px] text-text-inverse">{title}</h3>
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
    <section className="border-b border-border-primary px-4 lg:px-16">
      <div className="border-x border-border-primary px-2 py-4 lg:px-6 lg:py-10">
        <div className="group/grid grid grid-cols-1 gap-4 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.title}
              className={`transform-gpu transition-[transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-has-[.category-card:hover]/grid:scale-[0.99] hover:z-10 hover:scale-[1.02] ${
                category.span === 2 ? 'lg:col-span-2' : ''
              }`}
            >
              <CategoryCardItem
                image={category.image}
                badge={category.badge}
                title={category.title}
                onOpenCategories={onOpenCategories}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
