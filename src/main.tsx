import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setupViewportReset } from './utils/viewport.ts'
import { applyInitialDocumentDirection } from './utils/layoutDirection.ts'

// Before the first render, so a returning UAE shopper never sees the
// left-to-right layout flash in while their market is looked up again.
applyInitialDocumentDirection()

function Root() {
  useEffect(() => setupViewportReset(), [])

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
