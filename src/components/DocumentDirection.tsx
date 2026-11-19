import { useEffect } from 'react'
import { useShopperCountry } from '../hooks/useShopperCountry'
import {
  applyDocumentDirection,
  directionForCountry,
  readDirectionOverride,
  writeStoredDirection,
} from '../utils/layoutDirection'

/**
 * Sets `<html dir>` from the shopper's market. Renders nothing.
 *
 * The market comes from the same place the catalog prices come from:
 *  1. Signed in: the catalog destination (default address country, else the
 *     country of residence). See `useProductDestination`.
 *  2. Otherwise: the country the API resolves for the visitor
 *     (`GET /locale`, from the request IP). It is the same lookup that gives a
 *     guest GHS prices in Ghana and AED prices in the UAE.
 *
 * Until the market is known, the page keeps the direction applied at startup
 * (the previous visit's), so a returning UAE shopper does not see a
 * left-to-right flash.
 */
export function DocumentDirection() {
  const { country, isResolved } = useShopperCountry()

  useEffect(() => {
    const override = readDirectionOverride()
    if (override) {
      applyDocumentDirection(override)
      return
    }

    if (!isResolved) return

    const direction = directionForCountry(country)
    applyDocumentDirection(direction)
    writeStoredDirection(direction)
  }, [country, isResolved])

  return null
}
