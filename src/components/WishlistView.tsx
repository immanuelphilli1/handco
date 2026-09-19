import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon'
import {
  filterWishlistProducts,
  getWishlistCategoryOptions,
  wishlistPageTitle,
} from '../data/wishlist'
import type { Product } from '../data/products'
import { useShop } from '../context/ShopContext'
import {
  ListingFiltersSidebar,
  MobileFiltersSheet,
  MobileListingHeader,
  useListingFilters,
} from './ProductListingFilters'
import { getProductPath } from '../data/shopRoutes'
import { ProductCard } from './ProductCard'

type WishlistViewProps = {
  onGoHome: () => void
  onProductSelect: (product: Product) => void
}

function WishlistBreadcrumbs({ onGoHome }: { onGoHome: () => void }) {
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
      <span className="py-2.5 text-sm font-medium leading-4 tracking-[-0.28px] text-text-primary">
        {wishlistPageTitle}
      </span>
    </nav>
  )
}

export function WishlistView({ onGoHome, onProductSelect }: WishlistViewProps) {
  const { wishlistProducts } = useShop()
  const categoryOptions = getWishlistCategoryOptions(wishlistProducts)
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
  } = useListingFilters('all')

  const visibleProducts = filterWishlistProducts(wishlistProducts, activeCategory)
  const mobileTitle = activeCategory === 'all' ? wishlistPageTitle : activeCategory

  return (
    <>
      <WishlistBreadcrumbs onGoHome={onGoHome} />

      <MobileListingHeader title={mobileTitle} onOpenFilters={openMobileFilters} />

      <MobileFiltersSheet
        isOpen={isMobileFiltersOpen}
        draftCategory={draftCategory}
        categoryOptions={categoryOptions}
        onDraftCategoryChange={setDraftCategory}
        openSections={openSections}
        onToggleSection={toggleSection}
        selectedRating={selectedRating}
        onRatingChange={setSelectedRating}
        onClose={closeMobileFilters}
        onSave={saveMobileFilters}
        showAllCategoryOption
      />

      <section className="border-t border-border-primary px-4 pb-10 pt-4 lg:border-t-0 lg:px-16 lg:pt-4">
        <div className="flex gap-4">
          <ListingFiltersSidebar
            selectedCategory={activeCategory}
            categoryOptions={categoryOptions}
            onCategoryChange={setActiveCategory}
            openSections={openSections}
            onToggleSection={toggleSection}
            selectedRating={selectedRating}
            onRatingChange={setSelectedRating}
            showAllCategoryOption
          />

          <div className="min-w-0 flex-1">
            {visibleProducts.length > 0 ? (
              <div className="grid grid-cols-2 items-stretch gap-2 sm:grid-cols-3 xl:grid-cols-4">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    enableAddButton
                    to={getProductPath(product.id, { from: 'wishlist' })}
                    onClick={() => onProductSelect(product)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-60 flex-col items-center justify-center gap-2 rounded-[12px] border border-border-primary px-6 py-10 text-center">
                <p className="text-xl font-medium leading-6 tracking-[-0.4px] text-text-primary">
                  No liked items yet
                </p>
                <p className="text-sm font-medium leading-4 tracking-[-0.28px] text-text-secondary">
                  Tap the heart on any product to save it here.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
