import { useMemo } from 'react'
import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon'
import {
  applyListingFilters,
  defaultListingFilters,
  getListingProducts,
  hasActiveFilters,
  type CategoryListingSelection,
} from '../data/categoryListing'
import { useProductListing } from '../hooks/useCatalogProducts'
import { useProductDestination } from '../hooks/useProductDestination'
import {
  isNewReleasesSubcategory,
  useNewReleasesSubcategoryProducts,
} from '../hooks/useNewReleasesSubcategory'
import type { Product } from '../data/products'
import { getProductPath } from '../data/shopRoutes'
import { ALL_PRODUCTS_LABEL } from '../data/catalogCategories'
import { deliveryOptionToParams } from '../data/deliveryFilter'
import { useCatalog } from '../context/CatalogContext'
import {
  ListingFiltersSidebar,
  MobileFiltersSheet,
  MobileListingHeader,
  useListingFilters,
} from './ProductListingFilters'
import { ProductCard } from './ProductCard'
import { ListingLoader } from './ListingLoader'

type CategoryListingViewProps = {
  selection: CategoryListingSelection
  onGoHome: () => void
  onProductSelect: (product: Product) => void
  /** Navigates to the "all products" listing regardless of the current category. */
  onSeeAllProducts: () => void
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

function ListingEmptyState({
  categoryLabel,
  subcategoryLabel,
  onSeeAllProducts,
  hasActiveFacetFilters,
  onClearFilters,
}: {
  categoryLabel: string
  subcategoryLabel: string
  onSeeAllProducts: () => void
  hasActiveFacetFilters: boolean
  onClearFilters: () => void
}) {
  const isAggregate = subcategoryLabel === ALL_PRODUCTS_LABEL

  return (
    <div
      role="status"
      className="flex min-h-48 flex-col items-center justify-center gap-2 px-6 py-10 text-center"
    >
      <p className="text-xl font-medium leading-6 tracking-[-0.4px] text-text-primary">
        No products found
      </p>
      {hasActiveFacetFilters ? (
        <>
          <p className="text-sm font-medium leading-4 tracking-[-0.28px] text-text-secondary">
            No products match the selected filters.{' '}
            <button
              type="button"
              onClick={onClearFilters}
              className="cursor-pointer font-medium text-text-primary underline underline-offset-2 hover:text-primary-orange"
            >
              Clear filters
            </button>
          </p>
        </>
      ) : (
        <p className="text-sm font-medium leading-4 tracking-[-0.28px] text-text-secondary">
          {isAggregate
            ? `There are no products in ${categoryLabel} yet.`
            : `${subcategoryLabel} has no products in ${categoryLabel} right now. Try another category.`}{' '}
          <button
            type="button"
            onClick={onSeeAllProducts}
            className="cursor-pointer font-medium text-text-primary underline underline-offset-2 hover:text-primary-orange"
          >
            See all products
          </button>
        </p>
      )}
    </div>
  )
}

export function CategoryListingView({
  selection,
  onGoHome,
  onProductSelect,
  onSeeAllProducts,
}: CategoryListingViewProps) {
  const { facets } = useCatalog()
  // Delivery quotes are only returned for a known destination, so the listing
  // query carries one just like the catalog load does.
  const { country, isLoading: isDestinationLoading } = useProductDestination()
  const {
    activeCategory,
    setActiveCategory,
    draftCategory,
    setDraftCategory,
    isMobileFiltersOpen,
    openSections,
    filters,
    setFilters,
    draftFilters,
    setDraftFilters,
    toggleSection,
    openMobileFilters,
    closeMobileFilters,
    saveMobileFilters,
  } = useListingFilters(selection.subcategoryLabel)

  // "New Releases > Latest Arrivals" is served by /products/new-arrivals, not by
  // a categoryId+subcategory pair, which matches nothing on the backend.
  const isNewArrivalsSubcategory =
    selection.categoryId === 'new-releases' && isNewReleasesSubcategory(activeCategory)
  const { products: newArrivalProducts, isLoading: isNewArrivalsLoading } =
    useNewReleasesSubcategoryProducts(isNewArrivalsSubcategory)

  // "All products" ignores the category entirely, so both params are dropped.
  // Sending categoryId=featured would return only the 13 featured items rather
  // than the whole catalog.
  const isAllProducts = activeCategory === ALL_PRODUCTS_LABEL

  const listParams = useMemo(
    () => ({
      country,
      // The sentinel is a UI-only label; sending it would match zero products.
      categoryId: isAllProducts ? undefined : selection.categoryId,
      subcategory: isAllProducts ? undefined : activeCategory,
      // Delivery is filtered by the server (the API owns the quotes), unlike the
      // other facets, which are applied to the fetched list below.
      ...deliveryOptionToParams(filters.delivery),
    }),
    // `filters.delivery` is included so choosing a delivery option refetches;
    // the remaining facets are handled locally and deliberately excluded.
    [activeCategory, country, filters.delivery, isAllProducts, selection.categoryId],
  )

  const fallbackProducts = useMemo(
    () => getListingProducts(selection, activeCategory),
    [activeCategory, selection],
  )

  const { products: queriedProducts, isLoading: isQueryLoading } = useProductListing(
    listParams,
    fallbackProducts,
  )

  // Facet filtering runs on the fetched list rather than in the query string.
  // The catalog fits in a single request, so a local filter is instant and
  // avoids refetching on every slider tick.
  const filteredProducts = useMemo(
    () => applyListingFilters(queriedProducts, filters),
    [filters, queriedProducts],
  )

  const listingProducts = isNewArrivalsSubcategory ? newArrivalProducts : filteredProducts
  // The destination is still resolving on a signed-in customer's first visit, so
  // the loader stays up rather than showing a quote-less list that refetches.
  const isLoading =
    isDestinationLoading ||
    (isNewArrivalsSubcategory ? isNewArrivalsLoading : isQueryLoading)

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
        draftFilters={draftFilters}
        onDraftFiltersChange={setDraftFilters}
        facets={facets}
        onClose={closeMobileFilters}
        onSave={saveMobileFilters}
        showAllProductOption
      />

      <section className="border-t border-border-primary px-4 pb-10 pt-4 lg:border-t-0 lg:px-16 lg:pt-4">
        <div className="flex gap-4">
          <ListingFiltersSidebar
            selectedCategory={activeCategory}
            categoryOptions={selection.subcategoryOptions}
            onCategoryChange={setActiveCategory}
            openSections={openSections}
            onToggleSection={toggleSection}
            filters={filters}
            onFiltersChange={setFilters}
            facets={facets}
            showAllProductOption
          />

          <div className="min-w-0 flex-1">
            {isLoading ? (
              <ListingLoader />
            ) : listingProducts.length > 0 ? (
              <div className="grid grid-cols-2 items-stretch gap-2 sm:grid-cols-3 xl:grid-cols-4">
                {listingProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    enableAddButton
                    to={getProductPath(product.id, {
                      categoryId: selection.categoryId,
                      subcategory: selection.subcategoryLabel,
                    })}
                    onClick={() => onProductSelect(product)}
                  />
                ))}
              </div>
            ) : (
              <ListingEmptyState
                categoryLabel={selection.categoryLabel}
                subcategoryLabel={activeCategory}
                onSeeAllProducts={onSeeAllProducts}
                hasActiveFacetFilters={hasActiveFilters(filters)}
                onClearFilters={() => setFilters(defaultListingFilters)}
              />
            )}
          </div>
        </div>
      </section>
    </>
  )
}
