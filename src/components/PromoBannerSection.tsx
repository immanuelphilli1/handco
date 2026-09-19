import { images } from '../assets/images'

type PromoBannerSectionProps = {
  onShopAllCategories: () => void
}

export function PromoBannerSection({ onShopAllCategories: _onShopAllCategories }: PromoBannerSectionProps) {
  const promoSlide = images.promo.banner

  return (
    <section className="border-b border-border-primary px-4 lg:px-16">
      <div className="relative py-6">

        <div className="relative overflow-hidden rounded-[12px]">
          <div className="relative flex h-60 flex-col justify-center overflow-hidden px-6 py-8 lg:h-80 lg:px-20 lg:py-10">
            <img alt="" className="absolute inset-0 size-full object-cover" src={promoSlide} />

            <div className="relative flex flex-col justify-center gap-4">
              <span className="inline-flex w-fit rounded-full bg-primary-green px-2 py-1 text-sm tracking-[-0.28px] text-text-inverse">
                Special Offer
              </span>
              <h2 className="max-w-50 lg:max-w-xl text-xl lg:text-2xl font-medium leading-8 tracking-[-0.48px] text-text-inverse lg:text-[32px] lg:leading-10 lg:tracking-[-0.64px]">
                Save more on the things you love.
              </h2>
              <p className="max-w-50 lg:max-w-xl text-base tracking-[-0.32px] text-text-inverse">
                Explore limited-time deals and get amazing products at prices you&apos;ll love.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
