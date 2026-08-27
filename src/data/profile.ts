export type ProfileTab = 'personal' | 'security'

export type UserProfile = {
  fullName: string
  email: string
  initials: string
}

export type DefaultAddress = {
  contactName: string
  phone: string
  line1: string
  line2: string
}

export type PaymentMethod = {
  provider: string
  maskedEmail: string
  addedOn: string
}

export type SecuritySettings = {
  email: string
  phone: string | null
  twoFactorEnabled: boolean
}

export const profileTabs: { id: ProfileTab; label: string }[] = [
  { id: 'personal', label: 'Personal Information' },
  { id: 'security', label: 'Account & Security' },
]

export const userProfile: UserProfile = {
  fullName: 'Vikers Junior',
  email: 'vikersjunior@gmail.com',
  initials: 'VJ',
}

export const defaultAddress: DefaultAddress = {
  contactName: 'Clement Nii Odai Afotey',
  phone: '+233 54 271 7127',
  line1: 'Room 231 - Al Ahdab Tower',
  line2: 'Al Nahda 2 Dubai, UAE',
}

export const paymentMethod: PaymentMethod = {
  provider: 'Paypal',
  maskedEmail: 'vik***r@g**.com',
  addedOn: '12/12/26',
}

export const securitySettings: SecuritySettings = {
  email: 'vikejnr@gmail.com',
  phone: null,
  twoFactorEnabled: false,
}

export const privacyNotice =
  'Your information and privacy will be kept secure and uncompromised.'

export const accountProtectionTitle = 'Your account is protected'

export const accountProtectionDescription =
  'Your H&CO account is protected by advanced security. Keeping this information up-to-date safeguards your account even more.'

export function getProfileInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}
