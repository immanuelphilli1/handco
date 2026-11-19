import { apiRequest } from '../client'

export type LocaleResponse = {
  /** The visitor's country, resolved by the API from the request IP. */
  country?: {
    code?: string
    name?: string
  }
}

export async function getLocale(): Promise<LocaleResponse> {
  return apiRequest<LocaleResponse>('/locale', { auth: false, cart: false })
}
