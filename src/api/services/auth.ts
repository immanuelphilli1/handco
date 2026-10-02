import { apiRequest, persistAuthResponse } from '../client'
import type { AuthUser } from '../../data/auth'
import type {
  AuthResponse,
  CheckEmailResponse,
  GoogleOAuthUrlResponse,
} from '../types'

export async function checkEmail(email: string): Promise<CheckEmailResponse> {
  return apiRequest<CheckEmailResponse>('/auth/check-email', {
    method: 'POST',
    body: { email },
    auth: false,
    cart: false,
  })
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })
  return persistAuthResponse(response)
}

export async function register(input: {
  email: string
  password: string
  fullName?: string
  displayName?: string
}): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: {
      email: input.email,
      password: input.password,
      password_confirmation: input.password,
      fullName: input.fullName ?? input.email.split('@')[0],
      displayName: input.displayName ?? input.fullName ?? input.email.split('@')[0],
    },
    auth: false,
  })
  return persistAuthResponse(response)
}

export async function getMe(): Promise<{ user: AuthUser }> {
  return apiRequest<{ user: AuthUser }>('/auth/me')
}

export async function logout(): Promise<void> {
  await apiRequest<void>('/auth/logout', { method: 'POST' })
}

export async function forgotPassword(email: string): Promise<void> {
  await apiRequest<void>('/auth/forgot-password', {
    method: 'POST',
    body: { email },
    auth: false,
    cart: false,
  })
}

/**
 * Step 1 of Google sign-in: ask the API for a Google consent URL and its CSRF
 * state. The API does all the Google work, so the client needs no Google SDK,
 * client id, or client secret. No auth needed; a fresh pair is required on every
 * click because `state` is single-use.
 */
export async function getGoogleOAuthUrl(): Promise<GoogleOAuthUrlResponse> {
  return apiRequest<GoogleOAuthUrlResponse>('/auth/oauth/google/url', {
    method: 'GET',
    auth: false,
    cart: false,
  })
}

/**
 * Step 2: trade the one-time `code` from Google's callback for a session. Sends
 * the guest `X-Cart-Id` so the guest cart merges into the account's cart, and
 * stores the tokens exactly as email sign-in does.
 */
export async function oauthGoogleSignIn(input: {
  code: string
  state: string
}): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/oauth/google', {
    method: 'POST',
    body: input,
    auth: false,
  })
  return persistAuthResponse(response)
}
