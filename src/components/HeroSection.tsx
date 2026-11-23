import { useEffect, useState } from 'react'
import { BannerPicture } from './BannerPicture'
import { CarouselDots } from './CarouselDots'
import { useHomePlacements } from '../context/HomePlacementsContext'
import { BannerLink } from '../utils/bannerLink'
import ArrowLeftSLineIcon from 'remixicon-react/ArrowLeftSLineIcon'
import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon'

const heroArrowButton =
  'group flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-bg-secondary px-3 transition-colors hover:bg-orange-light active:bg-orange-light'
const heroArrowIcon =
  'size-5 text-text-secondary rtl:-scale-x-100 transition-colors group-hover:text-primary-orange'

const AUTO_PLAY_INTERVAL_MS = 5000

export function HeroSection() {
  const { hero: bannerSlides } = useHomePlacements()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    setCurrentSlide(0)
  }, [bannerSlides.length])

  const showPreviousSlide = () => {
    if (bannerSlides.length === 0) return
    setCurrentSlide((slide) => (slide - 1 + bannerSlides.length) % bannerSlides.length)
  }

  const showNextSlide = () => {
    if (bannerSlides.length === 0) return
    setCurrentSlide((slide) => (slide + 1) % bannerSlides.length)
  }

  useEffect(() => {
    if (isPaused || bannerSlides.length <= 1) return

    const intervalId = window.setInterval(() => {
      setCurrentSlide((slide) => (slide + 1) % bannerSlides.length)
    }, AUTO_PLAY_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [bannerSlides.length, isPaused])

  if (bannerSlides.length === 0) {
    return null
  }

  // Phones (below md) show the hero at 3:2 or 1:1. A mobile image sets its own
  // height, so a 3:2 or a 1:1 upload shows whole; anything taller is cropped to
  // a square (`max-h-[100vw]`, the hero is full width on phones). The slides
  // share one grid cell, so the frame takes the tallest slide and does not jump
  // as the carousel turns; a slide without a mobile image covers that frame.
  // With no mobile images at all, the frame is 3:2. From md up every slide goes
  // back to the fixed-height banner.
  const hasMobileImages = bannerSlides.some((slide) => slide.mobileImageUrl)
  const slideWrapperClass = hasMobileImages
    ? 'relative col-start-1 row-start-1 block md:absolute md:inset-0'
    : 'absolute inset-0 block'

  return (
    <section className="lg:px-16 lg:py-6">
      <div
        className={
          hasMobileImages
            ? 'relative grid grid-cols-1 overflow-hidden md:block md:h-52 lg:h-80 lg:rounded-[12px]'
            : 'relative aspect-[3/2] overflow-hidden md:aspect-auto md:h-52 lg:h-80 lg:rounded-[12px]'
        }
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {bannerSlides.map((slide, index) => {
          const sizeClass =
            hasMobileImages && slide.mobileImageUrl
              ? 'block h-auto max-h-[100vw] w-full object-cover md:absolute md:inset-0 md:size-full md:max-h-none'
              : 'absolute inset-0 size-full object-cover'
          const image = (
            <BannerPicture
              slide={slide}
              isHidden={index !== currentSlide}
              className={`${sizeClass} transition-opacity duration-500 lg:rounded-[12px] ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )

          return slide.linkUrl ? (
            <BannerLink
              key={slide.rid}
              linkUrl={slide.linkUrl}
              className={slideWrapperClass}
            >
              {image}
            </BannerLink>
          ) : (
            <div key={slide.rid} className={slideWrapperClass}>
              {image}
            </div>
          )
        })}

        {bannerSlides.length > 1 ? (
          <>
            <div className="relative hidden h-full w-full items-end justify-between px-4 pb-2.5 opacity-50 lg:flex">
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
          </>
        ) : null}
      </div>
    </section>
  )
}
