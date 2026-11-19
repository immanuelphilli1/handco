import type { HomeBannerPlacement } from '../api/services/catalog'

/**
 * From this width the desktop banner is shown. It matches Tailwind's `md`, which
 * the banner sections use to switch from the mobile layout to the fixed-height
 * one. A portrait mobile image is not used on tablets: at 768 to 1023px it
 * would render taller than the screen, while the desktop banner already fits.
 */
const DESKTOP_BANNER_MEDIA = '(min-width: 768px)'

type BannerPictureProps = {
  slide: Pick<HomeBannerPlacement, 'imageUrl' | 'mobileImageUrl' | 'altText'>
  className: string
  isHidden: boolean
}

/** A home placement image that swaps in the mobile crop on phones, when one exists. */
export function BannerPicture({ slide, className, isHidden }: BannerPictureProps) {
  return (
    <picture className="contents">
      <source media={DESKTOP_BANNER_MEDIA} srcSet={slide.imageUrl} />
      <img
        alt={slide.altText}
        aria-hidden={isHidden}
        className={className}
        src={slide.mobileImageUrl ?? slide.imageUrl}
      />
    </picture>
  )
}
