import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  mapApiOrder,
  mapApiPaymentMethods,
  mapApiProduct,
  mapApiProfile,
  mapApiReviewSlots,
} from '../api/mappers'
import { accountApi, ordersApi } from '../api'
import { ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import ArrowDownSLineIcon from 'remixicon-react/ArrowDownSLineIcon'
import ArrowLeftSLineIcon from 'remixicon-react/ArrowLeftSLineIcon'
import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon'
import ChatHeartLineIcon from 'remixicon-react/ChatHeartLineIcon'
import FileList3LineIcon from 'remixicon-react/FileList3LineIcon'
import HistoryLineIcon from 'remixicon-react/HistoryLineIcon'
import Notification3LineIcon from 'remixicon-react/Notification3LineIcon'
import SearchLineIcon from 'remixicon-react/SearchLineIcon'
import UserLineIcon from 'remixicon-react/UserLineIcon'
import UserLocationLineIcon from 'remixicon-react/UserLocationLineIcon'
import Wallet3LineIcon from 'remixicon-react/Wallet3LineIcon'
import {
  buyAgainProducts,
  filterOrders,
  getBuyAgainProductsFromOrders,
  getOrdersEmptyStateMessage,
  orderFilterTabs,
  type BuyAgainProduct,
  type OrderFilter,
  type OrderRecord,
  type OrderStatus,
} from '../data/orders'
import {
  filterReviews,
  getReviewsEmptyStateMessage,
  reviewFilterTabs,
  REVIEWED_REVIEWS_PAGE_SIZE,
  reviewedReviews,
  WAITING_REVIEWS_PAGE_SIZE,
  waitingReviews,
  type ReviewFilter,
  type ReviewedReviewRecord,
  type WaitingReviewRecord,
} from '../data/reviews'
import {
  accountProtectionDescription,
  accountProtectionTitle,
  getProfileInitials,
  privacyNotice,
  profileTabs,
  securitySettings,
  userProfile,
  type DefaultAddress,
  type ProfileTab,
} from '../data/profile'
import { paymentTypeLabel, type PaymentMethodRecord } from '../data/paymentMethods'
import { images } from '../assets/images'
import { AddReviewModal } from './AddReviewModal'
import { EditProfileModal } from './EditProfileModal'
import { BrowsingHistoryPanel } from './BrowsingHistoryPanel'
import { AddressesPanel } from './AddressesPanel'
import { PaymentMethodsPanel } from './PaymentMethodsPanel'
import { NotificationsPanel } from './NotificationsPanel'
import { ListingLoader } from './ListingLoader'
import { OrderTrackingModal } from './OrderTrackingModal'
import { ReturnRefundModal } from './ReturnRefundModal'
import { useBuyAgain } from '../hooks/useBuyAgain'
import { useDefaultAddress } from '../hooks/useDefaultAddress'
import { useOrderDetail } from '../hooks/useOrderDetail'
import { useNavigate } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import { getCartPath } from '../data/shopRoutes'
import EditBoxLineIcon from 'remixicon-react/EditBoxLineIcon'
import LockFillIcon from 'remixicon-react/LockFillIcon'
import ShieldCheckFillIcon from 'remixicon-react/ShieldCheckFillIcon'

import type { AccountSection } from '../data/accountRoutes'

export type { AccountSection } from '../data/accountRoutes'

type YourOrdersViewProps = {
  onGoHome: () => void
  section: AccountSection
  onSectionChange: (section: AccountSection) => void
  /** Opens the refund policy page, used by the Return/Refund dialog. */
  onViewRefundPolicy: () => void
  /** Set when arriving at Addresses from checkout's "Edit" link. */
  startEditingDefaultAddress?: boolean
  /** Clears that intent once the form is dismissed. */
  onDismissEditIntent?: () => void
}

type RemixIcon = typeof UserLineIcon

type AccountNavItem = {
  id: string
  label: string
  icon: RemixIcon
}

const accountNavItems: AccountNavItem[] = [
  { id: 'orders', label: 'Your orders', icon: FileList3LineIcon },
  { id: 'reviews', label: 'Your reviews', icon: ChatHeartLineIcon },
  { id: 'profile', label: 'Your profile', icon: UserLineIcon },
  { id: 'history', label: 'Browsing history', icon: HistoryLineIcon },
  { id: 'addresses', label: 'Addresses', icon: UserLocationLineIcon },
  { id: 'payments', label: 'Your payment methods', icon: Wallet3LineIcon },
  { id: 'notifications', label: 'Notifications', icon: Notification3LineIcon },
]

function statusBadgeClassName(status: OrderStatus): string {
  switch (status) {
    case 'delivered':
      return 'bg-primary-green'
    case 'processing':
      return 'bg-[#f0b100]'
    case 'shipped':
      return 'bg-primary-orange'
    default: {
      const exhaustiveCheck: never = status
      return exhaustiveCheck
    }
  }
}

function AccountBreadcrumbs({
  onGoHome,
  section,
}: {
  onGoHome: () => void
  section: AccountSection
}) {
  const label =
    section === 'reviews'
      ? 'Your Reviews'
      : section === 'profile'
        ? 'Your profile'
        : section === 'history'
          ? 'Browsing history'
          : section === 'addresses'
            ? 'Addresses'
            : section === 'payments'
              ? 'Payment methods'
              : section === 'notifications'
                ? 'Notification'
                : 'Your Orders'

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 px-4 py-2 lg:gap-1 lg:px-16">
      <button
        type="button"
        onClick={onGoHome}
        aria-label="Go back"
        className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-bg-secondary lg:hidden"
      >
        <ArrowLeftSLineIcon className="size-5 text-text-secondary" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onGoHome}
        className="cursor-pointer py-2.5 text-sm font-medium leading-4 tracking-[-0.28px] text-text-tertiary transition-colors hover:text-text-primary"
      >
        Home
      </button>
      <ArrowRightSLineIcon className="size-6 shrink-0 text-text-tertiary" aria-hidden />
      <span className="py-2.5 text-sm font-medium leading-4 tracking-[-0.28px] text-text-primary">
        {label}
      </span>
    </nav>
  )
}

