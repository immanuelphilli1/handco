import CheckLineIcon from 'remixicon-react/CheckLineIcon'
import {
  checkoutAddress,
  orderCompletedCopy,
} from '../data/cart'
import { cartRecommendations } from '../data/wishlist'
import { PageBreadcrumbs } from './PageBreadcrumbs'
import { ProductCard } from './ProductCard'

type OrderCompletedViewProps = {
  onGoHome: () => void
}

export function OrderCompletedView({ onGoHome }: OrderCompletedViewProps) {
  return (
    <>
      <PageBreadcrumbs
        onGoBack={onGoHome}
        segments={[
          { label: 'Home', onClick: onGoHome },
          { label: 'Order Completed' },
        ]}
      />

      <section className="border-t border-border-primary px-4 pb-10 pt-6 lg:px-16 lg:pt-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-8">
          <div className="rounded-xl bg-bg-secondary p-4 text-center lg:p-6">
            <div className="mx-auto flex size-32 items-center justify-center rounded-full bg-primary-green p-2">
              <CheckLineIcon className="size-24 text-text-inverse" aria-hidden />
            </div>
            <h1 className="mt-4 text-3xl font-medium leading-10 tracking-[-0.64px] text-text-primary lg:text-5xl lg:leading-14 lg:tracking-[-0.96px]">
              {orderCompletedCopy.title}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-5 tracking-[-0.32px] text-text-secondary">
              {orderCompletedCopy.description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-bg-secondary p-4">
              <p className="text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
                Order will be shipped to:
              </p>
              <p className="mt-2 text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-primary">
                {checkoutAddress.contact}
              </p>
              <div className="mt-2 flex flex-col gap-2 text-sm leading-4.5 tracking-[-0.28px] text-text-primary">
                <p>{checkoutAddress.line1}</p>
                <p>{checkoutAddress.line2}</p>
              </div>
            </div>

            <div className="rounded-xl bg-bg-secondary p-4">
              <p className="text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
                Your order Reference
              </p>
              <p className="mt-2 text-[32px] font-medium leading-10 tracking-[-0.64px] text-text-primary">
                {orderCompletedCopy.orderReference}
              </p>
              <p className="mt-2 text-sm leading-4.5 tracking-[-0.28px] text-text-primary">
                {orderCompletedCopy.estimatedDelivery}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 lg:mt-14">
          <h2 className="mb-4 text-2xl font-medium leading-8 tracking-[-0.48px] text-text-primary lg:text-[32px] lg:leading-10 lg:tracking-[-0.64px]">
            You may also like
          </h2>
          <div className="grid grid-cols-2 items-stretch gap-2 lg:grid-cols-5 lg:gap-2">
            {cartRecommendations.slice(0, 10).map((product, index) => (
              <ProductCard key={`${product.name}-${index}`} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
