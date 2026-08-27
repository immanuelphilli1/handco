import { featuredProducts, type Product } from '../data/products'
import { ProductCard } from './ProductCard'

type FeaturedItemsSectionProps = {
  onProductSelect?: (product: Product) => void
}

export function FeaturedItemsSection({ onProductSelect }: FeaturedItemsSectionProps) {
  return (
    <section className="border-b border-border-primary px-4 lg:px-16">
      <div className="flex flex-col gap-10 py-6 lg:gap-14 lg:py-10">
        <h2 className="text-xl font-medium leading-6 tracking-[-0.4px] text-text-primary lg:text-[32px] lg:leading-10 lg:tracking-[-0.64px]">
          Featured items
        </h2>
        <div className="grid grid-cols-2 items-stretch gap-2 lg:grid-cols-5">
          {featuredProducts.map((product, index) => (
            <ProductCard
              key={`${product.name}-${index}`}
              product={product}
              enableAddButton
              onClick={onProductSelect ? () => onProductSelect(product) : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
