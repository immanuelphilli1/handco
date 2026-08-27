import AddLineIcon from 'remixicon-react/AddLineIcon'
import HeartFillIcon from 'remixicon-react/HeartFillIcon'
import HeartLineIcon from 'remixicon-react/HeartLineIcon'
import StarFillIcon from 'remixicon-react/StarFillIcon'
import { useShop } from '../context/ShopContext'
import type { Product } from '../data/products'

type ProductCardProps = {
  product: Product
  enableAddButton?: boolean
  onClick?: () => void
  isLiked?: boolean
  onLikedChange?: (liked: boolean) => void
  selectionMode?: {
    selected: boolean
    onSelectedChange: (selected: boolean) => void
  }
}

export function ProductCard({
  product,
  enableAddButton = false,
  onClick,
  isLiked: controlledIsLiked,
  onLikedChange,
  selectionMode,
}: ProductCardProps) {
  const { isLiked: isProductLiked, toggleWishlist, addToCart } = useShop()
  const {
    image,
    tag,
    category,
    name,
    price,
    originalPrice,
    discount,
    delivery,
    rating,
    showAddButton = false,
    priceOrange = false,
    imageObjectPosition,
  } = product

  const isLiked = controlledIsLiked ?? isProductLiked(product.id)
  const shouldShowAddButton = !selectionMode && (enableAddButton || showAddButton)

  const handleToggleLike = () => {
    if (onLikedChange) {
      onLikedChange(!isLiked)
      return
    }
    toggleWishlist(product)
  }

  const handleAddToCart = (event: React.MouseEvent) => {
    event.stopPropagation()
    addToCart(product)
  }

  const handleCardClick = () => {
    onClick?.()
  }

  return (
    <article
      className={`group/card flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden rounded-[12px] border border-border-primary p-2 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick ? handleCardClick : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleCardClick()
              }
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="relative flex aspect-square w-full flex-col justify-between overflow-hidden rounded-lg">
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-lg">
          <div className="absolute inset-0 rounded-lg bg-[#1da1f2]" />
          <img
            alt=""
            className={`absolute size-full max-w-none rounded-lg object-cover ${imageObjectPosition ?? ''}`}
            src={image}
          />
        </div>

        <div className="relative flex w-full items-start justify-between p-3">
          {selectionMode ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                selectionMode.onSelectedChange(!selectionMode.selected)
              }}
              className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 lg:size-8 ${
                selectionMode.selected
                  ? 'border-primary-orange bg-primary-orange'
                  : 'border-border-secondary bg-bg-primary'
              }`}
              aria-label={selectionMode.selected ? 'Deselect product' : 'Select product'}
              aria-pressed={selectionMode.selected}
            >
              {selectionMode.selected ? (
                <span className="size-3 rounded-full bg-bg-primary" aria-hidden />
              ) : null}
            </button>
          ) : (
            <>
              <div className="h-6 w-18 shrink-0 lg:hidden" aria-hidden />
              <div className="hidden rounded-full bg-glass px-2 py-1 lg:block">
                <p className="truncate text-xs font-medium tracking-[-0.24px] text-text-inverse">
                  {tag}
                </p>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  handleToggleLike()
                }}
                className={`flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors ${
                  isLiked ? 'bg-primary-orange/50' : 'bg-glass hover:bg-primary-orange/50'
                }`}
                aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={isLiked}
              >
                {isLiked ? (
                  <HeartFillIcon className="size-5 text-primary-red" aria-hidden />
                ) : (
                  <HeartLineIcon className="size-5 text-text-inverse" aria-hidden />
                )}
              </button>
            </>
          )}
        </div>

        <div className="relative p-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-glass px-2 py-1">
            <StarFillIcon className="size-5 text-primary-gold" aria-hidden />
            <span className="text-base font-medium tracking-[-0.32px] text-text-inverse">
              {rating}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-1 py-2">
        <p className="text-sm font-medium tracking-[-0.28px] text-text-secondary">{category}</p>
        <p className="line-clamp-2 min-h-10 text-base font-semibold tracking-[-0.32px] text-text-primary">
          {name}
        </p>
        <div className="mt-auto flex items-end gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex min-h-7 flex-wrap items-center gap-2">
              <p
                className={`truncate text-xl font-semibold tracking-[-0.4px] ${
                  priceOrange || selectionMode ? 'text-primary-orange' : 'text-text-primary'
                }`}
              >
                {price}
              </p>
              {originalPrice && (
                <p className="text-base font-medium tracking-[-0.32px] text-text-tertiary line-through">
                  {originalPrice}
                </p>
              )}
              {discount && (
                <span className="rounded-full bg-red-light px-2 py-1 text-xs font-medium tracking-[-0.24px] text-primary-red">
                  {discount}
                </span>
              )}
            </div>
            <p className="text-sm font-medium tracking-[-0.28px] text-primary-green">{delivery}</p>
          </div>
          {shouldShowAddButton && (
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-orange transition-[opacity,background-color] duration-300 hover:bg-primary-orange/80 lg:pointer-events-none lg:opacity-0 lg:group-hover/card:pointer-events-auto lg:group-hover/card:opacity-100"
              aria-label="Add to cart"
            >
              <AddLineIcon className="size-6 text-text-inverse" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
