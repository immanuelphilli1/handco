import { useRef, useState, type ReactNode } from 'react'
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
  defaultAddress,
  getProfileInitials,
  paymentMethod,
  privacyNotice,
  profileTabs,
  securitySettings,
  userProfile,
  type ProfileTab,
} from '../data/profile'
import { images } from '../assets/images'
import { AddReviewModal } from './AddReviewModal'
import { EditProfileModal } from './EditProfileModal'
import { BrowsingHistoryPanel } from './BrowsingHistoryPanel'
import { AddressesPanel } from './AddressesPanel'
import { PaymentMethodsPanel } from './PaymentMethodsPanel'
import { NotificationsPanel } from './NotificationsPanel'
import EditBoxLineIcon from 'remixicon-react/EditBoxLineIcon'
import LockFillIcon from 'remixicon-react/LockFillIcon'
import ShieldCheckFillIcon from 'remixicon-react/ShieldCheckFillIcon'

import type { AccountSection } from '../data/accountRoutes'

export type { AccountSection } from '../data/accountRoutes'

type YourOrdersViewProps = {
  onGoHome: () => void
  section: AccountSection
  onSectionChange: (section: AccountSection) => void
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

function OrderCard({ order }: { order: OrderRecord }) {
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
            className="flex h-8.5 cursor-pointer items-center justify-center rounded-full bg-orange-light px-4 text-sm font-medium leading-4 tracking-[-0.28px] text-primary-orange"
          >
            Buy Again
          </button>
          <button
            type="button"
            className="flex h-8.5 cursor-pointer items-center justify-center rounded-full bg-bg-secondary px-4 text-sm font-medium leading-4 tracking-[-0.28px] text-text-primary"
          >
            Return/Refund
          </button>
          <button
            type="button"
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

function OrdersPanel() {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredOrders = filterOrders(activeFilter).filter((order) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return order.id.toLowerCase().includes(query)
  })

  const emptyStateMessage = getOrdersEmptyStateMessage(activeFilter, searchQuery.trim().length > 0)

  return (
    <>
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
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <AccountEmptyState message={emptyStateMessage} />
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 xl:hidden">
        <p className="col-span-2 text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
          Buy this again
        </p>
        {buyAgainProducts.map((product) => (
          <div
            key={`mobile-${product.id}`}
            className="overflow-hidden rounded-2xl border border-border-primary p-2"
          >
            <BuyAgainProductCard product={product} />
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
}: {
  primaryAction: ReactNode
}) {
  return (
    <div className="flex w-full items-center gap-4 lg:w-54 lg:flex-col lg:items-center lg:gap-4">
      {primaryAction}
      <button
        type="button"
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
}: {
  review: WaitingReviewRecord
  onAddReview: (review: WaitingReviewRecord) => void
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
      />
    </article>
  )
}

function ReviewedReviewRow({ review }: { review: ReviewedReviewRecord }) {
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

  return (
    <>
      <AddReviewModal
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

      {filteredReviews.length > 0 ? (
        <div className="px-4">
          <div className="flex flex-col">
            {activeFilter === 'waiting'
              ? visibleReviews.map((review) => (
                  <WaitingReviewRow
                    key={review.id}
                    review={review}
                    onAddReview={setReviewModalTarget}
                  />
                ))
              : visibleReviews.map((review) => (
                  <ReviewedReviewRow key={review.id} review={review} />
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

function BuyAgainProductCard({ product }: { product: BuyAgainProduct }) {
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

function DefaultAddressCard({ onEdit }: { onEdit: () => void }) {
  return (
    <div className="flex gap-4 rounded-firm-2 bg-bg-secondary p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-primary">
          Default Address
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-primary">
            {defaultAddress.contactName} | {defaultAddress.phone}
          </p>
          <div className="flex flex-col gap-2 text-sm leading-4.5 tracking-[-0.28px] text-text-primary">
            <p>{defaultAddress.line1}</p>
            <p>{defaultAddress.line2}</p>
          </div>
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

function PaymentMethodCard({ onEdit }: { onEdit: () => void }) {
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
            <span className="text-sm leading-4.5 tracking-[-0.28px] text-text-primary">
              {paymentMethod.provider}
            </span>
            <span className="text-sm leading-4.5 tracking-[-0.28px] text-text-primary">
              {paymentMethod.maskedEmail}
            </span>
          </div>
          <p className="text-base leading-5 tracking-[-0.32px] text-text-secondary">
            Added: {paymentMethod.addedOn}
          </p>
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
}: {
  profile: { fullName: string; email: string; initials: string }
  onEditProfile: () => void
  onEditAddress: () => void
  onEditPaymentMethod: () => void
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
          className="flex w-fit cursor-pointer items-center justify-center rounded-full bg-text-primary px-4 py-2 text-base font-medium leading-5 tracking-[-0.32px] text-text-inverse lg:ml-auto lg:shrink-0"
        >
          Edit profile
        </button>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:gap-8 lg:px-6">
        <div className="min-w-0 flex-1">
          <DefaultAddressCard onEdit={onEditAddress} />
        </div>
        <div className="min-w-0 flex-1">
          <PaymentMethodCard onEdit={onEditPaymentMethod} />
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
  const [profile, setProfile] = useState(() => ({ ...userProfile }))

  const handleProfileUpdate = (fullName: string) => {
    setProfile({
      fullName,
      email: profile.email,
      initials: getProfileInitials(fullName),
    })
  }

  return (
    <>
      <EditProfileModal
        isOpen={isEditModalOpen}
        fullName={profile.fullName}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleProfileUpdate}
      />

      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'personal' ? (
        <PersonalInformationPanel
          profile={profile}
          onEditProfile={() => setIsEditModalOpen(true)}
          onEditAddress={() => onSectionChange('addresses')}
          onEditPaymentMethod={() => onSectionChange('payments')}
        />
      ) : (
        <AccountSecurityPanel />
      )}
    </>
  )
}

function BuyAgainSidebar() {
  return (
    <aside className="hidden w-37.5 shrink-0 flex-col overflow-hidden rounded-2xl border border-border-primary xl:flex">
      <div className="border-b border-border-primary px-2 py-3">
        <p className="text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
          Buy this again
        </p>
      </div>
      <div className="flex flex-col gap-2 p-2">
        {buyAgainProducts.map((product) => (
          <BuyAgainProductCard key={product.id} product={product} />
        ))}
      </div>
    </aside>
  )
}

export function YourOrdersView({ onGoHome, section, onSectionChange }: YourOrdersViewProps) {
  return (
    <>
      <AccountBreadcrumbs onGoHome={onGoHome} section={section} />

      <section className="border-t border-border-primary px-4 pb-10 pt-6 lg:px-16 lg:pt-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <AccountSidebar activeSection={section} onSectionChange={onSectionChange} />

          <div className="min-w-0 flex-1">
            {section === 'orders' ? (
              <OrdersPanel />
            ) : section === 'reviews' ? (
              <ReviewsPanel />
            ) : section === 'profile' ? (
              <ProfilePanel onSectionChange={onSectionChange} />
            ) : section === 'history' ? (
              <BrowsingHistoryPanel />
            ) : section === 'addresses' ? (
              <AddressesPanel />
            ) : section === 'payments' ? (
              <PaymentMethodsPanel />
            ) : (
              <NotificationsPanel />
            )}
          </div>

          {section === 'orders' ? <BuyAgainSidebar /> : null}
        </div>
      </section>
    </>
  )
}
