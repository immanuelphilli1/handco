import { useEffect, useState } from 'react'
import { images } from '../assets/images'
import { resolveCategoryId, type SidebarCategoryId } from '../data/categoriesModal'
import AlarmWarningLineIcon from 'remixicon-react/AlarmWarningLineIcon'
import ArrowLeftSLineIcon from 'remixicon-react/ArrowLeftSLineIcon'
import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon'
import ComputerLineIcon from 'remixicon-react/ComputerLineIcon'
import HammerLineIcon from 'remixicon-react/HammerLineIcon'
import LightbulbFlashLineIcon from 'remixicon-react/LightbulbFlashLineIcon'
import PlantLineIcon from 'remixicon-react/PlantLineIcon'
import PriceTag3LineIcon from 'remixicon-react/PriceTag3LineIcon'
import StarLineIcon from 'remixicon-react/StarLineIcon'
import TShirt2LineIcon from 'remixicon-react/TShirt2LineIcon'

type RemixIcon = typeof StarLineIcon

const heroCategoryButton =
  'group flex h-12 w-full cursor-pointer items-center gap-2 rounded-lg p-4 text-left transition-colors hover:bg-orange-light active:bg-bg-primary'
const heroCategoryIcon =
  'size-6 shrink-0 text-text-secondary transition-colors group-hover:text-primary-orange'

const categories: { label: string; icon: RemixIcon }[] = [
  { label: 'Best Sellers', icon: PriceTag3LineIcon },
  { label: 'New Releases', icon: AlarmWarningLineIcon },
  { label: 'Electronics & Tech', icon: ComputerLineIcon },
  { label: 'Fashion & Accessories', icon: TShirt2LineIcon },
  { label: 'Home & Garden', icon: PlantLineIcon },
  { label: 'Construction & Tools', icon: HammerLineIcon },
  { label: 'Energy & Power', icon: LightbulbFlashLineIcon },
]

const heroArrowButton =
  'group flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-bg-secondary px-3 transition-colors hover:bg-orange-light active:bg-orange-light'
const heroArrowIcon =
  'size-5 text-text-secondary transition-colors group-hover:text-primary-orange'

const bannerSlides = images.hero.banners
const AUTO_PLAY_INTERVAL_MS = 5000

type HeroSectionProps = {
  onOpenCategories: (categoryId: SidebarCategoryId) => void
  onShopAllCategories: () => void
}

export function HeroSection({ onOpenCategories, onShopAllCategories }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const showPreviousSlide = () => {
    setCurrentSlide((slide) => (slide - 1 + bannerSlides.length) % bannerSlides.length)
  }

  const showNextSlide = () => {
    setCurrentSlide((slide) => (slide + 1) % bannerSlides.length)
  }

  useEffect(() => {
    if (isPaused) return

    const intervalId = window.setInterval(() => {
      setCurrentSlide((slide) => (slide + 1) % bannerSlides.length)
    }, AUTO_PLAY_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [isPaused])

  return (
    <section className="border-b border-border-primary p-4 lg:px-16">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:py-10">
        <nav className="hidden w-66 shrink-0 flex-col overflow-hidden rounded-[12px] bg-bg-secondary lg:flex">
          {categories.map((category) => {
            const CategoryIcon = category.icon

            return (
              <button
                key={category.label}
                type="button"
                onClick={() => onOpenCategories(resolveCategoryId(category.label))}
                className={heroCategoryButton}
              >
                <CategoryIcon className={heroCategoryIcon} aria-hidden />
                <span className="min-w-0 flex-1 text-base font-medium tracking-[-0.32px] group-hover:text-primary-orange text-text-secondary transition-colors">
                  {category.label}
                </span>
                <ArrowRightSLineIcon
                  className={`size-6 shrink-0 text-text-secondary transition-colors group-hover:text-primary-orange`}
                  aria-hidden
                />
              </button>
            )
          })}
        </nav>

        <div
          className="relative flex h-70 w-full flex-col justify-center overflow-hidden rounded-[12px] p-4 lg:h-84 lg:min-w-0 lg:flex-1 lg:px-12 lg:py-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {bannerSlides.map((slide, index) => (
            <img
              key={slide}
              alt={`Hero banner slide ${index + 1}`}
              aria-hidden={index !== currentSlide}
              className={`absolute inset-0 size-full rounded-[12px] object-cover transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              src={slide}
            />
          ))}
          <div className="relative flex w-full items-center justify-between">
            <button
              type="button"
              onClick={showPreviousSlide}
              className={heroArrowButton}
              aria-label="Previous slide"
            >
              <ArrowLeftSLineIcon className={heroArrowIcon} aria-hidden />
            </button>
            <button
              type="button"
              onClick={showNextSlide}
              className={heroArrowButton}
              aria-label="Next slide"
            >
              <ArrowRightSLineIcon className={heroArrowIcon} aria-hidden />
            </button>
          </div>
        </div>

        <div className="relative flex h-70 w-full shrink-0 flex-col justify-end overflow-hidden rounded-[12px] border border-border-primary lg:h-84 lg:w-66">
          <img
            alt="New arrivals headphones"
            className="absolute inset-0 size-full rounded-[12px] object-cover"
            src={images.hero.newArrivalsCard}
          />
          <div className="relative flex flex-col gap-4 p-4">
            <h2 className="text-2xl font-medium tracking-[-0.48px] text-text-inverse">New Arrivals</h2>
            <button
              type="button"
              onClick={onShopAllCategories}
              className="flex h-12 w-fit items-center justify-center rounded-full bg-bg-secondary px-6 py-4"
            >
              <span className="text-base font-medium tracking-[-0.32px] cursor-pointer hover:text-primary-orange text-text-primary transition-colors">Shop Now</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
