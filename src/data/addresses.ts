export type AddressRecord = {
  id: string
  country: string
  firstName: string
  lastName: string
  phoneCountryCode: string
  phoneNumber: string
  addressLine: string
  region: string
  city: string
  cityLine: string
  isDefault: boolean
}

export type AddressFormValues = {
  country: string
  firstName: string
  lastName: string
  phoneCountryCode: string
  phoneNumber: string
  addressLine: string
  region: string
  city: string
  isDefault: boolean
}

export const addressSafeguardNotice = 'All data is safeguarded'

export const addressCountries = ['United Arab Emirates', 'Ghana', 'United States', 'United Kingdom']

export const addressRegions = ['Dubai', 'Abu Dhabi', 'Greater Accra', 'Ashanti']

export const addressCities = ['Dubai', 'Abu Dhabi', 'Accra', 'Kumasi']

export const emptyAddressForm: AddressFormValues = {
  country: '',
  firstName: 'Vikers Junior',
  lastName: 'Vikers Junior',
  phoneCountryCode: 'GH +233',
  phoneNumber: '',
  addressLine: '',
  region: '',
  city: '',
  isDefault: false,
}

export function getAddressesEmptyStateMessage(): string {
  return "You don't have any saved addresses"
}

export function formatAddressContact(address: AddressRecord): string {
  return `${address.firstName} ${address.lastName} | ${address.phoneCountryCode} ${address.phoneNumber}`
}

export function addressToFormValues(address: AddressRecord): AddressFormValues {
  return {
    country: address.country,
    firstName: address.firstName,
    lastName: address.lastName,
    phoneCountryCode: address.phoneCountryCode === '+233' ? 'GH +233' : address.phoneCountryCode,
    phoneNumber: address.phoneNumber,
    addressLine: address.addressLine,
    region: address.region,
    city: address.city,
    isDefault: address.isDefault,
  }
}

export function formValuesToAddress(
  values: AddressFormValues,
  id: string,
  cityLine?: string,
): AddressRecord {
  const phoneCountryCode = values.phoneCountryCode.replace(/^GH\s*/, '').trim()

  return {
    id,
    country: values.country,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phoneCountryCode,
    phoneNumber: values.phoneNumber.trim(),
    addressLine: values.addressLine.trim(),
    region: values.region,
    city: values.city,
    cityLine: cityLine ?? `${values.city}, ${values.country}`,
    isDefault: values.isDefault,
  }
}
