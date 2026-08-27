import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import ArrowDownSLineIcon from 'remixicon-react/ArrowDownSLineIcon'
import CloseFillIcon from 'remixicon-react/CloseFillIcon'
import LockFillIcon from 'remixicon-react/LockFillIcon'
import {
  addressCities,
  addressCountries,
  addressRegions,
  emptyAddressForm,
  type AddressFormValues,
} from '../data/addresses'
import { privacyNotice } from '../data/profile'

type AddAddressModalProps = {
  isOpen: boolean
  mode: 'add' | 'edit'
  initialValues?: AddressFormValues
  onClose: () => void
  onSubmit: (values: AddressFormValues) => void
}

function FloatingField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label
      htmlFor={id}
      className="flex h-14 w-full flex-col justify-center overflow-hidden rounded-2xl border-[1.5px] border-border-primary px-4"
    >
      <span className="text-xs font-medium leading-4 tracking-[-0.24px] text-text-secondary">
        {label}
      </span>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-base font-medium leading-5 tracking-[-0.32px] text-text-primary outline-none placeholder:text-text-tertiary"
      />
    </label>
  )
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder: string
}) {
  return (
    <label
      htmlFor={id}
      className="relative flex h-14 w-full items-center overflow-hidden rounded-2xl border border-border-secondary px-4"
    >
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full appearance-none bg-transparent pr-8 text-base leading-5 tracking-[-0.32px] outline-none ${
          value ? 'font-medium text-text-primary' : 'font-normal text-text-tertiary'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ArrowDownSLineIcon
        className="pointer-events-none absolute right-4 size-6 text-text-secondary"
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </label>
  )
}

function DefaultAddressToggle({
  selected,
  onToggle,
}: {
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex cursor-pointer items-center gap-4"
      aria-pressed={selected}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? 'border-text-primary bg-text-primary' : 'border-border-secondary bg-bg-primary'
        }`}
        aria-hidden
      >
        {selected ? <span className="size-3 rounded-full bg-bg-primary" /> : null}
      </span>
      <span className="text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
        Default Address
      </span>
    </button>
  )
}

export function AddAddressModal({
  isOpen,
  mode,
  initialValues,
  onClose,
  onSubmit,
}: AddAddressModalProps) {
  const [form, setForm] = useState<AddressFormValues>(emptyAddressForm)

  useEffect(() => {
    if (!isOpen) return
    setForm(initialValues ?? emptyAddressForm)
  }, [initialValues, isOpen])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleClose, isOpen])

  const updateField = <K extends keyof AddressFormValues>(key: K, value: AddressFormValues[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = () => {
    onSubmit(form)
    handleClose()
  }

  if (!isOpen) return null

  const title = mode === 'edit' ? 'Edit Address' : 'Add Address'
  const submitLabel = mode === 'edit' ? 'Save Address' : 'Add Address'

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close add address modal"
        className="fixed inset-0 z-50 bg-[rgba(0,6,7,0.3)]"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-address-title"
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[min(680px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-bg-primary"
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-border-primary px-6 py-4">
          <h2
            id="add-address-title"
            className="min-w-0 flex-1 text-base font-semibold leading-5 tracking-[-0.32px] text-text-secondary"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex size-6 shrink-0 cursor-pointer items-center justify-center"
          >
            <CloseFillIcon className="size-6 text-text-secondary" aria-hidden />
          </button>
        </div>

        <div className="overflow-y-auto">
          <div className="flex flex-col gap-4 p-4 lg:p-6">
            <div className="flex items-start gap-1">
              <LockFillIcon className="size-6 shrink-0 text-primary-green" aria-hidden />
              <p className="text-sm leading-4.5 tracking-[-0.28px] text-primary-green">{privacyNotice}</p>
            </div>

            <SelectField
              id="address-country"
              label="Country"
              value={form.country}
              onChange={(value) => updateField('country', value)}
              options={addressCountries}
              placeholder="Select country"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FloatingField
                id="address-first-name"
                label="First name*"
                value={form.firstName}
                onChange={(value) => updateField('firstName', value)}
              />
              <FloatingField
                id="address-last-name"
                label="Last Name*"
                value={form.lastName}
                onChange={(value) => updateField('lastName', value)}
              />
            </div>

            <label
              htmlFor="address-phone-number"
              className="flex h-14 w-full flex-col justify-center overflow-hidden rounded-2xl border-[1.5px] border-border-primary px-4"
            >
              <span className="text-xs font-medium leading-4 tracking-[-0.24px] text-text-secondary">
                Phone number*
              </span>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
                  {form.phoneCountryCode}
                </span>
                <span aria-hidden className="h-6 w-px bg-border-secondary" />
                <input
                  id="address-phone-number"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(event) => updateField('phoneNumber', event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-base font-medium leading-5 tracking-[-0.32px] text-text-primary outline-none"
                />
              </div>
            </label>

            <FloatingField
              id="address-line"
              label="Address*"
              value={form.addressLine}
              onChange={(value) => updateField('addressLine', value)}
              placeholder="Street, apartment/house/unit etc"
            />

            <SelectField
              id="address-region"
              label="Region"
              value={form.region}
              onChange={(value) => updateField('region', value)}
              options={addressRegions}
              placeholder="State/Province/house/Region*"
            />

            <SelectField
              id="address-city"
              label="City"
              value={form.city}
              onChange={(value) => updateField('city', value)}
              options={addressCities}
              placeholder="City*"
            />

            <DefaultAddressToggle
              selected={form.isDefault}
              onToggle={() => updateField('isDefault', !form.isDefault)}
            />
          </div>

          <div className="flex flex-col gap-4 border-t border-border-primary p-4 lg:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex h-13 cursor-pointer items-center justify-center rounded-full bg-bg-secondary px-6 text-base font-medium leading-5 tracking-[-0.32px] text-text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="btn-orange flex h-13 cursor-pointer items-center justify-center rounded-full px-6 text-base font-medium leading-5 tracking-[-0.32px] text-text-inverse"
              >
                {submitLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
