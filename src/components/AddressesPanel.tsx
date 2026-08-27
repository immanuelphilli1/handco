import { useState } from 'react'
import DeleteBin7LineIcon from 'remixicon-react/DeleteBin7LineIcon'
import EditBoxLineIcon from 'remixicon-react/EditBoxLineIcon'
import FileCopyLineIcon from 'remixicon-react/FileCopyLineIcon'
import LockFillIcon from 'remixicon-react/LockFillIcon'
import { AddAddressModal } from './AddAddressModal'
import {
  addressSafeguardNotice,
  addressToFormValues,
  formValuesToAddress,
  formatAddressContact,
  savedAddresses,
  type AddressFormValues,
  type AddressRecord,
} from '../data/addresses'

function AddressDefaultToggle({
  isDefault,
  onSelect,
}: {
  isDefault: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex min-w-0 cursor-pointer items-center gap-4"
      aria-pressed={isDefault}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 ${
          isDefault ? 'border-text-primary bg-text-primary' : 'border-border-secondary bg-bg-primary'
        }`}
        aria-hidden
      >
        {isDefault ? <span className="size-3 rounded-full bg-bg-primary" /> : null}
      </span>
      <span className="truncate text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
        {isDefault ? 'Default Address' : 'Set as default'}
      </span>
    </button>
  )
}

function AddressCard({
  address,
  onSetDefault,
  onDelete,
  onEdit,
  onDuplicate,
}: {
  address: AddressRecord
  onSetDefault: () => void
  onDelete: () => void
  onEdit: () => void
  onDuplicate: () => void
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border-primary bg-bg-secondary">
      <div className="flex flex-col gap-2 p-4 text-sm leading-4.5 tracking-[-0.28px] text-text-primary">
        <p className="font-medium">{formatAddressContact(address)}</p>
        <div className="flex flex-col gap-2 font-normal">
          <p>{address.addressLine}</p>
          <p>{address.cityLine}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 border-t border-border-secondary p-4">
        <div className="min-w-0 flex-1">
          <AddressDefaultToggle isDefault={address.isDefault} onSelect={onSetDefault} />
        </div>

        <div className="flex shrink-0 items-center gap-6 lg:gap-0 xl:gap-6">
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete address"
            className="cursor-pointer p-1"
          >
            <DeleteBin7LineIcon className="size-6 text-text-secondary" aria-hidden />
          </button>
          <span aria-hidden className="h-6 w-px bg-border-secondary" />
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit address"
            className="cursor-pointer p-1"
          >
            <EditBoxLineIcon className="size-6 text-text-secondary" aria-hidden />
          </button>
          <span aria-hidden className="h-6 w-px bg-border-secondary" />
          <button
            type="button"
            onClick={onDuplicate}
            aria-label="Duplicate address"
            className="cursor-pointer p-1"
          >
            <FileCopyLineIcon className="size-6 text-text-secondary" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  )
}

export function AddressesPanel() {
  const [addresses, setAddresses] = useState<AddressRecord[]>(() =>
    savedAddresses.map((address) => ({ ...address })),
  )
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)

  const editingAddress = addresses.find((address) => address.id === editingAddressId)

  const openAddModal = () => {
    setModalMode('add')
    setEditingAddressId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (addressId: string) => {
    setModalMode('edit')
    setEditingAddressId(addressId)
    setIsModalOpen(true)
  }

  const setDefaultAddress = (addressId: string) => {
    setAddresses((current) =>
      current.map((address) => ({
        ...address,
        isDefault: address.id === addressId,
      })),
    )
  }

  const deleteAddress = (addressId: string) => {
    setAddresses((current) => {
      const next = current.filter((address) => address.id !== addressId)
      if (next.length === 0) return next
      if (!next.some((address) => address.isDefault)) {
        next[0] = { ...next[0], isDefault: true }
      }
      return next
    })
  }

  const duplicateAddress = (addressId: string) => {
    setAddresses((current) => {
      const source = current.find((address) => address.id === addressId)
      if (!source) return current

      return [
        ...current,
        {
          ...source,
          id: `address-${Date.now()}`,
          isDefault: false,
        },
      ]
    })
  }

  const applyDefaultFlag = (items: AddressRecord[], preferredDefaultId?: string) => {
    if (items.length === 0) return items

    const hasPreferred =
      preferredDefaultId !== undefined && items.some((item) => item.id === preferredDefaultId)

    if (hasPreferred) {
      return items.map((item) => ({
        ...item,
        isDefault: item.id === preferredDefaultId,
      }))
    }

    if (items.some((item) => item.isDefault)) return items

    return items.map((item, index) => ({
      ...item,
      isDefault: index === 0,
    }))
  }

  const handleSubmit = (values: AddressFormValues) => {
    if (modalMode === 'edit' && editingAddressId) {
      setAddresses((current) => {
        const updated = current.map((address) =>
          address.id === editingAddressId
            ? formValuesToAddress(values, address.id, address.cityLine)
            : address,
        )
        return applyDefaultFlag(updated, values.isDefault ? editingAddressId : undefined)
      })
      return
    }

    const newAddress = formValuesToAddress(values, `address-${Date.now()}`)
    setAddresses((current) => applyDefaultFlag([...current, newAddress], newAddress.id))
  }

  return (
    <>
      <AddAddressModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialValues={editingAddress ? addressToFormValues(editingAddress) : undefined}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-1 lg:gap-1">
            <div className="flex items-center gap-2 lg:flex-col lg:items-start lg:gap-1">
              <h2 className="min-w-0 flex-1 text-base font-medium leading-5 tracking-[-0.32px] text-text-primary lg:text-2xl lg:leading-8 lg:tracking-[-0.48px]">
                Addresses
              </h2>
              <div className="flex min-w-0 flex-1 items-center gap-1 lg:flex-none">
                <LockFillIcon className="size-6 shrink-0 text-primary-green" aria-hidden />
                <p className="truncate text-sm leading-4.5 tracking-[-0.28px] text-primary-green">
                  {addressSafeguardNotice}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="btn-orange flex w-full shrink-0 cursor-pointer items-center justify-center rounded-full px-6 py-4 text-base font-medium leading-5 tracking-[-0.32px] text-text-inverse lg:w-auto"
          >
            Add new address
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onSetDefault={() => setDefaultAddress(address.id)}
              onDelete={() => deleteAddress(address.id)}
              onEdit={() => openEditModal(address.id)}
              onDuplicate={() => duplicateAddress(address.id)}
            />
          ))}
        </div>
      </div>
    </>
  )
}
