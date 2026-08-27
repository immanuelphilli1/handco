import { images } from '../assets/images'
import type { Product } from './products'
import { defaultAddress } from './profile'

export type CartItem = {
  id: string
  name: string
  variant: string
  image: string
  currency: string
  price: number
  quantity: number
  selected: boolean
}

export type CheckoutPaymentMethodId =
  | 'card'
  | 'apple_pay'
  | 'google_pay'
  | 'paypal'
  | 'tabby'
  | 'tamara'

export type CheckoutPaymentMethod = {
  id: CheckoutPaymentMethodId
  label: string
  icon?: string
  secondaryIcon?: string
  note?: string
}

export const cartOrderSummary = {
  itemsTotal: 'AED 1100',
  itemsDiscount: '- AED 1100',
  subtotal: 'AED 1100',
  shipping: 'AED 20',
  total: 'AED 10000',
  paymentNote: 'Please refer to your final actual payment amount.',
  availabilityNote:
    'items availability and pricing are not guaranteed until payment is final.',
  chargeNote: 'You will not be charged until you review this order on the next page.',
}

export const checkoutLegalCopy =
  'By submitting your order, you agree to our Terms of Use and Privacy Policy.'

export const securePaymentsCopy =
  'Every payment you make on H&CO is secured with strict SSL encryption and PCI DSS data protection protocols'

export const securePrivacyCopy =
  'Protecting your privacy is important to us! Please be assured that your information will be kept secured and uncompromised. We do not sell your personal information for money and will only use your information in accordance with our privacy and cookie policy to provide and improve our services to you.'

export const orderCompletedCopy = {
  title: 'Thank your for your order!',
  description:
    'Your oder has been recieved  and is being processed. You will recieve an email confirmation shortly.',
  orderReference: '#HCO5241124542',
  estimatedDelivery: 'Estimated delivery date: 24-36 May',
}

export const shippingSummary = {
  fee: 'AED 200',
  deliveryWindow: 'Delivery: Aug 29-Sep 20',
  courierLabel: 'Courier company:',
}

export const initialCartItems: CartItem[] = []

export function productToCartItem(product: Product): CartItem {
  const numericPrice = Number.parseFloat(product.price.replace(/[^0-9.]/g, ''))
  const currency = product.price.includes('AED') ? 'AED' : '$'

  return {
    id: product.id,
    name: product.name,
    variant: 'Standard',
    image: product.image,
    currency,
    price: Number.isNaN(numericPrice) ? 0 : numericPrice,
    quantity: 1,
    selected: true,
  }
}

export const checkoutPaymentMethods: CheckoutPaymentMethod[] = [
  {
    id: 'card',
    label: 'Card',
    icon: images.footer.mastercard,
    secondaryIcon: images.footer.visa,
  },
  { id: 'apple_pay', label: 'Apple Pay', icon: images.footer.applePay },
  { id: 'google_pay', label: 'Google Pay', icon: images.footer.googlePay },
  { id: 'paypal', label: 'Paypal', icon: images.footer.paypal },
  { id: 'tabby', label: 'Tabby', icon: images.footer.tabby, note: 'pay in instalment' },
  {
    id: 'tamara',
    label: 'Tamara',
    icon: images.footer.tamaraIcon,
    note: 'pay in instalment',
  },
]

export const checkoutItemCount = 0

export const checkoutAddress = {
  contact: `${defaultAddress.contactName} | ${defaultAddress.phone}`,
  line1: defaultAddress.line1,
  line2: defaultAddress.line2,
}
