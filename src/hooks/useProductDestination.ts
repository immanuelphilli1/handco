import { useEffect, useMemo, useState } from 'react'
import { accountApi } from '../api'
import { resolvePreferredCountryToCode } from '../api/services/account'
import {
  onPreferredCountryChanged,
  readStoredPreferredCountry,
} from '../api/preferredCountry'
import { mapApiAddresses } from '../api/mappers'
import type { ProductDestination } from '../api/services/catalog'
import { useAuth } from '../context/AuthContext'
import type { AddressRecord } from '../data/addresses'

/**
 * Destination used for catalog reads.
 *
 * The API only returns delivery quotes and tax-inclusive prices for a known
 * destination, and rejects a delivery filter without one (422
 * `destination_required`), so the client has to supply a country when it can.
 *
 * Resolution order for signed-in shoppers:
 *  1. Default shipping address country — where the order will actually go.
 *  2. Country of residence from the last `PUT /users/me/country` (session cache).
 *  3. Nothing — omit `?country=` (signed-out shoppers always stop here).
 */
export const DEFAULT_DESTINATION_COUNTRY: string | undefined = undefined

/** Coerces a stored country name or code into an ISO alpha-2 code. */
function toCountryCode(country: string | undefined | null): string | undefined {
  const value = (country ?? '').trim()
  if (!value) return undefined

  return /^[A-Za-z]{2}$/.test(value) ? value.toUpperCase() : undefined
}

export type UseProductDestinationResult = ProductDestination & {
  /** The signed-in shopper's default address, or null (always null for guests). */
  defaultAddress: AddressRecord | null
  /** True until the default address lookup settles. */
  isLoading: boolean
  /**
   * True once the destination is final for the current shopper: always for
   * guests, and for signed-in shoppers once the address / residence lookup has
   * finished. Unlike `isLoading`, this also covers that lookup, so a caller can
   * tell "no destination" apart from "not known yet".
   */
  isSettled: boolean
}

export function useProductDestination(): UseProductDestinationResult {
  const { authUser, isBootstrapping } = useAuth()
  const isAuthenticated = authUser !== null
  const [resolvedCountryCode, setResolvedCountryCode] = useState<string | null>(null)
  const [resolvedDefaultAddress, setResolvedDefaultAddress] = useState<AddressRecord | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)
  // The lookup that last finished, so a new shopper or a refresh reads as
  // unsettled until its own lookup completes.
  const lookupKey = `${authUser?.email ?? ''}#${refreshToken}`
  const [settledLookupKey, setSettledLookupKey] = useState<string | null>(null)

  useEffect(() => onPreferredCountryChanged(() => setRefreshToken((n) => n + 1)), [])

  useEffect(() => {
    if (isBootstrapping || !isAuthenticated) return

    let cancelled = false

    async function loadDestination() {
      try {
        const addresses = mapApiAddresses(await accountApi.listAddresses())
        if (cancelled) return

        const defaultAddress = addresses.find((address) => address.isDefault)
        setResolvedDefaultAddress(defaultAddress ?? null)
        const fromAddress = toCountryCode(defaultAddress?.country)
        if (fromAddress) {
          setResolvedCountryCode(fromAddress)
          setSettledLookupKey(lookupKey)
          return
        }

        const lookupCountries = await accountApi.getCountries()
        if (cancelled) return

        const storedPreferred = readStoredPreferredCountry(authUser?.email ?? undefined)
        const fromPreferred = resolvePreferredCountryToCode(storedPreferred, lookupCountries)
        setResolvedCountryCode(fromPreferred ?? null)
        setSettledLookupKey(lookupKey)
      } catch {
        if (!cancelled) {
          setResolvedCountryCode(null)
          setResolvedDefaultAddress(null)
          setSettledLookupKey(lookupKey)
        }
      }
    }

    void loadDestination()

    return () => {
      cancelled = true
    }
  }, [authUser, isAuthenticated, isBootstrapping, lookupKey, refreshToken])

  const country =
    isBootstrapping || !isAuthenticated
      ? DEFAULT_DESTINATION_COUNTRY
      : (resolvedCountryCode ?? DEFAULT_DESTINATION_COUNTRY)
  const defaultAddress = isBootstrapping || !isAuthenticated ? null : resolvedDefaultAddress
  const isLoading = isBootstrapping
  const isSettled = !isBootstrapping && (!isAuthenticated || settledLookupKey === lookupKey)

  return useMemo(
    () => ({ country, defaultAddress, isLoading, isSettled }),
    [country, defaultAddress, isLoading, isSettled],
  )
}
