import {
  securePaymentsBlocks,
  securePaymentsIntro,
  securePaymentsMeta,
} from '../data/securePayments'
import { LegalDocumentPageContent } from './LegalDocumentPageContent'

type SecurePaymentsPageContentProps = {
  onGoHome: () => void
}

export function SecurePaymentsPageContent({ onGoHome }: SecurePaymentsPageContentProps) {
  return (
    <LegalDocumentPageContent
      breadcrumbLabel="Secure Payment"
      title={securePaymentsMeta.title}
      lastUpdated={securePaymentsMeta.lastUpdated}
      intro={securePaymentsIntro}
      blocks={securePaymentsBlocks}
      onGoHome={onGoHome}
    />
  )
}
