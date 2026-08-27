import { useEffect, useState, type ReactNode } from 'react'
import AddLineIcon from 'remixicon-react/AddLineIcon'
import ArrowUpSLineIcon from 'remixicon-react/ArrowUpSLineIcon'
import FilterLineIcon from 'remixicon-react/FilterLineIcon'
import StarFillIcon from 'remixicon-react/StarFillIcon'
import SubtractLineIcon from 'remixicon-react/SubtractLineIcon'
import { collapsedFilterSections, deliveryFilterOptions } from '../data/categoryListing'

export type OpenSections = {
  price: boolean
  category: boolean
  rating: boolean
  delivery: boolean
  brand: boolean
  color: boolean
  seller: boolean
}

export const defaultOpenSections: OpenSections = {
  price: true,
  category: true,
  rating: true,
  delivery: true,
  brand: false,
  color: false,
  seller: false,
}

type FilterSectionProps = {
  title: string
  isOpen: boolean
  onToggle: () => void
  children?: ReactNode
  className?: string
}

function FilterSection({ title, isOpen, onToggle, children, className = 'p-4' }: FilterSectionProps) {
  return (
    <div className={`border-b border-border-primary ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-2 text-left"
      >
        <span className="flex-1 text-sm font-medium leading-4 tracking-[-0.28px] text-text-secondary">
          {title}
        </span>
        <ArrowUpSLineIcon
          className={`size-6 shrink-0 text-text-secondary transition-transform ${
            isOpen ? '' : 'rotate-180'
          }`}
          aria-hidden
        />
      </button>
      {isOpen && children ? <div className="mt-2 flex flex-col gap-2">{children}</div> : null}
    </div>
  )
}

function FilterRadioOption({
  label,
  isSelected,
  onSelect,
  trailing,
}: {
  label: string
  isSelected: boolean
  onSelect: () => void
  trailing?: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full cursor-pointer items-center gap-2 py-1 text-left"
    >
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
          isSelected ? 'border-primary-orange' : 'border-border-secondary'
        }`}
      >
        {isSelected ? <span className="size-2.5 rounded-full bg-primary-orange" /> : null}
      </span>
      {trailing ?? (
        <span className="text-sm font-medium leading-4 tracking-[-0.28px] text-text-secondary">
          {label}
        </span>
      )}
    </button>
  )
}

function RatingStars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <StarFillIcon
          key={index}
          className={`size-5 ${index < count ? 'text-primary-gold' : 'text-bg-tertiary'}`}
          aria-hidden
        />
      ))}
    </div>
  )
}

