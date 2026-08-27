import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon'
import {
  getListingProducts,
  type CategoryListingSelection,
} from '../data/categoryListing'
import type { Product } from '../data/products'
import {
  ListingFiltersSidebar,
  MobileFiltersSheet,
  MobileListingHeader,
  useListingFilters,
} from './ProductListingFilters'
import { ProductCard } from './ProductCard'

type CategoryListingViewProps = {
  selection: CategoryListingSelection
  onGoHome: () => void
  onProductSelect: (product: Product) => void
}

function CategoryBreadcrumbs({
  categoryLabel,
  subcategoryLabel,
  onGoHome,
}: {
  categoryLabel: string
  subcategoryLabel: string
  onGoHome: () => void
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1 px-4 py-2 lg:px-16"
    >
      <button
        type="button"
        onClick={onGoHome}
        className="cursor-pointer py-2.5 text-sm font-medium leading-4 tracking-[-0.28px] text-text-tertiary transition-colors hover:text-text-primary"
      >
        Home
      </button>
      <ArrowRightSLineIcon className="size-6 shrink-0 text-text-tertiary" aria-hidden />
      <span className="py-2.5 text-sm font-medium leading-4 tracking-[-0.28px] text-text-tertiary">
        {categoryLabel}
      </span>
      <ArrowRightSLineIcon className="size-6 shrink-0 text-text-tertiary" aria-hidden />
      <span className="py-2.5 text-sm font-medium leading-4 tracking-[-0.28px] text-text-primary">
        {subcategoryLabel}
      </span>
    </nav>
  )
}

export function CategoryListingView({
  selection,
  onGoHome,
  onProductSelect,
}: CategoryListingViewProps) {
  const {
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
  } = useListingFilters(selection.subcategoryLabel)

  const listingProducts = getListingProducts(selection, activeCategory)

  return (
    <>
      <CategoryBreadcrumbs
        categoryLabel={selection.categoryLabel}
        subcategoryLabel={activeCategory}
        onGoHome={onGoHome}
      />

      <MobileListingHeader title={activeCategory} onOpenFilters={openMobileFilters} />

      <MobileFiltersSheet
        isOpen={isMobileFiltersOpen}
        draftCategory={draftCategory}
        categoryOptions={selection.subcategoryOptions}
        onDraftCategoryChange={setDraftCategory}
        openSections={openSections}
        onToggleSection={toggleSection}
        selectedRating={selectedRating}
        onRatingChange={setSelectedRating}
        onClose={closeMobileFilters}
        onSave={saveMobileFilters}
      />

      <section className="border-t border-border-primary px-4 pb-10 pt-4 lg:border-t-0 lg:px-16 lg:pt-4">
        <div className="flex gap-4">
          <ListingFiltersSidebar
            selectedCategory={activeCategory}
            categoryOptions={selection.subcategoryOptions}
            onCategoryChange={setActiveCategory}
            openSections={openSections}
            onToggleSection={toggleSection}
            selectedRating={selectedRating}
            onRatingChange={setSelectedRating}
          />

          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-2 items-stretch gap-2 sm:grid-cols-3 xl:grid-cols-4">
              {listingProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  enableAddButton
                  onClick={() => onProductSelect(product)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
