import { apiRequest } from '../client'
import type { AddressRecord } from '../../data/addresses'
import type { AuthUser } from '../../data/auth'
import type { SecuritySettings } from '../../data/profile'
import type {
  AddressesResponse,
  ApiAddress,
  ApiNotificationSetting,
  ApiPaymentMethod,
  ApiProfile,
  ApiReviewSlot,
  BrowsingHistoryResponse,
  NotificationSettingsResponse,
  PaymentMethodsResponse,
  ProfileResponse,
  ReviewsResponse,
} from '../types'

/**
 * The profile endpoints return the profile document at the top level, while
 * older deployments nest it under `profile` and may attach a `defaultAddress`
 * alongside it. Callers should not have to care, so both shapes are normalised
 * to `{ profile, defaultAddress }`.
 */
function normalizeProfileResponse(response: ProfileResponse | ApiProfile): ProfileResponse {
  if (response && 'profile' in response && response.profile) {
    return response as ProfileResponse
  }

  return { profile: response as ApiProfile }
}

export async function getProfile(): Promise<ProfileResponse> {
  return normalizeProfileResponse(await apiRequest<ProfileResponse | ApiProfile>('/users/me/profile'))
}

export async function updateProfile(input: {
  fullName?: string
  displayName?: string
}): Promise<ProfileResponse> {
  return normalizeProfileResponse(
    await apiRequest<ProfileResponse | ApiProfile>('/users/me/profile', {
      method: 'PATCH',
      body: input,
    }),
  )
}

export async function getSecurity(): Promise<SecuritySettings> {
  return apiRequest('/users/me/security')
}

export async function updateEmail(email: string, password: string): Promise<SecuritySettings> {
  return apiRequest('/users/me/email', { method: 'PATCH', body: { email, password } })
}

export async function updatePhone(phone: string): Promise<SecuritySettings> {
  return apiRequest('/users/me/phone', { method: 'PATCH', body: { phone } })
}

export async function updatePassword(
  currentPassword: string,
  password: string,
): Promise<void> {
  await apiRequest('/users/me/password', {
    method: 'PATCH',
    body: { currentPassword, password, password_confirmation: password },
  })
}

export async function deleteAccount(password: string): Promise<void> {
  await apiRequest('/users/me', { method: 'DELETE', body: { password } })
}

export async function listAddresses(): Promise<AddressesResponse | ApiAddress[]> {
  return apiRequest('/addresses')
}

export async function createAddress(
  input: Omit<AddressRecord, 'id' | 'cityLine'>,
): Promise<ApiAddress> {
  return apiRequest('/addresses', { method: 'POST', body: input })
}

export async function updateAddress(
  addressRid: string,
  input: Partial<Omit<AddressRecord, 'id' | 'cityLine'>>,
): Promise<ApiAddress> {
  return apiRequest(`/addresses/${addressRid}`, { method: 'PATCH', body: input })
}

export async function deleteAddress(addressRid: string): Promise<void> {
  await apiRequest(`/addresses/${addressRid}`, { method: 'DELETE' })
}

export async function setDefaultAddress(addressRid: string): Promise<ApiAddress> {
  return apiRequest(`/addresses/${addressRid}/default`, { method: 'PATCH', body: {} })
}

export async function duplicateAddress(addressRid: string): Promise<ApiAddress> {
  return apiRequest(`/addresses/${addressRid}/duplicate`, { method: 'POST', body: {} })
}

/**
 * Lookup rows are normalised to `{ rid, label }`. The cities endpoint takes a
 * `regionRid` (not a name), so the rid has to survive the cascade; endpoints that
 * return bare strings are given a rid equal to their label.
 */
function toLookupOptions(rows: unknown): LookupOption[] {
  if (!Array.isArray(rows)) return []

  return rows
    .map((row): LookupOption | null => {
      if (typeof row === 'string') return { rid: row, label: row }
      if (!row || typeof row !== 'object') return null

      const record = row as Record<string, unknown>
      const label =
        (typeof record.label === 'string' && record.label) ||
        (typeof record.name === 'string' && record.name) ||
        (typeof record.title === 'string' && record.title) ||
        (typeof record.code === 'string' && record.code) ||
        ''
      if (!label) return null

      const rid =
        (typeof record.rid === 'string' && record.rid) ||
        (typeof record.id === 'string' && record.id) ||
        (typeof record.code === 'string' && record.code) ||
        label

      const code = typeof record.code === 'string' ? record.code : undefined
      const phoneCode = typeof record.phoneCode === 'string' ? record.phoneCode : undefined

      return { rid, label, code, phoneCode }
    })
    .filter((row): row is LookupOption => row !== null)
}

