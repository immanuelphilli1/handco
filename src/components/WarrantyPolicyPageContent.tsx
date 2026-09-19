import {
  warrantyPolicyBlocks,
  warrantyPolicyIntro,
  warrantyPolicyMeta,
} from '../data/warrantyPolicy'
import { LegalDocumentPageContent } from './LegalDocumentPageContent'

type WarrantyPolicyPageContentProps = {
  onGoHome: () => void
}

export function WarrantyPolicyPageContent({ onGoHome }: WarrantyPolicyPageContentProps) {
  return (
    <LegalDocumentPageContent
      breadcrumbLabel="Warranty"
      title={warrantyPolicyMeta.title}
      lastUpdated={warrantyPolicyMeta.lastUpdated}
      intro={warrantyPolicyIntro}
      blocks={warrantyPolicyBlocks}
      onGoHome={onGoHome}
    />
  )
}
