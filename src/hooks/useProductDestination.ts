import { useEffect, useMemo, useState } from 'react'
import { accountApi } from '../api'
import { mapApiAddresses } from '../api/mappers'
import type { ProductDestination } from '../api/services/catalog'
import { useAuth } from '../context/AuthContext'

/**
 * Destination used for catalog reads.
 *
 * The API only returns delivery quotes and tax-inclusive prices for a known
 * destination, and rejects a delivery filter without one (422
 * `destination_required`), so the client has to supply a country.
 *
 * Resolution order:
 *  1. the signed-in customer's default address country, since that is where their
 *     order will actually ship;
 *  2. `DEFAULT_DESTINATION_COUNTRY` otherwise, so signed-out browsing still gets
 *     delivery information rather than an empty filter.
 */
export const DEFAULT_DESTINATION_COUNTRY = 'AE'

/** Coerces a stored country name or code into an ISO alpha-2 code. */
function toCountryCode(country: string | undefined | null): string | undefined {
  const value = (country ?? '').trim()
  if (!value) return undefined

  return /^[A-Za-z]{2}$/.test(value) ? value.toUpperCase() : undefined
}

export type UseProductDestinationResult = ProductDestination & {
  /** True until the default address lookup settles. */
  isLoading: boolean
}

export function useProductDestination(): UseProductDestinationResult {
  const { authUser, isBootstrapping } = useAuth()
  const isAuthenticated = authUser !== null
  // The resolved country, or null while it is unknown. The default destination
  // is applied when deriving the result rather than written back into state, so
  // the signed-out path needs no effect at all.
  const [resolvedCountryCode, setResolvedCountryCode] = useState<string | null>(null)

  useEffect(() => {
    // While the session is still being restored there may be a signed-in
    // customer whose default address has not been read yet, so the lookup is
    // held back until the auth state has settled.
    if (isBootstrapping) return
    if (!isAuthenticated) return

    let cancelled = false

    async function loadDestination() {
      try {
        const addresses = mapApiAddresses(await accountApi.listAddresses())
        if (cancelled) return

        const defaultAddress = addresses.find((address) => address.isDefault)
        const resolved = toCountryCode(defaultAddress?.country)
        if (resolved) {
          setResolvedCountryCode(resolved)
        }
      } catch {
        // Keep the default destination when the lookup fails.
      }
    }

    void loadDestination()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, isBootstrapping])

  const country = resolvedCountryCode ?? DEFAULT_DESTINATION_COUNTRY
  // Loading only while the session itself is unresolved. A signed-in customer's
  // address lookup is allowed to land after the first paint: the default
  // destination is already in use and the catalog simply refetches when the
  // real country arrives, so there is no loader to hold up.
  const isLoading = isBootstrapping

  // Memoized so the object identity is stable across renders; it is part of the
  // dependency list of the catalog effects, which would otherwise refetch
  // whenever a new literal was created.
  return useMemo(() => ({ country, isLoading }), [country, isLoading])
}