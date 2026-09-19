import { useEffect, useRef, useState, type ReactNode } from 'react'
import AddLineIcon from 'remixicon-react/AddLineIcon'
import ArrowUpSLineIcon from 'remixicon-react/ArrowUpSLineIcon'
import FilterLineIcon from 'remixicon-react/FilterLineIcon'
import StarFillIcon from 'remixicon-react/StarFillIcon'
import SubtractLineIcon from 'remixicon-react/SubtractLineIcon'
import {
  collapsedFilterSections,
  deliveryFilterOptions,
  mobileCollapsedFilterSections,
  screenSizeFilterOptions,
} from '../data/categoryListing'

export type OpenSections = {
  price: boolean
  category: boolean
  rating: boolean
  delivery: boolean
  screenSize: boolean
  brand: boolean
  color: boolean
  seller: boolean
  connectivity: boolean
  storage: boolean
}

export const defaultOpenSections: OpenSections = {
  price: true,
  category: true,
  rating: true,
  delivery: true,
  screenSize: true,
  brand: false,
  color: false,
  seller: false,
  connectivity: false,
  storage: false,
}

type FilterVariant = 'sidebar' | 'mobile'

type FilterSectionProps = {
  title: string
  isOpen: boolean
  onToggle: () => void
  children?: ReactNode
  variant: FilterVariant
}

