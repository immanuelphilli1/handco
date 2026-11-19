import { useMemo } from 'react'
import type { AddressRecord } from '../data/addresses'
import { useProductDestination } from './useProductDestination'
import { useVisitorCountry } from './useVisitorCountry'

export type ShopperCountry = {
  /** ISO alpha-2 code to send as `?country=`, or undefined when unknown. */
  country: string | undefined
  /** Display name of `country`, when known. */
  countryName: string | undefined
  /** The signed-in shopper's default address, or null. */
  defaultAddress: AddressRecord | null
  /**
   * True once `country` is final, so a caller can wait instead of fetching
   * once without a country and again with one.
   */
  isResolved: boolean
}

/**
 * The country the shopper is buying for:
 *  1. Signed in: the default address country, else the country of residence
 *     (see `useProductDestination`).
 *  2. Otherwise: the visitor's country from `GET /locale` (request IP), the
 *     same market a guest's prices are quoted in.
 *
 * `useProductDestination` stops at step 1, so listings keep their current
 * behaviour. This hook adds step 2 for the surfaces that need a country for
 * guests too: the product page (shipping fee and delivery) and the layout
 * direction.
 */
export function useShopperCountry(): ShopperCountry {
  const destination = useProductDestination()
  const visitor = useVisitorCountry()

  const country = destination.country ?? visitor.code ?? undefined
  const isResolved =
    destination.isSettled && (destination.country !== undefined || visitor.isLoaded)

  let countryName: string | undefined
  if (country && destination.defaultAddress?.country.toUpperCase() === country) {
    countryName = destination.defaultAddress.countryName
  } else if (country && country === visitor.code) {
    countryName = visitor.name ?? undefined
  }

  const { defaultAddress } = destination

  return useMemo(
    () => ({ country, countryName, defaultAddress, isResolved }),
    [country, countryName, defaultAddress, isResolved],
  )
}
