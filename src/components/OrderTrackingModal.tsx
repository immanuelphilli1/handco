import { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import CheckLineIcon from 'remixicon-react/CheckLineIcon'
import CloseFillIcon from 'remixicon-react/CloseFillIcon'
import {
  getReachedStageCount,
  orderTrackingStages,
  type OrderLine,
  type OrderRecord,
  type OrderTrackingEvent,
} from '../data/orders'
import { ListingLoader } from './ListingLoader'

type OrderTrackingModalProps = {
  order: OrderRecord | null
  /** Timeline events from `GET /orders/:rid/tracking`, oldest first. */
  events: OrderTrackingEvent[]
  isLoading: boolean
  onClose: () => void
}

/** Formats an ISO timestamp as a short, readable delivery date. */
function formatEventDate(isoDate: string): string {
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) return ''

  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** The single line the modal focuses on: the first order line, if loaded. */
function getPrimaryLine(order: OrderRecord): OrderLine | null {
  return order.lines?.[0] ?? null
}

/**
 * Order progress dialog, opened from Track order and View order details.
 *
 * The dialog is titled with the product being tracked and, on desktop, lays the
 * product image out beside the delivery timeline. On mobile it stays stacked.
 * The timeline is driven by the API's tracking events; the local stage list is
 * only a fallback for when those have not arrived.
 */
export function OrderTrackingModal({ order, events, isLoading, onClose }: OrderTrackingModalProps) {
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!order) return

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [order])

  useEffect(() => {
    if (!order) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleClose, order])

  if (!order) return null

  const lines = order.lines ?? []
  const primaryLine = getPrimaryLine(order)

  // The heading names the product when it is known, and falls back to a generic
  // label while the detail request is still in flight.
  const title = primaryLine?.name ?? (isLoading ? 'Loading order…' : 'Track order')

  const timeline = events.length > 0 ? (
    <TimelineList events={events} />
  ) : (
    <TimelineList
      events={orderTrackingStages.slice(0, getReachedStageCount(order.status)).map((stage, index) => ({
        id: `${stage.key}-${index}`,
        label: stage.label,
        description: stage.description,
        occurredAt: '',
      }))}
    />
  )

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close order tracking modal"
        className="fixed inset-0 z-50 bg-[rgba(0,6,7,0.3)]"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-tracking-title"
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[min(960px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-bg-primary"
      >
        <div className="flex shrink-0 items-start gap-3 border-b border-border-primary px-6 py-4">
          <h2
            id="order-tracking-title"
            className="line-clamp-2 min-w-0 flex-1 text-base font-semibold leading-5 tracking-[-0.32px] text-text-secondary"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex size-6 shrink-0 cursor-pointer items-center justify-center"
          >
            <CloseFillIcon className="size-6 text-text-secondary" aria-hidden />
          </button>
        </div>

        <div className="overflow-y-auto">
          <div className="flex flex-col gap-6 px-6 py-4 lg:flex-row lg:gap-8">
            {/* Product summary: a large image with the item's details beside it.
                Stacks above the timeline on mobile. */}
            <div className="flex shrink-0 flex-col gap-4 lg:w-64">
              <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border-primary bg-bg-secondary">
                {primaryLine?.image ? (
                  <img
                    alt={primaryLine.name}
                    className="size-full object-cover"
                    src={primaryLine.image}
                  />
                ) : (
                  <div
                    className="flex size-full items-center justify-center text-sm text-text-tertiary"
                    aria-hidden
                  >
                    No product image
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm leading-4 tracking-[-0.28px] text-text-secondary">
                    {order.statusDateLabel}
                  </p>
                  <span className="rounded bg-bg-secondary px-1 py-0.5 text-xs font-medium leading-4 tracking-[-0.24px] text-text-primary">
                    {order.statusBadgeLabel}
                  </span>
                </div>

                <p className="text-xs font-medium leading-4 tracking-[-0.24px] text-text-tertiary">
                  Order ID: <span className="text-text-primary">{order.id}</span>
                </p>

                {primaryLine ? (
                  <p className="flex flex-wrap items-baseline gap-2 text-sm font-medium leading-4 tracking-[-0.28px] text-text-primary">
                    <span>{primaryLine.price}</span>
                    <span className="text-text-tertiary">QTY: {primaryLine.quantity}</span>
                  </p>
                ) : null}

                <p className="text-sm font-medium leading-4 tracking-[-0.28px] text-text-secondary">
                  {order.itemCount} items:{' '}
                  <span className="font-medium text-text-primary">{order.total}</span>
                </p>
              </div>
            </div>

            {/* Timeline column. */}
            <div className="min-w-0 flex-1">
              <p className="mb-4 text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
                Delivery progress
              </p>

              {isLoading ? (
                <ListingLoader label="Loading tracking" />
              ) : (
                timeline
              )}
            </div>
          </div>

          {lines.length > 1 ? (
            <div className="border-t border-border-primary px-6 py-4">
              <p className="mb-3 text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
                Other items in this order
              </p>
              <div className="flex flex-col gap-3">
                {lines.slice(1).map((line) => (
                  <div key={line.productId} className="flex items-center gap-4">
                    <div className="size-14 shrink-0 overflow-hidden rounded-lg border border-border-primary bg-bg-secondary">
                      <img alt="" className="size-full object-cover" src={line.image} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm leading-4 tracking-[-0.28px] text-text-secondary">
                        {line.name}
                      </p>
                      <p className="mt-1 flex flex-wrap items-baseline gap-2 text-sm font-medium leading-4 tracking-[-0.28px] text-text-primary">
                        <span>{line.price}</span>
                        <span className="text-text-tertiary">QTY: {line.quantity}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>,
    document.body,
  )
}

/** Vertical timeline of delivery events, oldest first, each marked as reached. */
function TimelineList({ events }: { events: OrderTrackingEvent[] }) {
  const lastIndex = events.length - 1

  return (
    <ol className="flex flex-col">
      {events.map((event, index) => {
        const isCurrent = index === lastIndex
        const occurredOn = formatEventDate(event.occurredAt)

        return (
          <li key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-green">
                <CheckLineIcon className="size-4 text-text-inverse" aria-hidden />
              </span>
              {index < lastIndex ? (
                <span aria-hidden className="w-0.5 flex-1 bg-primary-green" />
              ) : null}
            </div>

            <div className={index === lastIndex ? '' : 'pb-6'}>
              <p className="flex flex-wrap items-center gap-2 text-sm font-medium leading-4 tracking-[-0.28px] text-text-primary">
                {event.label}
                {isCurrent ? (
                  <span className="rounded bg-orange-light px-1 py-0.5 text-xs font-medium leading-4 tracking-[-0.24px] text-primary-orange">
                    Latest
                  </span>
                ) : null}
              </p>
              <p className="mt-1 text-sm leading-4.5 tracking-[-0.28px] text-text-secondary">
                {event.description}
              </p>
              {occurredOn ? (
                <p className="mt-1 text-xs font-medium leading-4 tracking-[-0.24px] text-text-tertiary">
                  {occurredOn}
                </p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}