export type ReviewFilter = 'waiting' | 'reviewed'

export type WaitingReviewRecord = {
  id: string
  productName: string
  productImage: string
  orderId: string
  deliveredOn: string
  priceCurrency: string
  priceAmount: string
  quantity: number
}

export type ReviewedReviewRecord = WaitingReviewRecord

export const reviewFilterTabs: { id: ReviewFilter; label: string }[] = [
  { id: 'waiting', label: 'Waiting for review' },
  { id: 'reviewed', label: 'Reviewed' },
]

/**
 * No seed rows: the reviews API is the only source of truth, so an account with
 * nothing to review shows the empty state rather than placeholder products.
 */
export const waitingReviews: WaitingReviewRecord[] = []

export const reviewedReviews: ReviewedReviewRecord[] = []

export const WAITING_REVIEWS_PAGE_SIZE = 3
export const REVIEWED_REVIEWS_PAGE_SIZE = 4

export function filterReviews(
  activeFilter: ReviewFilter,
  waitingItems: WaitingReviewRecord[],
  reviewedItems: ReviewedReviewRecord[],
): WaitingReviewRecord[] | ReviewedReviewRecord[] {
  switch (activeFilter) {
    case 'waiting':
      return waitingItems
    case 'reviewed':
      return reviewedItems
    default: {
      const exhaustiveCheck: never = activeFilter
      return exhaustiveCheck
    }
  }
}

export function getReviewsEmptyStateMessage(): string {
  return "You don't have any reviews"
}
