import { useEffect, useState } from 'react'
import { images } from '../assets/images'
import { CarouselDots } from './CarouselDots'
import ArrowLeftSLineIcon from 'remixicon-react/ArrowLeftSLineIcon'
import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon'

const heroArrowButton =
  'group flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-bg-secondary px-3 transition-colors hover:bg-orange-light active:bg-orange-light'
const heroArrowIcon =
  'size-5 text-text-secondary transition-colors group-hover:text-primary-orange'

const bannerSlides = images.hero.banners
const AUTO_PLAY_INTERVAL_MS = 5000

export function HeroSection() {
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
    // Mobile drops the section padding and the rounded corners so the carousel
    // runs edge to edge and sits behind the transparent header as a full-bleed
    // backdrop. Desktop keeps both, since the header there sits above the hero
    // rather than over it.
    <section className="lg:px-16 lg:py-6">
      <div
        className="relative h-52 overflow-hidden lg:h-80 lg:rounded-[12px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {bannerSlides.map((slide, index) => (
          <img
            key={slide}
            alt={`Hero banner slide ${index + 1}`}
            aria-hidden={index !== currentSlide}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-500 lg:rounded-[12px] ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            src={slide}
          />
        ))}

        <div className="relative hidden h-full w-full items-center justify-between px-12 lg:flex">
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

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-glass p-1 lg:bottom-4 lg:gap-2 lg:p-2">
          <CarouselDots
            count={bannerSlides.length}
            activeIndex={currentSlide}
            onSelect={setCurrentSlide}
            muted
            className="gap-1 px-0 py-0 lg:gap-2 lg:px-0 lg:py-0"
          />
        </div>
      </div>
    </section>
  )
}