function FilterSection({ title, isOpen, onToggle, children, variant }: FilterSectionProps) {
  const isMobile = variant === 'mobile'

  return (
    <div
      className={`border-b border-border-primary ${isMobile ? 'py-4' : 'p-4'}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-2 text-left"
      >
        <span
          className={`flex-1 font-medium text-text-secondary ${
            isMobile
              ? 'text-sm leading-4.5 tracking-[-0.28px]'
              : 'text-sm leading-4 tracking-[-0.28px]'
          }`}
        >
          {title}
        </span>
        <ArrowUpSLineIcon
          className={`size-6 shrink-0 text-text-secondary transition-transform ${
            isOpen ? '' : 'rotate-180'
          }`}
          aria-hidden
        />
      </button>
      {isOpen && children ? (
        <div className={`flex flex-col gap-2 ${isMobile ? 'mt-2' : 'mt-2'}`}>{children}</div>
      ) : null}
    </div>
  )
}

function FilterRadioOption({
  label,
  isSelected,
  onSelect,
  trailing,
  variant,
}: {
  label: string
  isSelected: boolean
  onSelect: () => void
  trailing?: ReactNode
  variant: FilterVariant
}) {
  const isMobile = variant === 'mobile'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full cursor-pointer items-center gap-2 text-left ${
        isMobile ? 'py-1' : 'py-1'
      }`}
    >
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
          isSelected ? 'border-primary-orange' : 'border-border-secondary'
        }`}
      >
        {isSelected ? <span className="size-2.5 rounded-full bg-primary-orange" /> : null}
      </span>
      {trailing ?? (
        <span
          className={`font-medium text-text-secondary ${
            isMobile
              ? 'text-sm leading-4.5 tracking-[-0.28px]'
              : 'text-sm leading-4 tracking-[-0.28px]'
          }`}
        >
          {label}
        </span>
      )}
    </button>
  )
}

function RatingStars({ count, className = '' }: { count: number; className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
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

function PriceRangeSlider({ variant }: { variant: FilterVariant }) {
  const isMobile = variant === 'mobile'

  return (
    <>
      <div
        className={`relative w-full ${isMobile ? 'flex h-6 items-center justify-center' : 'h-6'}`}
      >
        <div className={`relative h-6 ${isMobile ? 'w-58 max-w-full' : 'w-full'}`}>
          <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-bg-tertiary" />
          <div
            className={`absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary-orange ${
              isMobile ? 'left-[8.62%] w-[75%]' : 'left-[8%] w-[75%]'
            }`}
          />
          <span className="absolute top-1/2 left-[8.62%] size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-primary-orange shadow-[0px_1px_4px_0px_rgba(0,0,0,0.04),0px_4px_12px_0px_rgba(0,0,0,0.06)]" />
          <span className="absolute top-1/2 left-[91.38%] size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-primary-orange shadow-[0px_1px_4px_0px_rgba(0,0,0,0.04),0px_4px_12px_0px_rgba(0,0,0,0.06)]" />
        </div>
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
    </>
  )
}

function ListingFiltersContent({
  variant,
  headerTitle,
  selectedCategory,
  categoryOptions,
  onCategoryChange,
  openSections,
  onToggleSection,
  selectedRating,
  onRatingChange,
  showAllCategoryOption = false,
}: {
  variant: FilterVariant
  headerTitle: string
  selectedCategory: string
  categoryOptions: string[]
  onCategoryChange: (label: string) => void
  openSections: OpenSections
  onToggleSection: (key: keyof OpenSections) => void
  selectedRating: string
  onRatingChange: (rating: string) => void
  showAllCategoryOption?: boolean
}) {
  const isMobile = variant === 'mobile'
  const resolvedHeaderClassName = isMobile
    ? 'py-2'
    : 'border-b border-border-primary px-4 py-2'

  const categoryPreviewCount = showAllCategoryOption && !isMobile ? 3 : 4
  const categoryOverflowThreshold = showAllCategoryOption && !isMobile ? 3 : 4

  return (
    <>
      <div className={resolvedHeaderClassName}>
        <p className="text-base font-medium leading-5 tracking-[-0.32px] text-text-primary">
          {headerTitle}
        </p>
      </div>

      <FilterSection
        title="Price"
        isOpen={openSections.price}
        onToggle={() => onToggleSection('price')}
        variant={variant}
      >
        <PriceRangeSlider variant={variant} />
      </FilterSection>

      {categoryOptions.length > 0 ? (
        <FilterSection
          title="Category"
          isOpen={openSections.category}
          onToggle={() => onToggleSection('category')}
          variant={variant}
        >
          {showAllCategoryOption && !isMobile ? (
            <FilterRadioOption
              label="All categories"
              isSelected={selectedCategory === 'all'}
              onSelect={() => onCategoryChange('all')}
              variant={variant}
            />
          ) : null}
          {categoryOptions.slice(0, categoryPreviewCount).map((label) => (
            <FilterRadioOption
              key={label}
              label={label}
              isSelected={selectedCategory === label}
              onSelect={() => onCategoryChange(label)}
              variant={variant}
            />
          ))}
          {categoryOptions.length > categoryOverflowThreshold ? (
            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-secondary"
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
        variant={variant}
      >
        {[4, 3, 2, 1].map((count) => (
          <FilterRadioOption
            key={count}
            label={`${count} & above`}
            isSelected={selectedRating === String(count)}
            onSelect={() => onRatingChange(String(count))}
            variant={variant}
            trailing={
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <RatingStars count={count} className={isMobile ? 'w-30 shrink-0' : ''} />
                <span className="text-sm font-medium leading-4.5 tracking-[-0.28px] text-text-secondary">
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
          variant={variant}
        />
      </FilterSection>

      {isMobile ? (
        <FilterSection
          title="Screen Size"
          isOpen={openSections.screenSize}
          onToggle={() => onToggleSection('screenSize')}
          variant={variant}
        >
          {screenSizeFilterOptions.map((label) => (
            <FilterRadioOption
              key={label}
              label={label}
              isSelected={false}
              onSelect={() => undefined}
              variant={variant}
            />
          ))}
        </FilterSection>
      ) : (
        <FilterSection
          title="Delivery"
          isOpen={openSections.delivery}
          onToggle={() => onToggleSection('delivery')}
          variant={variant}
        >
          {deliveryFilterOptions.map((label) => (
            <FilterRadioOption
              key={label}
              label={label}
              isSelected={false}
              onSelect={() => undefined}
              variant={variant}
            />
          ))}
        </FilterSection>
      )}

      {(isMobile ? mobileCollapsedFilterSections : collapsedFilterSections).map((title) => {
        const key = title.toLowerCase() as keyof OpenSections

        return (
          <FilterSection
            key={title}
            title={title}
            isOpen={openSections[key]}
            onToggle={() => onToggleSection(key)}
            variant={variant}
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
        variant="sidebar"
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

const mobileFiltersOverlayClass = 'top-[var(--nav-height,8rem)]'
const mobileFiltersPanelClass = 'top-[var(--listing-header-height,3.75rem)]'

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
    <div
      className={`fixed inset-x-0 bottom-0 ${mobileFiltersOverlayClass} z-50 bg-[rgba(0,6,7,0.7)]/5 lg:hidden`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col bg-bg-primary ${mobileFiltersPanelClass}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          <ListingFiltersContent
            variant="mobile"
            headerTitle="Filters"
            selectedCategory={draftCategory}
            categoryOptions={categoryOptions}
            onCategoryChange={onDraftCategoryChange}
            openSections={openSections}
            onToggleSection={onToggleSection}
            selectedRating={selectedRating}
            onRatingChange={onRatingChange}
            showAllCategoryOption={showAllCategoryOption}
          />
        </div>

        <div className="shrink-0 border-t border-border-primary px-4 py-4">
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
    </div>
  )
}

export function MobileListingHeader({
  title,
  onOpenFilters,
}: {
  title: string
  onOpenFilters: () => void
}) {
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const updateHeight = () => {
      document.documentElement.style.setProperty(
        '--listing-header-height',
        `${header.offsetHeight}px`,
      )
    }

    updateHeight()

    const observer = new ResizeObserver(updateHeight)
    observer.observe(header)

    return () => observer.disconnect()
  }, [title])

  return (
    <div
      ref={headerRef}
      className="flex items-center justify-between border-b border-border-primary px-4 py-3 lg:hidden"
    >
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
