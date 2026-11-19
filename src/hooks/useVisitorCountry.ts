import { useEffect, useState } from 'react'
import { cachedGet } from '../api/cache'
import { getLocale } from '../api/services/locale'

export type VisitorCountry = {
  /** ISO alpha-2 code, e.g. `GH`. Null when the API could not tell. */
  code: string | null
  /** Display name, e.g. `Ghana`. */
  name: string | null
  /** True once `GET /locale` has answered or failed. */
  isLoaded: boolean
}

/**
 * The country the API resolves for this visitor from the request IP
 * (`GET /locale`). It is the market a guest's prices and delivery are quoted
 * for. The response is cached, so every caller shares one request.
 */
export function useVisitorCountry(): VisitorCountry {
  const [state, setState] = useState<VisitorCountry>({ code: null, name: null, isLoaded: false })

  useEffect(() => {
    let cancelled = false

    cachedGet('locale', getLocale)
      .then((locale) => {
        if (cancelled) return
        const code = locale.country?.code?.trim().toUpperCase()
        setState({
          code: code && /^[A-Z]{2}$/.test(code) ? code : null,
          name: locale.country?.name?.trim() || null,
          isLoaded: true,
        })
      })
      .catch(() => {
        if (!cancelled) setState({ code: null, name: null, isLoaded: true })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
