/**
 * Page direction per shopper market.
 *
 * Every market currently gets the left-to-right layout. The right-to-left
 * (mirrored) layout is kept working but switched off: add a country code to
 * `RTL_COUNTRY_CODES` (the UAE was 'AE') to turn it back on for that market.
 * Only the layout is mirrored: the copy stays in English. Components therefore
 * use logical utilities (`ms-*`, `pe-*`, `start-*`) and flip direction-bearing
 * icons with
 * `rtl:-scale-x-100`, so one set of markup serves both directions.
 */
export type LayoutDirection = 'ltr' | 'rtl'

/**
 * ISO 3166-1 alpha-2 codes of the markets that browse right-to-left. Empty:
 * the UAE was moved back to the international left-to-right layout.
 */
const RTL_COUNTRY_CODES = new Set<string>()

/** Last direction used, so the next visit starts in it instead of flashing LTR. */
const STORED_DIRECTION_KEY = 'handco.layoutDirection'

/**
 * QA override, set with `?dir=rtl` or `?dir=ltr` and cleared with `?dir=auto`.
 * It lasts for the browser tab, so the UAE layout can be checked from outside
 * the UAE without signing in with a UAE address.
 */
const OVERRIDE_DIRECTION_KEY = 'handco.layoutDirection.override'

function isLayoutDirection(value: unknown): value is LayoutDirection {
  return value === 'ltr' || value === 'rtl'
}

export function directionForCountry(countryCode: string | null | undefined): LayoutDirection {
  const code = (countryCode ?? '').trim().toUpperCase()
  return RTL_COUNTRY_CODES.has(code) ? 'rtl' : 'ltr'
}

export function applyDocumentDirection(direction: LayoutDirection): void {
  const root = document.documentElement
  if (root.dir !== direction) {
    root.dir = direction
  }
}

export function readStoredDirection(): LayoutDirection | null {
  try {
    const value = localStorage.getItem(STORED_DIRECTION_KEY)
    return isLayoutDirection(value) ? value : null
  } catch {
    return null
  }
}

export function writeStoredDirection(direction: LayoutDirection): void {
  try {
    localStorage.setItem(STORED_DIRECTION_KEY, direction)
  } catch {
    // Storage may be unavailable (private mode, blocked site data).
  }
}

/**
 * Reads the QA override, picking up a `?dir=` query parameter first. Returns
 * null when no override is active.
 */
export function readDirectionOverride(): LayoutDirection | null {
  try {
    const param = new URLSearchParams(window.location.search).get('dir')
    if (param === 'auto') {
      sessionStorage.removeItem(OVERRIDE_DIRECTION_KEY)
      return null
    }
    if (isLayoutDirection(param)) {
      sessionStorage.setItem(OVERRIDE_DIRECTION_KEY, param)
      return param
    }

    const stored = sessionStorage.getItem(OVERRIDE_DIRECTION_KEY)
    return isLayoutDirection(stored) ? stored : null
  } catch {
    return null
  }
}

/**
 * Applies the best direction available before React renders: the QA override,
 * else the direction of the previous visit, else left-to-right.
 *
 * A stored right-to-left direction is ignored while no market uses it, so a
 * UAE shopper who visited while the mirrored layout was on does not open in it.
 */
export function applyInitialDocumentDirection(): void {
  const stored = readStoredDirection()
  const usable = stored === 'rtl' && RTL_COUNTRY_CODES.size === 0 ? null : stored
  applyDocumentDirection(readDirectionOverride() ?? usable ?? 'ltr')
}

/**
 * +1 in a left-to-right element, -1 in a right-to-left one.
 *
 * Horizontal scroll offsets are mirrored in RTL: `scrollLeft` starts at 0 and
 * goes negative towards the end, and a positive `scrollBy({ left })` moves
 * towards the start. Multiplying "forward" distances by this keeps carousel
 * buttons moving the way their arrows point in both directions.
 */
export function inlineDirectionSign(element: Element): 1 | -1 {
  return window.getComputedStyle(element).direction === 'rtl' ? -1 : 1
}
