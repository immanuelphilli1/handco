import { useSyncExternalStore } from 'react'
import type { LayoutDirection } from '../utils/layoutDirection'

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] })
  return () => observer.disconnect()
}

function getSnapshot(): LayoutDirection {
  return document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
}

/**
 * The page's current direction (`<html dir>`), for the few places that move
 * content with JavaScript (transforms, `scrollTo`) rather than CSS, where
 * logical utilities cannot help.
 */
export function useDocumentDirection(): LayoutDirection {
  return useSyncExternalStore(subscribe, getSnapshot, () => 'ltr')
}
