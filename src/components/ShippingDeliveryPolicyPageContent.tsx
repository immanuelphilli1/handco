import {
  shippingDeliveryPolicyBlocks,
  shippingDeliveryPolicyIntro,
  shippingDeliveryPolicyMeta,
} from '../data/shippingDeliveryPolicy'
import { LegalDocumentPageContent } from './LegalDocumentPageContent'

type ShippingDeliveryPolicyPageContentProps = {
  onGoHome: () => void
}

export function ShippingDeliveryPolicyPageContent({
  onGoHome,
}: ShippingDeliveryPolicyPageContentProps) {
  return (
    <LegalDocumentPageContent
      breadcrumbLabel="Shipping & Delivery"
      title={shippingDeliveryPolicyMeta.title}
      lastUpdated={shippingDeliveryPolicyMeta.lastUpdated}
      intro={shippingDeliveryPolicyIntro}
      blocks={shippingDeliveryPolicyBlocks}
      onGoHome={onGoHome}
    />
  )
}
