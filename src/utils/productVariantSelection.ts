import type {
  ProductDetail,
  ProductDetailVariant,
  ProductOptionGroup,
} from '../data/productDetail'

export type VariantSelections = Record<string, string>

export function getDefaultVariant(variants: ProductDetailVariant[]): ProductDetailVariant | undefined {
  return variants.find((variant) => variant.isDefault) ?? variants[0]
}

export function selectionsFromVariant(
  variant: ProductDetailVariant,
  optionGroups: ProductOptionGroup[],
): VariantSelections {
  const selections: VariantSelections = {}
  for (const group of optionGroups) {
    if (group.key === 'color' && variant.color) selections.color = variant.color
    if (group.key === 'size' && variant.size) selections.size = variant.size
  }
  return selections
}

/**
 * Opening selections for the picker: the default variant's colour is chosen so
 * the gallery and price have something to show, but a size with more than one
 * value is left for the shopper to pick, which keeps Add to cart disabled until
 * they do.
 */
export function getInitialSelections(
  variants: ProductDetailVariant[],
  optionGroups: ProductOptionGroup[],
): VariantSelections {
  const initial = getDefaultVariant(variants)
  if (!initial) return {}

  const selections = selectionsFromVariant(initial, optionGroups)
  const sizeGroup = optionGroups.find((group) => group.key === 'size')
  if (sizeGroup && sizeGroup.values.length > 1) {
    delete selections.size
  }
  return selections
}

/** True once every option group (e.g. colour and size) has a value. */
export function isSelectionComplete(
  optionGroups: ProductOptionGroup[],
  selections: VariantSelections,
): boolean {
  return optionGroups.every((group) => Boolean(selections[group.key]))
}

function variantMatchesSelections(
  variant: ProductDetailVariant,
  optionGroups: ProductOptionGroup[],
  selections: VariantSelections,
): boolean {
  return optionGroups.every((group) => {
    const selected = selections[group.key]
    if (!selected) return true
    if (group.key === 'color') return variant.color === selected
    if (group.key === 'size') return variant.size === selected
    return variant.name === selected
  })
}

export function findVariantForSelections(
  variants: ProductDetailVariant[],
  optionGroups: ProductOptionGroup[],
  selections: VariantSelections,
): ProductDetailVariant | undefined {
  return variants.find((variant) => variantMatchesSelections(variant, optionGroups, selections))
}

/**
 * Whether any in-stock variant matches the selections. Checks every match rather
 * than the first, since a partial selection (a colour with no size yet) matches
 * several variants and only some of them may be sold out.
 */
export function hasInStockVariant(
  variants: ProductDetailVariant[],
  optionGroups: ProductOptionGroup[],
  selections: VariantSelections,
): boolean {
  return variants.some(
    (variant) => variant.inStock && variantMatchesSelections(variant, optionGroups, selections),
  )
}

export function isValueAvailable(
  variants: ProductDetailVariant[],
  optionGroups: ProductOptionGroup[],
  selections: VariantSelections,
  groupKey: string,
  value: string,
): boolean {
  return hasInStockVariant(variants, optionGroups, { ...selections, [groupKey]: value })
}

export function slideIndexForSelection(
  detail: ProductDetail,
  variant: ProductDetailVariant | undefined,
  clickedColor?: string,
): number | null {
  if (variant?.imageIndex != null) return variant.imageIndex
  if (clickedColor) {
    const index = detail.gallery.findIndex(
      (image) =>
        detail.variants.find((entry) => entry.rid === image.variantRid)?.color === clickedColor,
    )
    if (index !== -1) return index
  }
  return null
}

export function resolveSelectionAfterPick(
  variants: ProductDetailVariant[],
  optionGroups: ProductOptionGroup[],
  current: VariantSelections,
  groupKey: string,
  value: string,
): VariantSelections {
  const next = { ...current, [groupKey]: value }
  if (findVariantForSelections(variants, optionGroups, next)) {
    return next
  }

  const candidates = variants.filter((variant) => {
    if (groupKey === 'color') return variant.color === value
    if (groupKey === 'size') return variant.size === value
    return variant.name === value
  })

  const preferred =
    candidates.find((variant) => variant.inStock) ?? candidates[0] ?? getDefaultVariant(variants)

  if (!preferred) return next

  return selectionsFromVariant(preferred, optionGroups)
}