function ListingFiltersContent({
  headerTitle,
  selectedCategory,
  categoryOptions,
  onCategoryChange,
  openSections,
  onToggleSection,
  selectedRating,
  onRatingChange,
  showAllCategoryOption = false,
  headerClassName = 'border-b border-border-primary px-4 py-2',
  sectionClassName = 'p-4',
}: {
  headerTitle: string
  selectedCategory: string
  categoryOptions: string[]
  onCategoryChange: (label: string) => void
  openSections: OpenSections
  onToggleSection: (key: keyof OpenSections) => void
  selectedRating: string
  onRatingChange: (rating: string) => void
  showAllCategoryOption?: boolean
  headerClassName?: string
  sectionClassName?: string
}) {
  return (
    <>
      <div className={headerClassName}>
        <p className="text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
          {headerTitle}
        </p>
      </div>

      <FilterSection
        title="Price"
        isOpen={openSections.price}
        onToggle={() => onToggleSection('price')}
        className={sectionClassName}
      >
        <div className="relative h-6 w-full">
          <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-bg-tertiary" />
          <div className="absolute top-1/2 left-[8%] h-1 w-[75%] -translate-y-1/2 rounded-full bg-primary-orange" />
          <span className="absolute top-1/2 left-[8%] size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-primary-orange shadow-[0px_1px_4px_0px_rgba(0,0,0,0.04),0px_4px_12px_0px_rgba(0,0,0,0.06)]" />
          <span className="absolute top-1/2 left-[83%] size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-primary-orange shadow-[0px_1px_4px_0px_rgba(0,0,0,0.04),0px_4px_12px_0px_rgba(0,0,0,0.06)]" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-1 rounded-lg border border-border-secondary p-2 text-sm font-medium tracking-[-0.28px]">
            <span className="text-text-tertiary">AED</span>
            <span className="text-text-secondary">200</span>
          </div>
          <SubtractLineIcon className="size-6 shrink-0 text-text-secondary" aria-hidden />
          <div className="flex flex-1 items-center gap-1 rounded-lg border border-border-secondary p-2 text-sm font-medium tracking-[-0.28px]">
            <span className="text-text-tertiary">AED</span>
            <span className="text-text-secondary">2000</span>
          </div>
        </div>
      </FilterSection>

      {categoryOptions.length > 0 ? (
        <FilterSection
          title="Category"
          isOpen={openSections.category}
          onToggle={() => onToggleSection('category')}
          className={sectionClassName}
        >
          {showAllCategoryOption ? (
            <FilterRadioOption
              label="All categories"
              isSelected={selectedCategory === 'all'}
              onSelect={() => onCategoryChange('all')}
            />
          ) : null}
          {categoryOptions.slice(0, showAllCategoryOption ? 3 : 4).map((label) => (
            <FilterRadioOption
              key={label}
              label={label}
              isSelected={selectedCategory === label}
              onSelect={() => onCategoryChange(label)}
            />
          ))}
          {categoryOptions.length > (showAllCategoryOption ? 3 : 4) ? (
            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 py-1 text-sm font-medium leading-4 tracking-[-0.28px] text-text-secondary"
            >
              <AddLineIcon className="size-5 shrink-0" aria-hidden />
              View More
            </button>
          ) : null}
        </FilterSection>
      ) : null}

      <FilterSection
        title="Rating"
        isOpen={openSections.rating}
        onToggle={() => onToggleSection('rating')}
        className={sectionClassName}
      >
        {[4, 3, 2, 1].map((count) => (
          <FilterRadioOption
            key={count}
            label={`${count} & above`}
            isSelected={selectedRating === String(count)}
            onSelect={() => onRatingChange(String(count))}
            trailing={
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <RatingStars count={count} />
                <span className="text-sm font-medium leading-4 tracking-[-0.28px] text-text-secondary">
                  & above
                </span>
              </div>
            }
          />
        ))}
        <FilterRadioOption
          label="All Ratings"
          isSelected={selectedRating === 'all'}
          onSelect={() => onRatingChange('all')}
        />
      </FilterSection>

      <FilterSection
        title="Delivery"
        isOpen={openSections.delivery}
        onToggle={() => onToggleSection('delivery')}
        className={sectionClassName}
      >
        {deliveryFilterOptions.map((label) => (
          <FilterRadioOption
            key={label}
            label={label}
            isSelected={false}
            onSelect={() => undefined}
          />
        ))}
      </FilterSection>

      {collapsedFilterSections.map((title) => {
        const key = title.toLowerCase() as 'brand' | 'color' | 'seller'

        return (
          <FilterSection
            key={title}
            title={title}
            isOpen={openSections[key]}
            onToggle={() => onToggleSection(key)}
            className={sectionClassName}
          />
        )
      })}
    </>
  )
}

export function ListingFiltersSidebar({
  selectedCategory,
  categoryOptions,
  onCategoryChange,
  openSections,
  onToggleSection,
  selectedRating,
  onRatingChange,
  showAllCategoryOption = false,
}: {
  selectedCategory: string
  categoryOptions: string[]
  onCategoryChange: (label: string) => void
  openSections: OpenSections
  onToggleSection: (key: keyof OpenSections) => void
  selectedRating: string
  onRatingChange: (rating: string) => void
  showAllCategoryOption?: boolean
}) {
  return (
    <aside className="hidden w-66 shrink-0 flex-col overflow-hidden rounded-[12px] border border-border-primary lg:flex">
      <ListingFiltersContent
        headerTitle="Filter"
        selectedCategory={selectedCategory}
        categoryOptions={categoryOptions}
        onCategoryChange={onCategoryChange}
        openSections={openSections}
        onToggleSection={onToggleSection}
        selectedRating={selectedRating}
        onRatingChange={onRatingChange}
        showAllCategoryOption={showAllCategoryOption}
      />
    </aside>
  )
}