/** Picks the first list-shaped key a lookup response might use. */
function pickRows(response: Record<string, unknown>, keys: string[]): unknown[] {
  for (const key of keys) {
    const value = response[key]
    if (Array.isArray(value)) return value
  }
  return []
}

export async function getCountries(): Promise<LookupOption[]> {
  const response = await apiRequest<Record<string, unknown>>(
    '/addresses/lookup/countries',
    { auth: false, cart: false },
  )
  return toLookupOptions(pickRows(response, ['countries', 'items', 'data']))
}

export async function getRegions(country: string): Promise<LookupOption[]> {
  const response = await apiRequest<Record<string, unknown>>(
    '/addresses/lookup/regions',
    { auth: false, cart: false, searchParams: { country } },
  )
  return toLookupOptions(pickRows(response, ['regions', 'items', 'data']))
}

export async function getCities(region: string): Promise<LookupOption[]> {
  const response = await apiRequest<Record<string, unknown>>(
    '/addresses/lookup/cities',
    { auth: false, cart: false, searchParams: { region } },
  )
  return toLookupOptions(pickRows(response, ['cities', 'items', 'data']))
}

export async function listPaymentMethods(): Promise<
  PaymentMethodsResponse | ApiPaymentMethod[]
> {
  return apiRequest('/payment-methods')
}

/**
 * Saved provider tokens only. The API deliberately exposes no create or update
 * endpoint — card details are never collected by the client — so cards are
 * created on the provider side and only listed, defaulted and deleted here.
 */
export async function deletePaymentMethod(paymentMethodRid: string): Promise<void> {
  await apiRequest(`/payment-methods/${paymentMethodRid}`, { method: 'DELETE' })
}

export async function setDefaultPaymentMethod(
  paymentMethodRid: string,
): Promise<ApiPaymentMethod> {
  return apiRequest(`/payment-methods/${paymentMethodRid}/default`, {
    method: 'PATCH',
    body: {},
  })
}

export async function getPaymentNetworks(): Promise<string[]> {
  const response = await apiRequest<{ networks?: string[]; items?: string[] }>(
    '/payment-methods/networks',
    { auth: false, cart: false },
  )
  return response.networks ?? response.items ?? []
}

export async function getWaitingReviews(page = 1, limit = 3): Promise<ReviewsResponse> {
  return apiRequest('/reviews/waiting', { searchParams: { page, limit } })
}

export async function getReviewedReviews(page = 1, limit = 4): Promise<ReviewsResponse> {
  return apiRequest('/reviews/reviewed', { searchParams: { page, limit } })
}

export async function submitReview(input: {
  reviewId: string
  rating: number
  title: string
  detailedReview: string
}): Promise<ApiReviewSlot> {
  return apiRequest('/reviews', { method: 'POST', body: input })
}

export async function getBrowsingHistory(): Promise<BrowsingHistoryResponse> {
  return apiRequest('/browsing-history')
}

export async function recordBrowsingHistory(productId: string): Promise<void> {
  // Documented as "mixed": guests may record, but the Authorization header still
  // has to go out when there is a token so the view is attributed to the
  // account. Passing `auth: false` here would strip it and record nothing useful.
  await apiRequest('/browsing-history', { method: 'POST', body: { productId } })
}

export async function deleteBrowsingHistory(rids: string[]): Promise<void> {
  await apiRequest('/browsing-history', { method: 'DELETE', body: { rids } })
}

export async function clearBrowsingHistory(): Promise<void> {
  await apiRequest('/browsing-history/all', { method: 'DELETE' })
}

export async function getNotificationSettings(): Promise<
  NotificationSettingsResponse | ApiNotificationSetting[]
> {
  return apiRequest('/notifications/settings')
}

export async function updateNotificationSetting(
  id: string,
  enabled: boolean,
): Promise<ApiNotificationSetting> {
  return apiRequest(`/notifications/settings/${id}`, {
    method: 'PATCH',
    body: { enabled },
  })
}

export type { AuthUser }

/**
 * One option in a country/region/city dropdown. `rid` is what the API expects in
 * the query string (e.g. `region=...` when fetching cities); `label` is shown to
 * the user, so the two are kept separate.
 *
 * Countries additionally carry `code` (ISO 3166-1 alpha-2) and `phoneCode`.
 * The address API stores the country as the code, not the name, and the
 * catalog needs the code as `?country=` for delivery quotes and tax.
 */
export type LookupOption = {
  rid: string
  label: string
  /** ISO 3166-1 alpha-2 code, for country lookups only. */
  code?: string
  /** International dialling code, for country lookups only. */
  phoneCode?: string
}
