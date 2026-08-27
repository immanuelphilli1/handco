import { useRef, useState } from 'react'
import ArrowLeftSLineIcon from 'remixicon-react/ArrowLeftSLineIcon'
import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon'
import BankCardLineIcon from 'remixicon-react/BankCardLineIcon'
import CalendarEventLineIcon from 'remixicon-react/CalendarEventLineIcon'
import EditBoxLineIcon from 'remixicon-react/EditBoxLineIcon'
import LockLineIcon from 'remixicon-react/LockLineIcon'
import {
  checkoutAddress,
  checkoutPaymentMethods,
  shippingSummary,
  type CheckoutPaymentMethodId,
} from '../data/cart'
import { checkoutCarouselProducts } from '../data/wishlist'
import { useShop } from '../context/ShopContext'
import { OrderSummaryPanel } from './OrderSummaryPanel'
import { PageBreadcrumbs } from './PageBreadcrumbs'
import { ProductCard } from './ProductCard'

type CheckoutViewProps = {
  onGoHome: () => void
  onSubmitOrder: () => void
}

function PaymentRadio({
  selected,
  onSelect,
  label,
}: {
  selected: boolean
  onSelect: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={label}
      aria-pressed={selected}
      className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 ${
        selected ? 'border-text-primary bg-text-primary' : 'border-border-secondary bg-bg-primary'
      }`}
    >
      {selected ? <span className="size-3 rounded-full bg-bg-primary" aria-hidden /> : null}
    </button>
  )
}

function CardPaymentFields() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-primary">
      <label className="flex h-14 items-center border-b border-border-primary">
        <BankCardLineIcon className="ml-4 size-6 shrink-0 text-text-secondary" aria-hidden />
        <input
          type="text"
          placeholder="0000 0000 0000 0000"
          className="min-w-0 flex-1 bg-transparent px-4 text-base font-medium leading-5 tracking-[-0.32px] text-text-primary outline-none placeholder:font-medium placeholder:text-text-secondary"
        />
      </label>
      <div className="flex">
        <label className="flex h-14 min-w-0 flex-1 items-center border-r border-border-primary">
          <CalendarEventLineIcon className="ml-4 size-6 shrink-0 text-text-secondary" aria-hidden />
          <input
            type="text"
            placeholder="mm/yyyy"
            className="min-w-0 flex-1 bg-transparent px-4 text-base font-medium leading-5 tracking-[-0.32px] text-text-primary outline-none placeholder:font-medium placeholder:text-text-secondary"
          />
        </label>
        <label className="flex h-14 min-w-0 flex-1 items-center">
          <LockLineIcon className="ml-4 size-6 shrink-0 text-text-secondary" aria-hidden />
          <input
            type="password"
            placeholder="CVC"
            className="min-w-0 flex-1 bg-transparent px-4 text-base font-medium leading-5 tracking-[-0.32px] text-text-primary outline-none placeholder:font-medium placeholder:text-text-secondary"
          />
        </label>
      </div>
    </div>
  )
}

export function CheckoutView({ onGoHome, onSubmitOrder }: CheckoutViewProps) {
  const { cartItemCount } = useShop()
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethodId>('card')
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (direction: 'prev' | 'next') => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction === 'next' ? 280 : -280, behavior: 'smooth' })
  }

  return (
    <>
      <PageBreadcrumbs
        onGoBack={onGoHome}
        segments={[
          { label: 'Home', onClick: onGoHome },
          { label: 'Cart' },
        ]}
      />

      <section className="border-t border-border-primary px-4 pb-10 pt-6 lg:px-16 lg:pt-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-14">
          <div className="min-w-0 flex-1">
            <section className="border-b border-border-primary py-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold leading-6 tracking-[-0.4px] text-text-primary">
                  Shipping address
                </h2>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-1 rounded-full bg-bg-secondary px-4 py-2 text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-primary"
                >
                  Change address
                  <ArrowRightSLineIcon className="size-6 text-text-secondary" aria-hidden />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="flex gap-4 rounded-xl bg-bg-secondary p-4">
                  <div className="min-w-0 flex-1 text-sm leading-4.5 tracking-[-0.28px] text-text-primary">
                    <p className="font-medium">{checkoutAddress.contact}</p>
                    <div className="mt-2 flex flex-col gap-2 font-normal">
                      <p>{checkoutAddress.line1}</p>
                      <p>{checkoutAddress.line2}</p>
                    </div>
                  </div>
                  <EditBoxLineIcon className="size-6 shrink-0 text-text-secondary" aria-hidden />
                </div>
                <div className="rounded-xl bg-bg-secondary p-4 text-sm leading-4.5 tracking-[-0.28px] text-text-primary">
                  <p className="font-medium">Shipping: {shippingSummary.fee}</p>
                  <div className="mt-2 flex flex-col gap-2 font-normal">
                    <p>{shippingSummary.deliveryWindow}</p>
                    <p>{shippingSummary.courierLabel}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-b border-border-primary py-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold leading-6 tracking-[-0.4px] text-text-primary">
                  Item details({cartItemCount})
                </h2>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-1 rounded-full bg-bg-secondary px-4 py-2 text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-primary"
                >
                  View all
                  <ArrowRightSLineIcon className="size-6 text-text-secondary" aria-hidden />
                </button>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => scrollCarousel('prev')}
                  aria-label="Previous items"
                  className="absolute left-0 top-1/2 z-10 hidden size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-bg-primary shadow-[0px_1px_4px_0px_rgba(0,0,0,0.04),0px_4px_40px_0px_rgba(0,0,0,0.08)] lg:flex"
                >
                  <ArrowLeftSLineIcon className="size-6 text-text-secondary" aria-hidden />
                </button>
                <div
                  ref={trackRef}
                  className="flex gap-2 overflow-x-auto scroll-smooth [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
                >
                  {checkoutCarouselProducts.map((product, index) => (
                    <div key={`${product.name}-${index}`} className="w-45 min-w-0 shrink-0 sm:w-56">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => scrollCarousel('next')}
                  aria-label="Next items"
                  className="absolute right-0 top-1/2 z-10 hidden size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-bg-secondary shadow-[0px_1px_4px_0px_rgba(0,0,0,0.04),0px_4px_40px_0px_rgba(0,0,0,0.08)] lg:flex"
                >
                  <ArrowRightSLineIcon className="size-6 text-text-secondary" aria-hidden />
                </button>
              </div>
            </section>

            <section className="py-4">
              <h2 className="mb-4 text-xl font-semibold leading-6 tracking-[-0.4px] text-text-primary">
                Payment methods
              </h2>
              <div className="flex flex-col gap-6">
                {checkoutPaymentMethods.map((method) => {
                  const isSelected = paymentMethod === method.id

                  return (
                    <div key={method.id} className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <PaymentRadio
                          selected={isSelected}
                          onSelect={() => setPaymentMethod(method.id)}
                          label={method.label}
                        />
                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                          {method.icon ? (
                            <img
                              alt=""
                              aria-hidden
                              className="h-8 w-10 object-contain"
                              src={method.icon}
                            />
                          ) : null}
                          <span className="text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-primary">
                            {method.label}
                          </span>
                          {method.secondaryIcon ? (
                            <img
                              alt=""
                              aria-hidden
                              className="h-6 w-8 object-contain"
                              src={method.secondaryIcon}
                            />
                          ) : null}
                          {method.note ? (
                            <span className="text-sm leading-4.5 tracking-[-0.28px] text-text-secondary">
                              {method.note}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {method.id === 'card' && isSelected ? <CardPaymentFields /> : null}
                    </div>
                  )
                })}
              </div>
            </section>

            <div className="mt-8 lg:hidden">
              <OrderSummaryPanel mode="checkout" onPrimaryAction={onSubmitOrder} />
            </div>
          </div>

          <div className="hidden lg:block">
            <OrderSummaryPanel mode="checkout" onPrimaryAction={onSubmitOrder} />
          </div>
        </div>
      </section>
    </>
  )
}
