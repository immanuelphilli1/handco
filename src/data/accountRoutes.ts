export type AccountSection =
  | 'orders'
  | 'reviews'
  | 'profile'
  | 'history'
  | 'addresses'
  | 'payments'
  | 'notifications'

const accountSectionPaths: Record<AccountSection, string> = {
  orders: 'orders',
  reviews: 'reviews',
  profile: 'profile',
  history: 'history',
  addresses: 'addresses',
  payments: 'payments',
  notifications: 'notifications',
}

export function getAccountPath(section: AccountSection): string {
  return `/account/${accountSectionPaths[section]}`
}

export function parseAccountSection(param: string | undefined): AccountSection | null {
  if (!param) return null

  const match = Object.entries(accountSectionPaths).find(([, path]) => path === param)
  return match ? (match[0] as AccountSection) : null
}
