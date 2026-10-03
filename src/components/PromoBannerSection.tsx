import { useEffect, useState } from 'react'
import { images } from '../assets/images'
import { CarouselDots } from './CarouselDots'
import ArrowLeftSLineIcon from 'remixicon-react/ArrowLeftSLineIcon'
import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon'

type PromoBannerSectionProps = {
  onShopAllCategories: () => void
}

/**
 * Offer copy per slide. The images are borrowed from the hero/category art
 * because the project ships a single promo banner; each slide pairs an image
 * with its own offer so the rotation reads as distinct promotions rather than
 * the same banner repeating. Add an entry here to add a slide.
 *
 * `fashion` and `home-garden` are used deliberately: the hero carousel already
 * shows furniture, electronics, decor and accessories, so reusing those here
 * would put identical images next to each other on the same page.
 */
const promoSlides = [
  {
    image: images.promo.banner,
    alt: 'Limited-time offers across the store',
    badge: 'Special Offer',
    title: 'Save more on the things you love.',
    description: "Explore limited-time deals and get amazing products at prices you'll love.",
  },
  {
    image: images.categories.fashion,
    alt: 'Fashion and apparel for the whole family',
    badge: 'Fashion Deal',
    title: 'Style for every season.',
    description: 'Refresh your wardrobe with trending pieces at prices you will not find in store.',
  },
  {
    image: images.categories.homeGarden,
    alt: 'Home and garden essentials',
    badge: 'Home & Garden',
    // title: 'Make home feel like yours.',
    // description: 'Hand-picked furniture and garden essentials, delivered to your door.',
  },
] as const

const AUTO_PLAY_INTERVAL_MS = 5000

const promoArrowButton =
  'group flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-bg-secondary px-3 transition-colors hover:bg-orange-light active:bg-orange-light'
const promoArrowIcon =
  'size-5 text-text-secondary transition-colors group-hover:text-primary-orange'

/**
 * Promotional carousel. Matches `HeroSection`: the same banner height
 * (`h-40 lg:h-80`), the same crossfade, the same desktop arrows, the same dots,
 * the same 5s auto-play that pauses on hover.
 */
export function PromoBannerSection({ onShopAllCategories: _onShopAllCategories }: PromoBannerSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const showPreviousSlide = () => {
    setCurrentSlide((slide) => (slide - 1 + promoSlides.length) % promoSlides.length)
  }

  const showNextSlide = () => {
    setCurrentSlide((slide) => (slide + 1) % promoSlides.length)
  }

  useEffect(() => {
    if (isPaused) return

    const intervalId = window.setInterval(() => {
      setCurrentSlide((slide) => (slide + 1) % promoSlides.length)
    }, AUTO_PLAY_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [isPaused])

  const activeSlide = promoSlides[currentSlide]

  return (
    <section className="border-b border-border-primary p-4 lg:px-16 lg:py-6">
      <div
        className="relative h-40 overflow-hidden rounded-[12px] lg:h-80"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {promoSlides.map((slide, index) => (
          <img
            key={slide.image}
            alt={slide.alt}
            aria-hidden={index !== currentSlide}
            className={`absolute inset-0 size-full rounded-[12px] object-cover transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            src={slide.image}
          />
        ))}

        {/* Offer copy sits over the active image only, so it does not sit on top
            of the outgoing slide during the crossfade. */}
        <div
          key={activeSlide.image}
          className="relative flex h-full flex-col justify-center overflow-hidden px-6 py-8 transition-opacity duration-500 lg:px-20 lg:py-10"
        >
          <div className="flex flex-col justify-center gap-4">
            <span className="inline-flex w-fit rounded-full bg-primary-green px-2 py-1 text-sm tracking-[-0.28px] text-text-inverse">
              {activeSlide.badge}
            </span>
            {/* <h2 className="max-w-50 text-xl font-medium leading-8 tracking-[-0.48px] text-text-inverse lg:max-w-xl lg:text-[32px] lg:leading-10 lg:tracking-[-0.64px]">
              {activeSlide.title}
            </h2>
            <p className="max-w-50 text-base tracking-[-0.32px] text-text-inverse lg:max-w-xl">
              {activeSlide.description}
            </p> */}
          </div>
        </div>

        <div className="absolute inset-y-0 left-12 hidden w-12 items-center lg:flex">
          <button
            type="button"
            onClick={showPreviousSlide}
            className={promoArrowButton}
            aria-label="Previous offer"
          >
            <ArrowLeftSLineIcon className={promoArrowIcon} aria-hidden />
          </button>
        </div>
        <div className="absolute inset-y-0 right-12 hidden w-12 items-center lg:flex">
          <button
            type="button"
            onClick={showNextSlide}
            className={promoArrowButton}
            aria-label="Next offer"
          >
            <ArrowRightSLineIcon className={promoArrowIcon} aria-hidden />
          </button>
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-glass p-1 lg:bottom-4 lg:gap-2 lg:p-2">
          <CarouselDots
            count={promoSlides.length}
            activeIndex={currentSlide}
            onSelect={setCurrentSlide}
            className="gap-1 px-0 py-0 lg:gap-2 lg:px-0 lg:py-0"
          />
        </div>
      </div>
    </section>
  )
}