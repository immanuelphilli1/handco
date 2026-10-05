const PREFERRED_COUNTRY_CHANGED = 'handco.preferredCountry.changed'

/** Lets catalog hooks refetch `?country=` after the profile setting changes. */
export function notifyPreferredCountryChanged(): void {
  window.dispatchEvent(new Event(PREFERRED_COUNTRY_CHANGED))
}

export function onPreferredCountryChanged(listener: () => void): () => void {
  window.addEventListener(PREFERRED_COUNTRY_CHANGED, listener)
  return () => window.removeEventListener(PREFERRED_COUNTRY_CHANGED, listener)
}
