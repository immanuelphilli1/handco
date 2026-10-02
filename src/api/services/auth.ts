import { apiRequest, persistAuthResponse } from '../client'
import type { AuthUser } from '../../data/auth'
import type { AuthResponse, CheckEmailResponse } from '../types'

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

export async function oauthSignIn(
  provider: 'google' | 'facebook' | 'apple',
  input: { idToken: string; email?: string; fullName?: string },
): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>(`/auth/oauth/${provider}`, {
    method: 'POST',
    body: input,
    auth: false,
  })
  return persistAuthResponse(response)
}
