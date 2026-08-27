import { useState } from 'react'
import DeleteBin7LineIcon from 'remixicon-react/DeleteBin7LineIcon'
import EditBoxLineIcon from 'remixicon-react/EditBoxLineIcon'
import LockFillIcon from 'remixicon-react/LockFillIcon'
import { images } from '../assets/images'
import { AddPaymentMethodModal } from './AddPaymentMethodModal'
import {
  formValuesToPayment,
  paymentSafeguardNotice,
  paymentToFormValues,
  paymentTypeLabel,
  savedPaymentMethods,
  type PaymentMethodFormValues,
  type PaymentMethodRecord,
  type PaymentMethodType,
} from '../data/paymentMethods'

function PaymentMethodIcon({ type }: { type: PaymentMethodType }) {
  if (type === 'paypal') {
    return (
      <img
        alt=""
        aria-hidden
        className="h-6 w-8 shrink-0 object-contain"
        src={images.footer.paypal}
      />
    )
  }

  if (type === 'visa') {
    return (
      <img
        alt=""
        aria-hidden
        className="h-6 w-8 shrink-0 object-contain"
        src={images.footer.visa}
      />
    )
  }

  return (
    <span
      aria-hidden
      className="flex h-6 w-8 shrink-0 items-center justify-center rounded bg-bg-primary text-[10px] font-semibold leading-none tracking-[-0.2px] text-primary-green"
    >
      MM
    </span>
  )
}

function PaymentDefaultToggle({
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
        {isDefault ? 'Default payment method' : 'Set as default'}
      </span>
    </button>
  )
}

function PaymentMethodCard({
  payment,
  onSetDefault,
  onDelete,
  onEdit,
}: {
  payment: PaymentMethodRecord
  onSetDefault: () => void
  onDelete: () => void
  onEdit: () => void
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border-primary bg-bg-secondary">
      <div className="flex flex-col gap-4 p-4">
        <p className="text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-primary">
          {payment.cardholderName}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <PaymentMethodIcon type={payment.type} />
          <span className="text-sm leading-4.5 tracking-[-0.28px] text-text-primary">
            {paymentTypeLabel(payment.type)}
          </span>
          {payment.type === 'mobile_money' && payment.network ? (
            <span className="text-sm leading-4.5 tracking-[-0.28px] text-text-primary">
              {payment.network}
            </span>
          ) : null}
          <span className="text-sm leading-4.5 tracking-[-0.28px] text-text-primary">
            {payment.maskedDetail}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 border-t border-border-secondary p-4">
        <div className="min-w-0 flex-1">
          <PaymentDefaultToggle isDefault={payment.isDefault} onSelect={onSetDefault} />
        </div>

        <div className="flex shrink-0 items-center gap-6 lg:gap-0 xl:gap-6">
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete payment method"
            className="cursor-pointer p-1"
          >
            <DeleteBin7LineIcon className="size-6 text-text-secondary" aria-hidden />
          </button>
          <span aria-hidden className="h-6 w-px bg-border-secondary" />
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit payment method"
            className="cursor-pointer p-1"
          >
            <EditBoxLineIcon className="size-6 text-text-secondary" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  )
}

export function PaymentMethodsPanel() {
  const [payments, setPayments] = useState<PaymentMethodRecord[]>(() =>
    savedPaymentMethods.map((payment) => ({ ...payment })),
  )
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null)

  const editingPayment = payments.find((payment) => payment.id === editingPaymentId)

  const openAddModal = () => {
    setModalMode('add')
    setEditingPaymentId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (paymentId: string) => {
    setModalMode('edit')
    setEditingPaymentId(paymentId)
    setIsModalOpen(true)
  }

  const setDefaultPayment = (paymentId: string) => {
    setPayments((current) =>
      current.map((payment) => ({
        ...payment,
        isDefault: payment.id === paymentId,
      })),
    )
  }

  const deletePayment = (paymentId: string) => {
    setPayments((current) => {
      const next = current.filter((payment) => payment.id !== paymentId)
      if (next.length === 0) return next
      if (!next.some((payment) => payment.isDefault)) {
        next[0] = { ...next[0], isDefault: true }
      }
      return next
    })
  }

  const handleSubmit = (values: PaymentMethodFormValues) => {
    if (modalMode === 'edit' && editingPaymentId) {
      setPayments((current) =>
        current.map((payment) =>
          payment.id === editingPaymentId
            ? {
                ...formValuesToPayment(values, payment.id, payment.cardholderName),
                isDefault: payment.isDefault,
              }
            : payment,
        ),
      )
      return
    }

    const newPayment = formValuesToPayment(
      values,
      `payment-${Date.now()}`,
      'Clement Nii Odai Afotey',
    )
    setPayments((current) => [...current, newPayment])
  }

  return (
    <>
      <AddPaymentMethodModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialValues={editingPayment ? paymentToFormValues(editingPayment) : undefined}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-1 lg:gap-1">
            <div className="flex items-center gap-2 lg:flex-col lg:items-start lg:gap-1">
              <h2 className="min-w-0 flex-1 text-base font-medium leading-5 tracking-[-0.32px] text-text-primary lg:text-2xl lg:leading-8 lg:tracking-[-0.48px]">
                Payment methods
              </h2>
              <div className="flex min-w-0 flex-1 items-center gap-1 lg:flex-none">
                <LockFillIcon className="size-6 shrink-0 text-primary-green" aria-hidden />
                <p className="truncate text-sm leading-4.5 tracking-[-0.28px] text-primary-green">
                  {paymentSafeguardNotice}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="btn-orange flex w-full shrink-0 cursor-pointer items-center justify-center rounded-full px-6 py-4 text-base font-medium leading-5 tracking-[-0.32px] text-text-inverse lg:w-auto"
          >
            Add new payment method
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {payments.map((payment) => (
            <PaymentMethodCard
              key={payment.id}
              payment={payment}
              onSetDefault={() => setDefaultPayment(payment.id)}
              onDelete={() => deletePayment(payment.id)}
              onEdit={() => openEditModal(payment.id)}
            />
          ))}
        </div>
      </div>
    </>
  )
}
