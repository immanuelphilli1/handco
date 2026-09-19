import {
  intellectualPropertyBlocks,
  intellectualPropertyIntro,
  intellectualPropertyMeta,
} from '../data/intellectualProperty'
import { LegalDocumentPageContent } from './LegalDocumentPageContent'

type IntellectualPropertyPageContentProps = {
  onGoHome: () => void
}

export function IntellectualPropertyPageContent({ onGoHome }: IntellectualPropertyPageContentProps) {
  return (
    <LegalDocumentPageContent
      breadcrumbLabel="Intellectual Property"
      title={intellectualPropertyMeta.title}
      lastUpdated={intellectualPropertyMeta.lastUpdated}
      intro={intellectualPropertyIntro}
      blocks={intellectualPropertyBlocks}
      onGoHome={onGoHome}
    />
  )
}
