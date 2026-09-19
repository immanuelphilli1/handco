import {
  privacyPolicyBlocks,
  privacyPolicyIntro,
  privacyPolicyMeta,
} from '../data/privacyPolicy'
import { LegalDocumentPageContent } from './LegalDocumentPageContent'

type PrivacyPolicyPageContentProps = {
  onGoHome: () => void
}

export function PrivacyPolicyPageContent({ onGoHome }: PrivacyPolicyPageContentProps) {
  return (
    <LegalDocumentPageContent
      breadcrumbLabel="Privacy Policy"
      title={privacyPolicyMeta.title}
      lastUpdated={privacyPolicyMeta.lastUpdated}
      intro={privacyPolicyIntro}
      blocks={privacyPolicyBlocks}
      onGoHome={onGoHome}
    />
  )
}
