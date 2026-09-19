import { images } from '../assets/images'
import {
  aboutCommitmentParagraphs,
  aboutIntroParagraphs,
  aboutValues,
  aboutVisionText,
} from '../data/about'
import { getHomeFeaturedProducts, type Product } from '../data/products'
import { PageBreadcrumbs } from './PageBreadcrumbs'
import { getProductPath } from '../data/shopRoutes'
import { ProductCard } from './ProductCard'

type AboutPageContentProps = {
  onGoHome: () => void
  onProductSelect?: (product: Product) => void
}

const recommendedProducts = getHomeFeaturedProducts().slice(0, 5)

export function AboutPageContent({ onGoHome, onProductSelect }: AboutPageContentProps) {
  return (
    <main>
      <PageBreadcrumbs
        segments={[
          { label: 'Home', onClick: onGoHome },
          { label: 'About' },
        ]}
      />

      <section className="relative h-60 overflow-hidden lg:h-120">
        <img
          alt=""
          className="absolute inset-0 size-full object-cover object-[center_20%]"
          src={images.about.hero}
        />
        <div className="absolute inset-0 bg-[rgba(0,6,7,0.3)]" aria-hidden />
        <div className="relative flex h-full items-center justify-center px-4">
          <h1 className="text-center text-4xl font-semibold tracking-[-0.96px] text-text-inverse lg:text-[64px] lg:leading-18 lg:tracking-[-1.28px]">
            About Us
          </h1>
        </div>
      </section>

      <section className="border-b border-border-primary bg-bg-secondary px-4 py-10 lg:px-16 lg:py-16">
        <div className="mx-auto max-w-180 text-center text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
          {aboutIntroParagraphs.map((paragraph, index) => (
            <p key={paragraph} className={index < aboutIntroParagraphs.length - 1 ? 'mb-5' : undefined}>
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="border-b border-border-primary bg-bg-primary px-4 py-10 lg:px-16 lg:py-16">
        <div className="mx-auto flex max-w-160 flex-col gap-6 text-center">
          <h2 className="text-2xl font-medium tracking-[-0.64px] text-text-primary lg:text-[32px] lg:leading-10">
            Our Vision
          </h2>
          <p className="text-base leading-5 tracking-[-0.32px] text-text-primary">{aboutVisionText}</p>
        </div>
      </section>

      <section className="border-b border-border-primary bg-bg-primary px-4 py-10 lg:px-16 lg:py-16">
        <div className="mx-auto flex max-w-328 flex-col gap-10 lg:gap-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">
            <div className="relative min-h-64 flex-1 overflow-hidden rounded-xl bg-primary-orange lg:min-h-117.75">
              <img
                alt="Shopping cart and bag"
                className="absolute inset-0 size-full object-cover"
                src={images.about.shoppingCart}
              />
            </div>

            <div className="flex flex-1 flex-col gap-4">
              <h2 className="text-2xl font-medium tracking-[-0.48px] text-text-primary">What We Stand For</h2>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {aboutValues.map((value) => (
                  <div
                    key={value.title}
                    className={`flex flex-col gap-2 rounded-2xl bg-bg-secondary p-4 ${
                      value.wide ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <value.Icon className="size-6 shrink-0 text-text-primary" aria-hidden />
                      <h3 className="text-xl font-medium leading-6 tracking-[-0.4px] text-text-primary">
                        {value.title}
                      </h3>
                    </div>
                    <p className="text-base leading-5 tracking-[-0.32px] text-text-primary">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border-primary bg-bg-secondary px-4 py-10 lg:px-16 lg:py-16">
        <div className="mx-auto flex max-w-160 flex-col gap-6 text-center">
          <h2 className="text-2xl font-medium tracking-[-0.64px] text-text-primary lg:text-[32px] lg:leading-10">
            Our Commitment
          </h2>
          <div className="text-base leading-5 tracking-[-0.32px] text-text-primary">
            {aboutCommitmentParagraphs.map((paragraph, index) => (
              <p
                key={paragraph}
                className={index < aboutCommitmentParagraphs.length - 1 ? 'mb-5' : undefined}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border-primary px-4 lg:px-16">
        <div className="flex flex-col gap-6 py-8 lg:gap-6 lg:py-10">
          <h2 className="text-2xl font-medium tracking-[-0.48px] text-text-primary">You might like</h2>
          <div className="grid grid-cols-2 items-stretch gap-2 lg:grid-cols-5">
            {recommendedProducts.map((product, index) => (
              <ProductCard
                key={`${product.id}-${index}`}
                product={product}
                enableAddButton
                to={getProductPath(product.id, { from: 'home' })}
                onClick={onProductSelect ? () => onProductSelect(product) : undefined}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
