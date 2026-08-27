import { useMemo, useState } from 'react'
import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon'
import {
  browsingHistorySections as initialSections,
  getAllHistoryItemIds,
  type BrowsingHistorySection,
} from '../data/browsingHistory'
import { ProductCard } from './ProductCard'

function HistorySelectToggle({
  selected,
  onToggle,
  label,
  className = 'size-8',
}: {
  selected: boolean
  onToggle: () => void
  label: string
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex shrink-0 cursor-pointer items-center justify-center rounded-full border-2 ${className} ${
        selected ? 'border-primary-orange bg-primary-orange' : 'border-border-secondary bg-bg-primary'
      }`}
      aria-label={label}
      aria-pressed={selected}
    >
      {selected ? <span className="size-3 rounded-full bg-bg-primary" aria-hidden /> : null}
    </button>
  )
}

function BrowsingHistoryManageBar({
  selectedCount,
  allSelected,
  onToggleSelectAll,
  onDelete,
  onDone,
}: {
  selectedCount: number
  allSelected: boolean
  onToggleSelectAll: () => void
  onDelete: () => void
  onDone: () => void
}) {
  return (
    <>
      {/* <div className="hidden items-center justify-between gap-4 border-b border-border-primary px-4 py-4 lg:flex lg:px-0">
        <div className="flex items-center gap-2">
          <HistorySelectToggle
            selected={allSelected}
            onToggle={onToggleSelectAll}
            label={allSelected ? 'Deselect all items' : 'Select all items'}
          />
          <span className="text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
            Select all
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDelete}
            disabled={selectedCount === 0}
            className="btn-orange flex cursor-pointer items-center justify-center rounded-full px-4 py-2 text-base font-medium leading-5 tracking-[-0.32px] text-text-inverse disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete({selectedCount})
          </button>
          <button
            type="button"
            onClick={onDone}
            className="cursor-pointer rounded-full px-4 py-2 text-base font-medium leading-5 tracking-[-0.32px] text-text-primary"
          >
            Done
          </button>
        </div>
      </div> */}

      <div className="fixed max-w-340 mx-auto inset-x-0 bottom-0 z-40 flex items-center justify-between gap-2 border-t border-border-primary bg-bg-primary p-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 lg:pl-[17em] ">
          <HistorySelectToggle
            selected={allSelected}
            onToggle={onToggleSelectAll}
            label={allSelected ? 'Deselect all items' : 'Select all items'}
            className="size-8"
          />
          <span className="text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
            Select all
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onDelete}
            disabled={selectedCount === 0}
            className="btn-orange flex cursor-pointer items-center justify-center rounded-full px-4 py-2 text-base font-medium leading-5 tracking-[-0.32px] text-text-inverse disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete({selectedCount})
          </button>
          <button
            type="button"
            onClick={onDone}
            className="cursor-pointer rounded-full px-4 py-2 text-base font-medium leading-5 tracking-[-0.32px] text-text-primary"
          >
            Done
          </button>
        </div>
      </div>
    </>
  )
}

function BrowsingHistorySectionBlock({
  section,
  isManageMode,
  selectedIds,
  onEnterManageMode,
  onToggleSection,
  onToggleItem,
}: {
  section: BrowsingHistorySection
  isManageMode: boolean
  selectedIds: Set<string>
  onEnterManageMode: () => void
  onToggleSection: () => void
  onToggleItem: (itemId: string) => void
}) {
  const sectionItemIds = section.items.map((item) => item.id)
  const sectionAllSelected =
    sectionItemIds.length > 0 && sectionItemIds.every((id) => selectedIds.has(id))

  return (
    <section className="flex flex-col gap-4 lg:gap-6">
      <div className="flex items-center gap-2">
        {isManageMode ? (
          <HistorySelectToggle
            selected={sectionAllSelected}
            onToggle={onToggleSection}
            label={
              sectionAllSelected
                ? `Deselect all items from ${section.label}`
                : `Select all items from ${section.label}`
            }
            className="size-8 lg:size-8"
          />
        ) : null}
        <h2
          className={`min-w-0 flex-1 font-medium text-text-primary ${
            isManageMode
              ? 'text-base leading-5 tracking-[-0.32px]'
              : 'text-2xl leading-8 tracking-[-0.48px] lg:text-2xl'
          }`}
        >
          {section.label}
        </h2>
        {!isManageMode && section.id === 'today' ? (
          <button
            type="button"
            onClick={onEnterManageMode}
            className="group flex shrink-0 cursor-pointer items-center text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-primary"
          >
            Manage
            <ArrowRightSLineIcon
              className="size-6 text-text-secondary transition-colors group-hover:text-primary-orange"
              aria-hidden
            />
          </button>
        ) : null}
        {!isManageMode && section.id !== 'today' ? (
          <button
            type="button"
            onClick={onEnterManageMode}
            className="group flex shrink-0 cursor-pointer items-center text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-primary lg:hidden"
          >
            Manage
            <ArrowRightSLineIcon
              className="size-6 text-text-secondary transition-colors group-hover:text-primary-orange"
              aria-hidden
            />
          </button>
        ) : null}
      </div>

      {section.items.length > 0 ? (
        <div className="grid grid-cols-2 items-stretch gap-2 lg:grid-cols-3 xl:grid-cols-5 lg:gap-2">
          {section.items.map((item) => (
            <ProductCard
              key={item.id}
              product={item.product}
              enableAddButton={!isManageMode}
              selectionMode={
                isManageMode
                  ? {
                      selected: selectedIds.has(item.id),
                      onSelectedChange: () => onToggleItem(item.id),
                    }
                  : undefined
              }
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

export function BrowsingHistoryPanel() {
  const [sections, setSections] = useState<BrowsingHistorySection[]>(() =>
    initialSections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({ ...item, product: { ...item.product } })),
    })),
  )
  const [isManageMode, setIsManageMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())

  const allItemIds = useMemo(() => getAllHistoryItemIds(sections), [sections])
  const selectedCount = selectedIds.size
  const allSelected = allItemIds.length > 0 && allItemIds.every((id) => selectedIds.has(id))

  const exitManageMode = () => {
    setIsManageMode(false)
    setSelectedIds(new Set())
  }

  const toggleItem = (itemId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  const toggleSection = (section: BrowsingHistorySection) => {
    const sectionItemIds = section.items.map((item) => item.id)
    const sectionAllSelected =
      sectionItemIds.length > 0 && sectionItemIds.every((id) => selectedIds.has(id))

    setSelectedIds((current) => {
      const next = new Set(current)
      if (sectionAllSelected) {
        sectionItemIds.forEach((id) => next.delete(id))
      } else {
        sectionItemIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(allItemIds))
  }

  const handleDelete = () => {
    if (selectedCount === 0) return

    setSections((current) =>
      current
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => !selectedIds.has(item.id)),
        }))
        .filter((section) => section.items.length > 0),
    )
    setSelectedIds(new Set())
  }

  return (
    <div className={isManageMode ? 'pb-24 lg:pb-0' : undefined}>
      {isManageMode ? (
        <BrowsingHistoryManageBar
          selectedCount={selectedCount}
          allSelected={allSelected}
          onToggleSelectAll={toggleSelectAll}
          onDelete={handleDelete}
          onDone={exitManageMode}
        />
      ) : null}

      <div className="flex flex-col gap-8 lg:gap-10">
        {sections.map((section) => (
          <BrowsingHistorySectionBlock
            key={section.id}
            section={section}
            isManageMode={isManageMode}
            selectedIds={selectedIds}
            onEnterManageMode={() => setIsManageMode(true)}
            onToggleSection={() => toggleSection(section)}
            onToggleItem={toggleItem}
          />
        ))}
      </div>
    </div>
  )
}