function AccountSidebar({
  activeSection,
  onSectionChange,
}: {
  activeSection: AccountSection
  onSectionChange: (section: AccountSection) => void
}) {
  return (
    <aside className="hidden w-64 lg:w-52 xl:w-64 shrink-0 flex-col gap-2 lg:flex">
      {accountNavItems.map((item) => {
        const Icon = item.icon
        const isActive = item.id === activeSection
        const isNavigable =
          item.id === 'orders' ||
          item.id === 'reviews' ||
          item.id === 'profile' ||
          item.id === 'history' ||
          item.id === 'addresses' ||
          item.id === 'payments' ||
          item.id === 'notifications'

        return (
          <button
            key={item.id}
            type="button"
            onClick={isNavigable ? () => onSectionChange(item.id as AccountSection) : undefined}
            className={`flex w-full items-center gap-2 p-2 text-left ${
              isActive
                ? 'border-l-2 border-primary-orange bg-orange-light'
                : 'bg-bg-primary'
            } ${isNavigable ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <Icon
              className={`size-6 shrink-0 ${
                isActive ? 'text-primary-orange' : 'text-text-secondary'
              }`}
              aria-hidden
            />
            <span className="text-sm font-medium leading-4 tracking-[-0.28px] text-text-primary">
              {item.label}
            </span>
          </button>
        )
      })}
    </aside>
  )
}

function OrderProductCarousel({ images }: { images: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollByDirection = (direction: 'prev' | 'next') => {
    const track = trackRef.current
    if (!track) return
    const amount = direction === 'next' ? 134 : -134
    track.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <div className="relative min-w-0 flex-1">
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scroll-smooth [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="size-29.5 shrink-0 overflow-hidden rounded-lg border border-border-primary bg-bg-secondary"
          >
            <img alt="" className="size-full object-cover" src={image} />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between">
        <button
          type="button"
          onClick={() => scrollByDirection('prev')}
          className="pointer-events-auto flex size-12 cursor-pointer items-center justify-center rounded-full bg-bg-primary shadow-[0px_1px_4px_0px_rgba(0,0,0,0.04),0px_4px_40px_0px_rgba(0,0,0,0.08)]"
          aria-label="Previous products"
        >
          <ArrowLeftSLineIcon className="size-6 text-text-secondary" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => scrollByDirection('next')}
          className="pointer-events-auto flex size-12 cursor-pointer items-center justify-center rounded-full bg-bg-secondary shadow-[0px_1px_4px_0px_rgba(0,0,0,0.04),0px_4px_40px_0px_rgba(0,0,0,0.08)]"
          aria-label="Next products"
        >
          <ArrowRightSLineIcon className="size-6 text-text-secondary" aria-hidden />
        </button>
      </div>
    </div>
  )
}

function OrderCard({
  order,
  onBuyAgain,
  onReturnRefund,
  onTrackOrder,
  onViewDetails,
  isBuyingAgain,
}: {
  order: OrderRecord
  onBuyAgain: (order: OrderRecord) => void
  onReturnRefund: (order: OrderRecord) => void
  onTrackOrder: (order: OrderRecord) => void
  onViewDetails: (order: OrderRecord) => void
  isBuyingAgain: boolean
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border-primary">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-primary px-4 py-4 lg:px-6">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p className="text-sm leading-4 tracking-[-0.28px] text-text-secondary">
            {order.statusDateLabel}
          </p>
          <span
            className={`rounded px-1 py-0.5 text-xs font-medium leading-4 tracking-[-0.24px] text-text-inverse ${statusBadgeClassName(order.status)}`}
          >
            {order.statusBadgeLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onViewDetails(order)}
          className="group flex cursor-pointer items-center gap-0 text-sm font-medium leading-4 tracking-[-0.28px] text-text-primary"
        >
          View order details
          <ArrowRightSLineIcon
            className="size-6 text-text-secondary transition-colors group-hover:text-primary-orange"
            aria-hidden
          />
        </button>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-start lg:gap-10 lg:px-6">
        <OrderProductCarousel images={order.productImages} />
        <div className="flex w-full shrink-0 flex-col gap-2 lg:w-65.5">
          <button
            type="button"
            onClick={() => onBuyAgain(order)}
            disabled={isBuyingAgain}
            className="flex h-8.5 cursor-pointer items-center justify-center rounded-full bg-orange-light px-4 text-sm font-medium leading-4 tracking-[-0.28px] text-primary-orange disabled:cursor-wait disabled:opacity-60"
          >
            {isBuyingAgain ? 'Adding…' : 'Buy Again'}
          </button>
          <button
            type="button"
            onClick={() => onReturnRefund(order)}
            className="flex h-8.5 cursor-pointer items-center justify-center rounded-full bg-bg-secondary px-4 text-sm font-medium leading-4 tracking-[-0.28px] text-text-primary"
          >
            Return/Refund
          </button>
          <button
            type="button"
            onClick={() => onTrackOrder(order)}
            className="flex h-8.5 cursor-pointer items-center justify-center rounded-full bg-bg-secondary px-4 text-sm font-medium leading-4 tracking-[-0.28px] text-text-primary"
          >
            Track order
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border-primary px-4 py-4 text-sm leading-4 tracking-[-0.28px] text-text-secondary lg:flex-row lg:flex-wrap lg:gap-6 lg:px-6">
        <p>
          {order.itemCount} items:{' '}
          <span className="font-medium text-text-primary">{order.total}</span>
        </p>
        <p>
          Order Time:{' '}
          <span className="font-medium text-text-primary">{order.orderTime}</span>
        </p>
        <p>
          Order ID: <span className="font-medium text-text-primary">{order.id}</span>
        </p>
      </div>
    </article>
  )
}

function AccountEmptyState({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="flex min-h-121.25 w-full flex-col items-center justify-center gap-2 px-6 py-10"
    >
      <img
        alt=""
        aria-hidden
        className="size-33.5 shrink-0"
        src={images.orders.empty}
      />
      <p className="text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
        {message}
      </p>
    </div>
  )
}

function OrdersPanel({
  onViewRefundPolicy,
  onOrdersChange,
}: {
  onViewRefundPolicy: () => void
  onOrdersChange: (orders: OrderRecord[]) => void
}) {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [orders, setOrders] = useState<OrderRecord[]>(() => filterOrders(activeFilter))
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { applyCartResponse: applyCart } = useShop()
  const [trackingOrder, setTrackingOrder] = useState<OrderRecord | null>(null)
  const [returnOrderTarget, setReturnOrderTarget] = useState<OrderRecord | null>(null)
  const [isBuyingAgain, setIsBuyingAgain] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const { buyOrderAgain, addBuyAgainProductToCart } = useBuyAgain()
  const { lines, events, isLoading: isDetailLoading, loadOrderDetail, reset } = useOrderDetail()

  useEffect(() => {
    let cancelled = false

    async function loadOrders() {
      setIsLoading(true)
      try {
        const response = await ordersApi.listOrders({
          status: activeFilter === 'all' ? undefined : activeFilter,
          search: searchQuery.trim() || undefined,
        })
        if (!cancelled) {
          setOrders(response.orders.map(mapApiOrder))
        }
      } catch {
        if (!cancelled) {
          setOrders(filterOrders(activeFilter))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      cancelled = true
    }
  }, [activeFilter, searchQuery])

  // The "Buy this again" rail is a sibling of this panel, so the loaded orders
  // are published upward to keep both in step.
  useEffect(() => {
    onOrdersChange(orders)
  }, [onOrdersChange, orders])

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return order.id.toLowerCase().includes(query)
  })

  const emptyStateMessage = getOrdersEmptyStateMessage(activeFilter, searchQuery.trim().length > 0)

  /**
   * Buy Again asks the server to re-add the order's own lines, then refreshes the
   * cart. Falls back to adding the lines client-side if the call fails, so the
   * button always does something useful.
   */
  const handleBuyAgain = async (order: OrderRecord) => {
    setIsBuyingAgain(true)
    setNotice(null)

    try {
      const cart = await ordersApi.buyAgainOrder(order.id)
      applyCart(cart)
      navigate(getCartPath())
    } catch {
      const orderWithLines = lines.length > 0 ? { ...order, lines } : order
      if (orderWithLines.lines && orderWithLines.lines.length > 0) {
        await buyOrderAgain(orderWithLines.lines)
        return
      }
      setNotice('We could not add this order to your cart. Please try again.')
    } finally {
      setIsBuyingAgain(false)
    }
  }

  /** Posts the return request; the modal owns the success and error states. */
  const handleReturnRequest = async (orderId: string, reason: string) => {
    await ordersApi.returnOrder(orderId, reason)
  }

  const openTracking = (order: OrderRecord) => {
    setTrackingOrder(order)
    void loadOrderDetail(order)
  }

  const closeTracking = () => {
    setTrackingOrder(null)
    reset()
  }

  const trackingOrderWithLines: OrderRecord | null = trackingOrder
    ? { ...trackingOrder, lines: lines.length > 0 ? lines : trackingOrder.lines }
    : null

  return (
    <>
      <OrderTrackingModal
        order={trackingOrderWithLines}
        events={events}
        isLoading={isDetailLoading}
        onClose={closeTracking}
      />
      <ReturnRefundModal
        order={returnOrderTarget}
        onClose={() => setReturnOrderTarget(null)}
        onViewPolicy={onViewRefundPolicy}
        onSubmit={handleReturnRequest}
      />
      {notice ? (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-orange-light px-4 py-3 text-sm font-medium leading-4.5 tracking-[-0.28px] text-primary-orange"
        >
          {notice}
        </p>
      ) : null}
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-6 overflow-x-auto border-b border-border-primary pb-3 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
          {orderFilterTabs.map((tab) => {
            const isActive = tab.id === activeFilter

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`relative shrink-0 cursor-pointer pb-3.5 text-sm font-medium leading-4 tracking-[-0.28px] ${
                  isActive ? 'text-text-primary' : 'text-text-tertiary'
                }`}
              >
                {tab.label}
                {isActive ? (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-orange" aria-hidden />
                ) : null}
              </button>
            )
          })}
        </div>

        <label className="flex h-11 shrink-0 items-center rounded-full border border-border-secondary p-1 lg:w-78.5">
          <span className="flex min-w-0 flex-1 px-4">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Item name / Order / Tracking No."
              className="w-full bg-transparent text-xs leading-4 tracking-[-0.24px] text-text-primary outline-none placeholder:text-[#a1a3a3]"
            />
          </span>
          <span className="flex size-9 items-center justify-center p-2">
            <SearchLineIcon className="size-5 text-text-secondary" aria-hidden />
          </span>
        </label>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <ListingLoader label="Loading orders" />
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onBuyAgain={handleBuyAgain}
              isBuyingAgain={isBuyingAgain}
              onReturnRefund={(order) => setReturnOrderTarget(order)}
              onTrackOrder={openTracking}
              onViewDetails={openTracking}
            />
          ))
        ) : (
          <AccountEmptyState message={emptyStateMessage} />
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 xl:hidden">
        <p className="col-span-2 text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
          Buy this again
        </p>
        {getBuyAgainProductsFromOrders(orders)
          .concat(buyAgainProducts)
          .filter(
            (product, index, all) => all.findIndex((candidate) => candidate.id === product.id) === index,
          )
          .slice(0, 4)
          .map((product) => (
            <div
              key={`mobile-${product.id}`}
              className="overflow-hidden rounded-2xl border border-border-primary p-2"
            >
              <BuyAgainProductCard
                product={product}
                onAddToCart={(productId) => {
                  void addBuyAgainProductToCart(productId)
                }}
              />
            </div>
          ))}
      </div>
    </>
  )
}

function ReviewProductDetails({
  review,
}: {
  review: WaitingReviewRecord | ReviewedReviewRecord
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-col gap-2 lg:gap-4">
        <p className="line-clamp-2 text-sm leading-4.5 tracking-[-0.28px] text-text-secondary">
          {review.productName}
        </p>

        <div className="flex flex-col items-start gap-1 lg:flex-row lg:flex-wrap lg:items-center lg:gap-4">
          <span className="rounded-lg bg-bg-secondary px-2 py-1 text-xs font-medium leading-4 tracking-[-0.24px] text-text-primary">
            Order ID: {review.orderId}
          </span>
          <span aria-hidden className="hidden h-4 w-px bg-border-secondary lg:block" />
          <span className="px-2 py-1 text-xs font-medium leading-4 tracking-[-0.24px] text-text-tertiary lg:px-0 lg:py-0">
            Delivered on {review.deliveredOn}
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4 lg:mt-4 lg:gap-8">
        <p className="flex items-baseline gap-1 text-text-primary">
          <span className="text-sm leading-4.5 tracking-[-0.28px]">{review.priceCurrency}</span>
          <span className="text-base font-semibold leading-5 tracking-[-0.32px] lg:text-xl lg:leading-6 lg:tracking-[-0.4px]">
            {review.priceAmount}
          </span>
        </p>
        <p className="text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-tertiary">
          QTY: {review.quantity}
        </p>
      </div>
    </div>
  )
}

function ReviewRowActions({
  primaryAction,
  onViewDetails,
}: {
  primaryAction: ReactNode
  onViewDetails: () => void
}) {
  return (
    <div className="flex w-full items-center gap-4 lg:w-54 lg:flex-col lg:items-center lg:gap-4">
      {primaryAction}
      <button
        type="button"
        onClick={onViewDetails}
        className="group flex shrink-0 cursor-pointer items-center gap-0 text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-primary lg:justify-center"
      >
        View order details
        <ArrowRightSLineIcon
          className="size-6 text-text-secondary transition-colors group-hover:text-primary-orange"
          aria-hidden
        />
      </button>
    </div>
  )
}

function WaitingReviewRow({
  review,
  onAddReview,
  onViewDetails,
}: {
  review: WaitingReviewRecord
  onAddReview: (review: WaitingReviewRecord) => void
  onViewDetails: () => void
}) {
  return (
    <article className="flex flex-col gap-6 border-b border-border-primary py-4 lg:flex-row lg:items-center lg:gap-6">
      <div className="flex w-full gap-3 lg:contents">
        <div className="size-31 shrink-0 overflow-hidden rounded-lg border border-border-primary bg-bg-secondary lg:size-29.5">
          <img alt="" className="size-full object-cover" src={review.productImage} />
        </div>

        <ReviewProductDetails review={review} />
      </div>

      <ReviewRowActions
        primaryAction={
          <button
            type="button"
            onClick={() => onAddReview(review)}
            className="flex h-8.5 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-full border border-primary-orange px-4 text-sm font-medium leading-4.5 tracking-[-0.28px] text-primary-orange lg:w-full lg:flex-none"
          >
            Add review
          </button>
        }
        onViewDetails={onViewDetails}
      />
    </article>
  )
}

function ReviewedReviewRow({
  review,
  onViewDetails,
}: {
  review: ReviewedReviewRecord
  onViewDetails: () => void
}) {
  return (
    <article className="flex flex-col gap-6 border-b border-border-primary py-4 lg:flex-row lg:items-center lg:gap-6">
      <div className="flex w-full gap-3 lg:contents">
        <div className="size-31 shrink-0 overflow-hidden rounded-lg border border-border-primary bg-bg-secondary lg:size-29.5">
          <img alt="" className="size-full object-cover" src={review.productImage} />
        </div>

        <ReviewProductDetails review={review} />
      </div>

      <ReviewRowActions
        primaryAction={
          <button
            type="button"
            className="btn-orange flex h-8.5 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-full px-4 text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-inverse lg:h-9 lg:w-full lg:flex-none lg:text-base lg:leading-5 lg:tracking-[-0.32px]"
          >
            Buy Again
          </button>
        }
        onViewDetails={onViewDetails}
      />
    </article>
  )
}

function ReviewsPanel() {
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>('waiting')
  const [visibleCount, setVisibleCount] = useState(WAITING_REVIEWS_PAGE_SIZE)
  const [reviewModalTarget, setReviewModalTarget] = useState<WaitingReviewRecord | null>(null)
  const [waitingItems, setWaitingItems] = useState(() => [...waitingReviews])
  const [reviewedItems, setReviewedItems] = useState(() => [...reviewedReviews])
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)

  // Both review lists are loaded up front so switching tabs is instant. A failed
  // call leaves the static seed rows in place rather than an empty tab.
  useEffect(() => {
    let cancelled = false

    async function loadReviews() {
      setIsLoadingReviews(true)
      try {
        const [waiting, reviewed] = await Promise.all([
          accountApi.getWaitingReviews(),
          accountApi.getReviewedReviews(),
        ])
        if (cancelled) return

        const waitingSlots = mapApiReviewSlots(waiting)
        const reviewedSlots = mapApiReviewSlots(reviewed)
        if (waitingSlots.length > 0) setWaitingItems(waitingSlots)
        if (reviewedSlots.length > 0) setReviewedItems(reviewedSlots)
      } catch {
        // Keep static fallback reviews.
      } finally {
        if (!cancelled) setIsLoadingReviews(false)
      }
    }

    void loadReviews()

    return () => {
      cancelled = true
    }
  }, [])

  const pageSize =
    activeFilter === 'waiting' ? WAITING_REVIEWS_PAGE_SIZE : REVIEWED_REVIEWS_PAGE_SIZE
  const filteredReviews = filterReviews(activeFilter, waitingItems, reviewedItems)
  const visibleReviews = filteredReviews.slice(0, visibleCount)
  const hasMore = visibleCount < filteredReviews.length
  const emptyStateMessage = getReviewsEmptyStateMessage()

  const handleFilterChange = (filter: ReviewFilter) => {
    setActiveFilter(filter)
    setVisibleCount(filter === 'waiting' ? WAITING_REVIEWS_PAGE_SIZE : REVIEWED_REVIEWS_PAGE_SIZE)
  }

  /**
   * "View order details" opens the same tracker the orders tab uses. A review row
   * carries only an order reference, so the detail is fetched for that id and the
   * modal takes its title and image from the real line once it arrives.
   */
  const { lines, events, isLoading: isDetailLoading, loadOrderDetail, reset } = useOrderDetail()
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null)
  const [detailOrderIdLoading, setDetailOrderIdLoading] = useState(false)

  const openOrderDetails = async (review: WaitingReviewRecord | ReviewedReviewRecord) => {
    const orderId = review.orderId
    if (!orderId) return

    const detailOrder: OrderRecord = {
      id: orderId,
      status: 'delivered',
      statusDateLabel: '',
      statusBadgeLabel: '',
      itemCount: 1,
      total: `${review.priceCurrency} ${review.priceAmount}`.trim(),
      orderTime: review.deliveredOn,
      productImages: review.productImage ? [review.productImage] : [],
    }

    setDetailOrderId(orderId)
    setDetailOrderIdLoading(true)
    try {
      await loadOrderDetail(detailOrder)
    } finally {
      setDetailOrderIdLoading(false)
    }
  }

  const closeTracking = () => {
    setDetailOrderId(null)
    reset()
  }

  const trackingOrder: OrderRecord | null = detailOrderId
    ? {
        id: detailOrderId,
        status: 'delivered',
        statusDateLabel: '',
        statusBadgeLabel: '',
        itemCount: lines.length,
        total: '',
        orderTime: '',
        productImages: lines.map((line) => line.image),
        lines: lines.length > 0 ? lines : undefined,
      }
    : null

  return (
    <>
      {/* Keyed by review id so a new target always starts from a blank form. */}
      <AddReviewModal
        key={reviewModalTarget?.id ?? 'closed'}
        review={reviewModalTarget}
        onClose={() => setReviewModalTarget(null)}
        onSubmitSuccess={(reviewId) => {
          setWaitingItems((items) => {
            const submitted = items.find((item) => item.id === reviewId)
            if (submitted) {
              setReviewedItems((reviewed) => [
                {
                  ...submitted,
                  id: `reviewed-${reviewId}`,
                },
                ...reviewed,
              ])
            }
            return items.filter((item) => item.id !== reviewId)
          })
        }}
      />

      <OrderTrackingModal
        order={trackingOrder}
        events={events}
        isLoading={isDetailLoading || detailOrderIdLoading}
        onClose={closeTracking}
      />

      <div className="mb-4 flex gap-6 overflow-x-auto border-b border-border-primary px-4 pb-3 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
        {reviewFilterTabs.map((tab) => {
          const isActive = tab.id === activeFilter

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleFilterChange(tab.id)}
              className={`relative shrink-0 cursor-pointer pb-3.5 text-sm font-medium leading-4 tracking-[-0.28px] ${
                isActive ? 'text-text-primary' : 'text-text-tertiary'
              }`}
            >
              {tab.label}
              {isActive ? (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-orange" aria-hidden />
              ) : null}
            </button>
          )
        })}
      </div>

      {isLoadingReviews ? (
        <ListingLoader label="Loading reviews" />
      ) : filteredReviews.length > 0 ? (
        <div className="px-4">
          <div className="flex flex-col">
            {activeFilter === 'waiting'
              ? visibleReviews.map((review) => (
                  <WaitingReviewRow
                    key={review.id}
                    review={review}
                    onAddReview={setReviewModalTarget}
                    onViewDetails={() => void openOrderDetails(review)}
                  />
                ))
              : visibleReviews.map((review) => (
                  <ReviewedReviewRow
                    key={review.id}
                    review={review}
                    onViewDetails={() => void openOrderDetails(review)}
                  />
                ))}
          </div>

          {hasMore ? (
            <div className="flex justify-center py-6">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((count) =>
                    Math.min(count + pageSize, filteredReviews.length),
                  )
                }
                className="flex cursor-pointer items-center gap-2 rounded-full border border-border-secondary px-4 py-2 text-base font-medium leading-5 tracking-[-0.32px] text-text-primary"
              >
                View more
                <ArrowDownSLineIcon className="size-6 text-text-secondary" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <AccountEmptyState message={emptyStateMessage} />
      )}
    </>
  )
}

function BuyAgainProductCard({
  product,
  onAddToCart,
}: {
  product: BuyAgainProduct
  onAddToCart: (productId: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-bg-primary">
      <div className="overflow-hidden rounded-lg bg-bg-secondary">
        <img alt={product.name} className="aspect-square w-full object-cover" src={product.image} />
      </div>
      <div className="px-1 py-2">
        <p className="truncate text-xs font-medium leading-4 tracking-[-0.24px] text-text-primary">
          {product.name}
        </p>
        <p className="mt-2 text-sm font-medium leading-4 tracking-[-0.28px] text-text-primary">
          {product.price}
        </p>
        <button
          type="button"
          onClick={() => onAddToCart(product.id)}
          className="btn-orange mt-2 flex h-8.5 w-full cursor-pointer items-center justify-center rounded-full px-4 text-sm font-medium leading-4 tracking-[-0.28px] text-text-inverse"
        >
          Add to cart
        </button>
      </div>
    </div>
  )
}

function ProfileTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: ProfileTab
  onTabChange: (tab: ProfileTab) => void
}) {
  return (
    <div className="mb-0 flex gap-6 overflow-x-auto border-b border-border-primary px-4 pb-3 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden lg:px-4">
      {profileTabs.map((tab) => {
        const isActive = tab.id === activeTab

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`relative shrink-0 cursor-pointer pb-3.5 text-sm font-medium leading-4.5 tracking-[-0.28px] ${
              isActive ? 'text-text-primary' : 'text-text-tertiary'
            }`}
          >
            {tab.label}
            {isActive ? (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-orange" aria-hidden />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

function ProfileAvatar({ initials }: { initials: string }) {
  return (
    <div className="flex size-18 shrink-0 items-center justify-center rounded-full bg-bg-secondary text-[32px] font-medium leading-10 tracking-[-0.64px] text-text-primary">
      {initials}
    </div>
  )
}

function PrivacyNotice() {
  return (
    <div className="flex items-start gap-1 px-4 py-4 lg:px-6">
      <LockFillIcon className="size-6 shrink-0 text-primary-green" aria-hidden />
      <p className="text-sm leading-4.5 tracking-[-0.28px] text-primary-green">{privacyNotice}</p>
    </div>
  )
}

function DefaultAddressCard({
  address,
  onEdit,
}: {
  address?: DefaultAddress | null
  onEdit: () => void
}) {
  // Nothing is shown when the account has no default address, rather than
  // falling back to the static fixture, which would show a saved-seeming address
  // that does not belong to this user. `isEmpty` guards the branch below, so the
  // empty-object fallback here is only for the type checker.
  const isEmpty = !address
  const shown = address

  return (
    <div className="flex gap-4 rounded-firm-2 bg-bg-secondary p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-primary">
          Default Address
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-primary">
            {isEmpty ? 'No default address saved' : `${shown?.contactName} | ${shown?.phone}`}
          </p>
          {address ? (
            <div className="flex flex-col gap-2 text-sm leading-4.5 tracking-[-0.28px] text-text-primary">
              <p>{address.line1}</p>
              <p>{address.line2}</p>
            </div>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit default address"
        className="cursor-pointer self-start p-0"
      >
        <EditBoxLineIcon className="size-6 text-text-secondary" aria-hidden />
      </button>
    </div>
  )
}

function PaymentMethodCard({
  payment,
  onEdit,
}: {
  payment?: PaymentMethodRecord | null
  onEdit: () => void
}) {
  // Falls back to the static preview when the account has no saved method yet.
  const isEmpty = !payment

  return (
    <div className="flex gap-4 rounded-firm-2 bg-bg-secondary p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-primary">
          Payment Method
        </p>
        <div className="mt-4 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <img
              alt=""
              aria-hidden
              className="h-6 w-8 shrink-0 object-contain"
              src={images.footer.paypal}
            />
            {isEmpty ? (
              <span className="text-sm leading-4.5 tracking-[-0.28px] text-text-primary">
                No saved payment method
              </span>
            ) : (
              <>
                <span className="text-sm leading-4.5 tracking-[-0.28px] text-text-primary">
                  {paymentTypeLabel(payment.type)}
                </span>
                {payment.network ? (
                  <span className="text-sm leading-4.5 tracking-[-0.28px] text-text-primary">
                    {payment.network}
                  </span>
                ) : null}
                <span className="text-sm leading-4.5 tracking-[-0.28px] text-text-primary">
                  {payment.maskedDetail}
                </span>
              </>
            )}
          </div>
          {isEmpty ? null : (
            <p className="text-base leading-5 tracking-[-0.32px] text-text-secondary">
              {payment.cardholderName}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit payment method"
        className="cursor-pointer self-start p-0"
      >
        <EditBoxLineIcon className="size-6 text-text-secondary" aria-hidden />
      </button>
    </div>
  )
}

function PersonalInformationPanel({
  profile,
  onEditProfile,
  onEditAddress,
  onEditPaymentMethod,
  address,
  paymentMethod,
  isSaving = false,
}: {
  profile: { fullName: string; email: string; initials: string }
  onEditProfile: () => void
  onEditAddress: () => void
  onEditPaymentMethod: () => void
  address?: DefaultAddress | null
  paymentMethod?: PaymentMethodRecord | null
  isSaving?: boolean
}) {
  return (
    <>
      <div className="flex flex-col gap-4 border-b border-border-primary px-4 py-4 lg:flex-row lg:items-center lg:gap-8 lg:px-6 lg:py-10">
        <div className="flex items-center gap-4 lg:contents">
          <ProfileAvatar initials={profile.initials} />
          <div className="min-w-0 flex-1 lg:flex lg:flex-col lg:gap-2">
            <p className="text-base font-semibold leading-5 tracking-[-0.32px] text-text-primary lg:text-xl lg:leading-6 lg:tracking-[-0.4px]">
              {profile.fullName}
            </p>
            <p className="text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-tertiary">
              {profile.email}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onEditProfile}
          disabled={isSaving}
          className="flex w-fit cursor-pointer items-center justify-center rounded-full bg-text-primary px-4 py-2 text-base font-medium leading-5 tracking-[-0.32px] text-text-inverse disabled:cursor-not-allowed disabled:opacity-60 lg:ml-auto lg:shrink-0"
        >
          {isSaving ? 'Saving…' : 'Edit profile'}
        </button>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:gap-8 lg:px-6">
        <div className="min-w-0 flex-1">
          <DefaultAddressCard address={address} onEdit={onEditAddress} />
        </div>
        <div className="min-w-0 flex-1">
          <PaymentMethodCard payment={paymentMethod} onEdit={onEditPaymentMethod} />
        </div>
      </div>

      <PrivacyNotice />
    </>
  )
}

function SecurityActionButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="btn-orange flex h-12 w-27.5 shrink-0 cursor-pointer items-center justify-center rounded-full px-6 text-base font-medium leading-5 tracking-[-0.32px] text-text-inverse"
    >
      {label}
    </button>
  )
}

function SecurityRow({
  title,
  value,
  actionLabel,
}: {
  title: string
  value?: string
  actionLabel: string
}) {
  return (
    <div className="flex items-center gap-4 border-b border-border-primary py-4">
      <div className="min-w-0 flex-1">
        <p className="text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
          {title}
        </p>
        {value ? (
          <p className="mt-2 text-sm leading-4.5 tracking-[-0.28px] text-text-primary">{value}</p>
        ) : null}
      </div>
      <SecurityActionButton label={actionLabel} />
    </div>
  )
}

function AccountSecurityPanel() {
  return (
    <>
      <div className="flex gap-4 border-b border-border-primary px-4 py-4 lg:items-center lg:px-6 lg:py-10">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-green-light p-4">
          <ShieldCheckFillIcon className="size-6 text-primary-green" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
            {accountProtectionTitle}
          </p>
          <p className="mt-2 text-sm leading-4.5 tracking-[-0.28px] text-text-secondary">
            {accountProtectionDescription}
          </p>
        </div>
      </div>

      <div className="px-4 py-4 lg:px-6">
        <SecurityRow title="Email" value={securitySettings.email} actionLabel="Edit" />
        <SecurityRow title="Phone" actionLabel="Add" />
        <SecurityRow title="Password" actionLabel="Change" />
        <SecurityRow
          title={`Two-factor authentication: ${securitySettings.twoFactorEnabled ? 'On' : 'Off'}`}
          actionLabel="Turn on"
        />

        <div className="py-4">
          <button
            type="button"
            className="flex h-12 cursor-pointer items-center justify-center rounded-full bg-bg-secondary px-6 text-base font-medium leading-5 tracking-[-0.32px] text-text-primary"
          >
            Delete your account
          </button>
        </div>
      </div>
    </>
  )
}

function ProfilePanel({ onSectionChange }: { onSectionChange: (section: AccountSection) => void }) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { authUser, refreshSession } = useAuth()

  /**
   * The signed-in user from `/auth/me` is the source of truth for name and
   * email, since that is what the rest of the app already shows. The profile
   * endpoint can override them and also supplies the default address preview.
   */
  const [profile, setProfile] = useState(() => ({
    fullName: authUser?.fullName ?? userProfile.fullName,
    email: authUser?.email ?? userProfile.email,
    initials: getProfileInitials(authUser?.fullName ?? userProfile.fullName),
  }))
  const [savedPayment, setSavedPayment] = useState<PaymentMethodRecord | null>(null)

  /**
   * The default address comes from its own hook so Your Profile and Checkout
   * resolve the same record instead of reading it two different ways.
   */
  // ProfilePanel unmounts while the Addresses tab is open, so the hook refetches
  // on its own when the user navigates back.
  const { address: savedAddress } = useDefaultAddress()

  // Profile details and saved payment methods load together; the default
  // address has its own hook because Checkout reads it too.
  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      setIsLoading(true)
      try {
        const [profileResponse, paymentResponse] = await Promise.all([
          accountApi.getProfile(),
          accountApi.listPaymentMethods(),
        ])
        if (cancelled) return

        if (profileResponse.profile) {
          const mapped = mapApiProfile(profileResponse.profile)
          // `/users/me/profile` may omit the email, in which case the session's
          // email is the accurate one to show.
          setProfile({
            fullName: mapped.fullName || authUser?.fullName || userProfile.fullName,
            email: mapped.email || authUser?.email || userProfile.email,
            initials: getProfileInitials(mapped.fullName || authUser?.fullName || ''),
          })
        }

        const payments = mapApiPaymentMethods(paymentResponse)
        setSavedPayment(payments.find((item) => item.isDefault) ?? payments[0] ?? null)
      } catch {
        // Keep the session-derived values and the static address fallback.
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [authUser])

  /** Saves the new name, then refreshes the session so the Nav updates too. */
  const handleProfileUpdate = async (fullName: string) => {
    setErrorMessage(null)
    setIsSaving(true)

    try {
      const response = await accountApi.updateProfile({ fullName })
      setProfile(
        response.profile
          ? mapApiProfile(response.profile)
          : { fullName, email: profile.email, initials: getProfileInitials(fullName) },
      )
      await refreshSession().catch(() => undefined)
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError && error.message
          ? error.message
          : 'We could not update your profile. Please try again.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <EditProfileModal
        isOpen={isEditModalOpen}
        fullName={profile.fullName}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(fullName) => void handleProfileUpdate(fullName)}
      />

      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {errorMessage ? (
        <p
          role="alert"
          className="mx-4 mt-4 rounded-xl bg-orange-light px-4 py-3 text-sm font-medium leading-4.5 tracking-[-0.28px] text-primary-orange lg:mx-6"
        >
          {errorMessage}
        </p>
      ) : null}

      {activeTab === 'personal' ? (
        isLoading ? (
          <ListingLoader label="Loading profile" />
        ) : (
          <PersonalInformationPanel
            profile={profile}
            onEditProfile={() => setIsEditModalOpen(true)}
            isSaving={isSaving}
            address={savedAddress}
            paymentMethod={savedPayment}
            onEditAddress={() => onSectionChange('addresses')}
            onEditPaymentMethod={() => onSectionChange('payments')}
          />
        )
      ) : (
        <AccountSecurityPanel />
      )}
    </>
  )
}

function BuyAgainSidebar({
  orders,
  onAddToCart,
}: {
  orders: OrderRecord[]
  onAddToCart: (productId: string) => void
}) {
  const [suggested, setSuggested] = useState<BuyAgainProduct[] | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadSuggestions() {
      try {
        const response = await ordersApi.getBuyAgainProducts()
        if (cancelled) return

        setSuggested(
          response.products.map((item) => {
            const product = mapApiProduct(item)
            return {
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
            }
          }),
        )
      } catch {
        // Suggestions are a convenience; the rail falls back to the order lines.
        if (!cancelled) {
          setSuggested(null)
        }
      }
    }

    void loadSuggestions()

    return () => {
      cancelled = true
    }
  }, [])

  // The API's suggestions lead. When they are unavailable or empty, the rail
  // falls back to products from the orders actually on screen, so it only ever
  // advertises something this customer has bought.
  const purchasedProducts = getBuyAgainProductsFromOrders(orders)
  const products =
    suggested && suggested.length > 0 ? suggested : purchasedProducts.length > 0 ? purchasedProducts : buyAgainProducts

  return (
    <aside className="hidden w-37.5 shrink-0 flex-col overflow-hidden rounded-2xl border border-border-primary xl:flex">
      <div className="border-b border-border-primary px-2 py-3">
        <p className="text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
          Buy this again
        </p>
      </div>
      <div className="flex flex-col gap-2 p-2">
        {products.map((product) => (
          <BuyAgainProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </aside>
  )
}

export function YourOrdersView({
  onGoHome,
  section,
  onSectionChange,
  onViewRefundPolicy,
  startEditingDefaultAddress = false,
  onDismissEditIntent,
}: YourOrdersViewProps) {
  // Orders live here so the panel and the "Buy this again" rail read from the
  // same list, which keeps the rail's products tied to real purchases.
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const { addBuyAgainProductToCart } = useBuyAgain()

  return (
    <>
      <AccountBreadcrumbs onGoHome={onGoHome} section={section} />

      <section className="border-t border-border-primary px-4 pb-10 pt-6 lg:px-16 lg:pt-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <AccountSidebar activeSection={section} onSectionChange={onSectionChange} />

          <div className="min-w-0 flex-1">
            {section === 'orders' ? (
              <OrdersPanel
                onViewRefundPolicy={onViewRefundPolicy}
                onOrdersChange={setOrders}
              />
            ) : section === 'reviews' ? (
              <ReviewsPanel />
            ) : section === 'profile' ? (
              <ProfilePanel onSectionChange={onSectionChange} />
            ) : section === 'history' ? (
              <BrowsingHistoryPanel />
            ) : section === 'addresses' ? (
              <AddressesPanel
              startEditingDefault={startEditingDefaultAddress}
              onDismissEditIntent={onDismissEditIntent}
            />
            ) : section === 'payments' ? (
              <PaymentMethodsPanel />
            ) : (
              <NotificationsPanel />
            )}
          </div>

          {section === 'orders' ? (
            <BuyAgainSidebar
              orders={orders}
              onAddToCart={(productId) => {
                void addBuyAgainProductToCart(productId)
              }}
            />
          ) : null}
        </div>
      </section>
    </>
  )
}