export function MobileFiltersSheet({
  isOpen,
  draftCategory,
  categoryOptions,
  onDraftCategoryChange,
  openSections,
  onToggleSection,
  selectedRating,
  onRatingChange,
  onClose,
  onSave,
  showAllCategoryOption = false,
}: {
  isOpen: boolean
  draftCategory: string
  categoryOptions: string[]
  onDraftCategoryChange: (label: string) => void
  openSections: OpenSections
  onToggleSection: (key: keyof OpenSections) => void
  selectedRating: string
  onRatingChange: (rating: string) => void
  onClose: () => void
  onSave: () => void
  showAllCategoryOption?: boolean
}) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <button
        type="button"
        aria-label="Close filters"
        className="fixed inset-0 z-40 bg-[rgba(0,6,7,0.7)] lg:hidden"
        onClick={onClose}
      />

      <div className="fixed inset-x-0 top-(--nav-height,8rem) bottom-0 z-50 flex flex-col bg-bg-primary lg:hidden">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ListingFiltersContent
            headerTitle="Filters"
            selectedCategory={draftCategory}
            categoryOptions={categoryOptions}
            onCategoryChange={onDraftCategoryChange}
            openSections={openSections}
            onToggleSection={onToggleSection}
            selectedRating={selectedRating}
            onRatingChange={onRatingChange}
            showAllCategoryOption={showAllCategoryOption}
            headerClassName="px-4 py-2"
            sectionClassName="px-4 py-4"
          />
        </div>

        <div className="border-t border-border-primary px-4 py-4">
          <button
            type="button"
            onClick={onSave}
            className="btn-orange flex h-13 w-full cursor-pointer items-center justify-center rounded-full px-6 py-4"
          >
            <span className="text-base font-medium leading-5 tracking-[-0.32px] text-text-inverse">
              Save
            </span>
          </button>
        </div>
      </div>
    </>
  )
}

export function MobileListingHeader({
  title,
  onOpenFilters,
}: {
  title: string
  onOpenFilters: () => void
}) {
  return (
    <div className="flex items-center justify-between border-b border-border-primary px-4 py-3 lg:hidden">
      <h1 className="min-w-0 flex-1 truncate pr-4 text-xl font-medium leading-6 tracking-[-0.4px] text-text-primary">
        {title}
      </h1>
      <button
        type="button"
        onClick={onOpenFilters}
        className="group flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-bg-secondary px-4 transition-colors hover:bg-orange-light active:bg-orange-light"
        aria-label="Open filters"
      >
        <FilterLineIcon
          className="size-5 text-text-secondary transition-colors group-hover:text-primary-orange"
          aria-hidden
        />
        <span className="text-sm font-medium leading-4 tracking-[-0.28px] text-text-secondary transition-colors group-hover:text-primary-orange">
          Filter
        </span>
      </button>
    </div>
  )
}

export function useListingFilters(defaultCategory: string) {
  const [activeCategory, setActiveCategory] = useState(defaultCategory)
  const [draftCategory, setDraftCategory] = useState(defaultCategory)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [openSections, setOpenSections] = useState(defaultOpenSections)
  const [selectedRating, setSelectedRating] = useState('4')

  const toggleSection = (key: keyof OpenSections) => {
    setOpenSections((sections) => ({ ...sections, [key]: !sections[key] }))
  }

  const openMobileFilters = () => {
    setDraftCategory(activeCategory)
    setIsMobileFiltersOpen(true)
  }

  const closeMobileFilters = () => {
    setIsMobileFiltersOpen(false)
  }

  const saveMobileFilters = () => {
    setActiveCategory(draftCategory)
    setIsMobileFiltersOpen(false)
  }

  return {
    activeCategory,
    setActiveCategory,
    draftCategory,
    setDraftCategory,
    isMobileFiltersOpen,
    openSections,
    selectedRating,
    setSelectedRating,
    toggleSection,
    openMobileFilters,
    closeMobileFilters,
    saveMobileFilters,
  }
}
