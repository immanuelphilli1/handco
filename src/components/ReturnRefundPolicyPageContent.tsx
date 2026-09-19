import {
  returnRefundPolicyBlocks,
  returnRefundPolicyIntro,
  returnRefundPolicyMeta,
} from '../data/returnRefundPolicy'
import { LegalDocumentPageContent } from './LegalDocumentPageContent'

type ReturnRefundPolicyPageContentProps = {
  onGoHome: () => void
}

export function ReturnRefundPolicyPageContent({ onGoHome }: ReturnRefundPolicyPageContentProps) {
  return (
    <LegalDocumentPageContent
      breadcrumbLabel="Return & Refund Policy"
      title={returnRefundPolicyMeta.title}
      lastUpdated={returnRefundPolicyMeta.lastUpdated}
      intro={returnRefundPolicyIntro}
      blocks={returnRefundPolicyBlocks}
      onGoHome={onGoHome}
    />
  )
}
