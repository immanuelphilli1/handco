import { images } from '../assets/images'

type PromoBannerSectionProps = {
  onShopAllCategories: () => void
}

export function PromoBannerSection({ onShopAllCategories }: PromoBannerSectionProps) {
  return (
    <section className="border-b border-border-primary px-4 lg:px-16">
      <div className="py-6">
        <div className="relative overflow-hidden rounded-[12px] px-6 py-8 lg:px-20 lg:py-10">
          <img
            alt=""
            className="absolute inset-0 size-full object-cover"
            src={images.promo.banner}
          />
          <div className="relative flex h-50 flex-col justify-center gap-4 lg:h-100">
            <span className="inline-flex w-fit rounded-full bg-primary-green px-2 py-1 text-sm tracking-[-0.28px] text-text-inverse">
              Special Offer
            </span>
            <h2 className="max-w-xl text-2xl font-medium leading-8 tracking-[-0.48px] text-text-inverse lg:text-[32px] lg:leading-10 lg:tracking-[-0.64px]">
              Save more on the things you love.
            </h2>
            <p className="max-w-xl text-base tracking-[-0.32px] text-text-inverse">
              Explore limited-time deals and get amazing products at prices you&apos;ll love.
            </p>
            <button
              type="button"
              onClick={onShopAllCategories}
              className="flex h-12 w-fit items-center justify-center rounded-full bg-bg-secondary px-6 py-4"
            >
              <span className="text-base font-medium tracking-[-0.32px] cursor-pointer hover:text-primary-orange text-text-primary transition-colors">
                Shop the deals
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
