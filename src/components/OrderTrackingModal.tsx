import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon'
import CheckLineIcon from 'remixicon-react/CheckLineIcon'
import CloseFillIcon from 'remixicon-react/CloseFillIcon'
import {
  buildOrderTimeline,
  type OrderLine,
  type OrderRecord,
  type OrderStageState,
  type OrderTimelineStep,
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

/**
 * Order progress dialog, opened from Track order and View order details.
 *
 * The dialog is titled with the product being tracked and, on desktop, lays the
 * product image out beside the delivery timeline. On mobile it stays stacked.
 * The timeline is driven by the API's tracking events; the local stage list is
 * only a fallback for when those have not arrived.
 *
 * Choosing a different line from "Other items in this order" **swaps** the two
 * entries: the picked item moves up into the preview and the item that was on
 * preview moves down into the list. Nothing navigates away, so progress can be
 * inspected for each item in turn without losing the dialog.
 */
export function OrderTrackingModal({ order, events, isLoading, onClose }: OrderTrackingModalProps) {
  // The swap is remembered per order, so opening the dialog for a different
  // order starts on that order's first line instead of carrying over an id that
  // refers to nothing. Deriving it this way avoids resetting state from an
  // effect, which would re-render on every open.
  const [swap, setSwap] = useState<{ orderId: string; mainIndex: number; otherIndex: number } | null>(
    null,
  )

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const pendingSwap = swap && swap.orderId === order?.id ? swap : null

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

  const lines = order?.lines ?? []

  // Index 0 is whatever sits in the preview; everything after it is the
  // "Other items" list. A swap is two moves in one: the picked line rises to
  // the front, and the line it displaced drops into the list at the position
  // the picked line vacated. Rebuilding the order this way (rather than
  // filtering the picked line out) is what makes the two visibly trade places,
  // so the list never silently shrinks or reorders itself.
  //
  // Positions are stored as indices, not product ids: an order can legitimately
  // contain the same product twice (two sizes, say), and id matching would send
  // both lookups to the first occurrence and duplicate a line in the list.
  const reorderedLines = useMemo(() => {
    if (!pendingSwap) return lines

    const { mainIndex, otherIndex } = pendingSwap
    const isSwappable =
      mainIndex === 0 &&
      otherIndex > 0 &&
      otherIndex < lines.length &&
      mainIndex < lines.length

    if (!isSwappable) return lines

    const next = [...lines]
    next[0] = lines[otherIndex]
    next[otherIndex] = lines[mainIndex]
    return next
  }, [lines, pendingSwap])

  if (!order) return null

  const mainLine = reorderedLines[0] ?? null

  // The heading names the product when it is known, and falls back to a generic
  // label while the detail request is still in flight.
  const title = mainLine?.name ?? (isLoading ? 'Loading order…' : 'Track order')

  // Every delivery stage is listed, with the reached ones ticked off and the
  // stage the order currently sits on marked active.
  const timeline = <TimelineList steps={buildOrderTimeline(order.status, events)} />

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
                {mainLine?.image ? (
                  <img
                    alt={mainLine.name}
                    className="size-full object-cover"
                    src={mainLine.image}
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

                {mainLine ? (
                  <p className="flex flex-wrap items-baseline gap-2 text-sm font-medium leading-4 tracking-[-0.28px] text-text-primary">
                    <span>{mainLine.price}</span>
                    <span className="text-text-tertiary">QTY: {mainLine.quantity}</span>
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
              <p className="mb-3 text-sm leading-4 tracking-[-0.28px] text-text-tertiary">
                Select an item to swap it with the one shown above.
              </p>
              <div className="flex flex-col gap-3">
                {reorderedLines.slice(1).map((line: OrderLine, index: number) => (
                  <button
                    key={`${line.productId}-${index}`}
                    type="button"
                    onClick={() => {
                      if (!mainLine) return
                      // `index` is relative to the sliced list, so the real
                      // position in the order is one greater.
                      setSwap({
                        orderId: order.id,
                        mainIndex: 0,
                        otherIndex: index + 1,
                      })
                    }}
                    className="group flex w-full cursor-pointer items-center gap-4 rounded-lg border border-transparent p-2 text-left transition-colors hover:bg-bg-secondary"
                  >
                    <div className="size-14 shrink-0 overflow-hidden rounded-lg border border-border-primary bg-bg-secondary">
                      <img alt="" className="size-full object-cover" src={line.image} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm leading-4 tracking-[-0.28px] text-text-secondary transition-colors group-hover:text-text-primary">
                        {line.name}
                      </p>
                      <p className="mt-1 flex flex-wrap items-baseline gap-2 text-sm font-medium leading-4 tracking-[-0.28px] text-text-primary">
                        <span>{line.price}</span>
                        <span className="text-text-tertiary">QTY: {line.quantity}</span>
                      </p>
                    </div>
                    <ArrowRightSLineIcon
                      className="size-5 shrink-0 text-text-secondary transition-colors group-hover:text-primary-orange"
                      aria-hidden
                    />
                  </button>
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

/** Dot and connector styling for one timeline step. */
function StageMarker({ state }: { state: OrderStageState }) {
  if (state === 'done') {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-green">
        <CheckLineIcon className="size-4 text-text-inverse" aria-hidden />
      </span>
    )
  }

  if (state === 'active') {
    return (
      <span
        aria-hidden
        className="size-6 shrink-0 rounded-full border-2 border-primary-orange bg-bg-primary"
      />
    )
  }

  return (
    <span
      aria-hidden
      className="size-6 shrink-0 rounded-full border-2 border-border-secondary bg-bg-primary"
    />
  )
}

/**
 * Vertical delivery timeline.
 *
 * Every stage is shown, oldest first: completed steps carry a green tick and
 * their API date, the stage the order is currently on is ringed in orange, and
 * steps still to come are muted and undated. Text is dimmed for anything not yet
 * reached so the journey reads as unfinished rather than missing.
 */
function TimelineList({ steps }: { steps: OrderTimelineStep[] }) {
  const lastIndex = steps.length - 1

  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const occurredOn = formatEventDate(step.occurredAt)
        const isDone = step.state === 'done'
        const isActive = step.state === 'active'
        // The connector below a step is filled only once that step is behind us.
        const connectorFilled = index < lastIndex && step.state === 'done'

        return (
          <li key={step.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <StageMarker state={step.state} />
              {index < lastIndex ? (
                <span
                  aria-hidden
                  className={`w-0.5 flex-1 ${connectorFilled ? 'bg-primary-green' : 'bg-border-secondary'}`}
                />
              ) : null}
            </div>

            <div className={index === lastIndex ? '' : 'pb-6'}>
              <p
                className={`flex flex-wrap items-center gap-2 text-sm font-medium leading-4 tracking-[-0.28px] ${
                  step.state === 'upcoming' ? 'text-text-tertiary' : 'text-text-primary'
                }`}
              >
                {step.label}
                {isActive ? (
                  <span className="rounded bg-orange-light px-1 py-0.5 text-xs font-medium leading-4 tracking-[-0.24px] text-primary-orange">
                    In progress
                  </span>
                ) : null}
              </p>
              <p
                className={`mt-1 text-sm leading-4.5 tracking-[-0.28px] ${
                  step.state === 'upcoming' ? 'text-text-tertiary' : 'text-text-secondary'
                }`}
              >
                {step.description}
              </p>
              {occurredOn ? (
                <p className="mt-1 text-xs font-medium leading-4 tracking-[-0.24px] text-text-tertiary">
                  {occurredOn}
                </p>
              ) : null}
              <span className="sr-only">
                {isDone ? 'Completed' : isActive ? 'Current stage' : 'Not yet reached'}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}