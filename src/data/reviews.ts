import { images } from '../assets/images'

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

const waitingReviewProductName =
  '4K UHD LED QLED Smart TV 32-85 Inch Voting Function WebOS/Android System Audio Conference System for Home Hotel Commercial Use'

const waitingReviewProductImage = images.featured.speaker

export const waitingReviews: WaitingReviewRecord[] = [
  {
    id: 'waiting-review-1',
    productName: waitingReviewProductName,
    productImage: waitingReviewProductImage,
    orderId: 'PO-077-08907616420471803',
    deliveredOn: '20-07-26',
    priceCurrency: 'AED',
    priceAmount: '11000',
    quantity: 1,
  },
  {
    id: 'waiting-review-2',
    productName: waitingReviewProductName,
    productImage: waitingReviewProductImage,
    orderId: 'PO-077-08907616420471804',
    deliveredOn: '20-07-26',
    priceCurrency: 'AED',
    priceAmount: '11000',
    quantity: 1,
  },
  {
    id: 'waiting-review-3',
    productName: waitingReviewProductName,
    productImage: waitingReviewProductImage,
    orderId: 'PO-077-08907616420471805',
    deliveredOn: '20-07-26',
    priceCurrency: 'AED',
    priceAmount: '11000',
    quantity: 1,
  },
  {
    id: 'waiting-review-4',
    productName: waitingReviewProductName,
    productImage: waitingReviewProductImage,
    orderId: 'PO-077-08907616420471806',
    deliveredOn: '20-07-26',
    priceCurrency: 'AED',
    priceAmount: '11000',
    quantity: 1,
  },
  {
    id: 'waiting-review-5',
    productName: waitingReviewProductName,
    productImage: waitingReviewProductImage,
    orderId: 'PO-077-08907616420471807',
    deliveredOn: '20-07-26',
    priceCurrency: 'AED',
    priceAmount: '11000',
    quantity: 1,
  },
  {
    id: 'waiting-review-6',
    productName: waitingReviewProductName,
    productImage: waitingReviewProductImage,
    orderId: 'PO-077-08907616420471808',
    deliveredOn: '20-07-26',
    priceCurrency: 'AED',
    priceAmount: '11000',
    quantity: 1,
  },
]

export const reviewedReviews: ReviewedReviewRecord[] = [
  {
    id: 'reviewed-review-1',
    productName: waitingReviewProductName,
    productImage: waitingReviewProductImage,
    orderId: 'PO-077-08907616420471803',
    deliveredOn: '20-07-26',
    priceCurrency: 'AED',
    priceAmount: '11000',
    quantity: 1,
  },
  {
    id: 'reviewed-review-2',
    productName: waitingReviewProductName,
    productImage: waitingReviewProductImage,
    orderId: 'PO-077-08907616420471804',
    deliveredOn: '20-07-26',
    priceCurrency: 'AED',
    priceAmount: '11000',
    quantity: 1,
  },
  {
    id: 'reviewed-review-3',
    productName: waitingReviewProductName,
    productImage: waitingReviewProductImage,
    orderId: 'PO-077-08907616420471805',
    deliveredOn: '20-07-26',
    priceCurrency: 'AED',
    priceAmount: '11000',
    quantity: 1,
  },
  {
    id: 'reviewed-review-4',
    productName: waitingReviewProductName,
    productImage: waitingReviewProductImage,
    orderId: 'PO-077-08907616420471806',
    deliveredOn: '20-07-26',
    priceCurrency: 'AED',
    priceAmount: '11000',
    quantity: 1,
  },
  {
    id: 'reviewed-review-5',
    productName: waitingReviewProductName,
    productImage: waitingReviewProductImage,
    orderId: 'PO-077-08907616420471807',
    deliveredOn: '20-07-26',
    priceCurrency: 'AED',
    priceAmount: '11000',
    quantity: 1,
  },
  {
    id: 'reviewed-review-6',
    productName: waitingReviewProductName,
    productImage: waitingReviewProductImage,
    orderId: 'PO-077-08907616420471808',
    deliveredOn: '20-07-26',
    priceCurrency: 'AED',
    priceAmount: '11000',
    quantity: 1,
  },
]

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
