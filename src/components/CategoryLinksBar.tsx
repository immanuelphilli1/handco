import AlarmWarningLineIcon from 'remixicon-react/AlarmWarningLineIcon'
import ComputerLineIcon from 'remixicon-react/ComputerLineIcon'
import HammerLineIcon from 'remixicon-react/HammerLineIcon'
import LightbulbFlashLineIcon from 'remixicon-react/LightbulbFlashLineIcon'
import PriceTag3LineIcon from 'remixicon-react/PriceTag3LineIcon'
import StarLineIcon from 'remixicon-react/StarLineIcon'
import TShirt2LineIcon from 'remixicon-react/TShirt2LineIcon'
import { images } from '../assets/images'
import type { SidebarCategoryId } from '../data/categoriesModal'
import { Icon } from './Icon'

type RemixIcon = typeof PriceTag3LineIcon

type CategoryLink = {
  /** Canonical sidebar id. Matched by id so backend label changes can't break it. */
  id: SidebarCategoryId
  label: string
  icon?: RemixIcon
  imageIcon?: string
}

const featuredLink: CategoryLink = {
  id: 'featured',
  label: 'Featured',
  icon: StarLineIcon,
}

const categoryLinks: CategoryLink[] = [
  { id: 'featured', label: 'Best Sellers', icon: PriceTag3LineIcon },
  { id: 'new-releases', label: 'New Releases', icon: AlarmWarningLineIcon },
  { id: 'electronics', label: 'Electronics & Tech', icon: ComputerLineIcon },
  { id: 'fashion', label: 'Fashion & Accessories', icon: TShirt2LineIcon },
  { id: 'home-garden', label: 'Home & Garden', imageIcon: images.hero.sofa },
  { id: 'energy', label: 'Energy & Power', icon: LightbulbFlashLineIcon },
  { id: 'construction', label: 'Construction & Tools', icon: HammerLineIcon },
]

function CategoryLinkIcon({
  category,
  isActive,
}: {
  category: CategoryLink
  isActive: boolean
}) {
  const iconClassName = `size-6 shrink-0 transition-colors ${
    isActive ? 'text-primary-orange' : 'text-text-secondary group-hover:text-primary-orange'
  }`

  if (category.imageIcon) {
    return <Icon src={category.imageIcon} className={iconClassName} />
  }

  const CategoryIcon = category.icon!
  return <CategoryIcon className={iconClassName} aria-hidden />
}

type CategoryLinksBarProps = {
  onOpenCategories: (categoryId: SidebarCategoryId, label: string) => void
  activeCategoryId?: SidebarCategoryId
  isCategoriesOpen?: boolean
}

export function CategoryLinksBar({
  onOpenCategories,
  activeCategoryId = 'featured',
  isCategoriesOpen = false,
}: CategoryLinksBarProps) {
  const visibleLinks = isCategoriesOpen ? [featuredLink, ...categoryLinks] : categoryLinks

  return (
    <section className="hidden border-b border-border-primary bg-bg-primary px-4 lg:block lg:px-14">
      <div className="py-2 max-w-380 mx-auto">
        <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
          {visibleLinks.map((category) => {
            const isActive = isCategoriesOpen && category.id === activeCategoryId

            return (
              <button
                key={category.label}
                type="button"
                onClick={() => onOpenCategories(category.id, category.label)}
                className={`group flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-lg p-4 transition-colors ${
                  isActive ? 'bg-orange-light' : 'hover:bg-orange-light'
                }`}
              >
                <CategoryLinkIcon category={category} isActive={isActive} />
                <span
                  className={`whitespace-nowrap text-base font-medium tracking-[-0.32px] transition-colors ${
                    isActive
                      ? 'text-primary-orange'
                      : 'text-text-secondary group-hover:text-primary-orange'
                  }`}
                >
                  {category.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
