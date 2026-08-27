export type SignInStep = 'email' | 'password'

export type AuthUser = {
  displayName: string
  fullName: string
  email: string
}

export const defaultSignedInUser: AuthUser = {
  displayName: 'Vikers',
  fullName: 'Vikers Junior',
  email: 'vikersjunior@gmail.com',
}

export const signInLegalCopy =
  'By continuing, you agree to our Terms of Use and Privacy Policy.'

export const socialSignInProviders = [
  { id: 'google', label: 'Continue with Google' },
  { id: 'facebook', label: 'Continue with Facebook' },
  { id: 'apple', label: 'Continue with Apple' },
] as const
