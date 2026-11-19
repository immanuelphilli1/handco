import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ProductDetail, ProductDetailVariant } from '../data/productDetail'
import {
  findVariantForSelections,
  getInitialSelections,
  hasInStockVariant,
  isSelectionComplete,
  isValueAvailable,
  resolveSelectionAfterPick,
  slideIndexForSelection,
  type VariantSelections,
} from '../utils/productVariantSelection'

export function useProductDetailSelection(detail: ProductDetail) {
  const { optionGroups, variants } = detail

  const [selections, setSelections] = useState<VariantSelections>(() =>
    getInitialSelections(variants, optionGroups),
  )

  const [legacyVariantIndex, setLegacyVariantIndex] = useState(0)
  const [galleryIndex, setGalleryIndex] = useState(0)

  useEffect(() => {
    setSelections(getInitialSelections(variants, optionGroups))
    setLegacyVariantIndex(0)
    setGalleryIndex(0)
  }, [detail.product.id, optionGroups, variants])

  const selectedVariant = useMemo((): ProductDetailVariant | undefined => {
    if (optionGroups.length > 0) {
      return findVariantForSelections(variants, optionGroups, selections)
    }
    if (variants.length > 1) {
      return variants[legacyVariantIndex] ?? variants[0]
    }
    return variants[0]
  }, [legacyVariantIndex, optionGroups, selections, variants])

  useEffect(() => {
    if (!selectedVariant) return
    const nextIndex = slideIndexForSelection(detail, selectedVariant)
    if (nextIndex != null) {
      setGalleryIndex(nextIndex)
    }
  }, [detail, selectedVariant])

  const selectOption = useCallback(
    (groupKey: string, value: string) => {
      if (groupKey === 'color') {
        const variant = findVariantForSelections(
          variants,
          optionGroups,
          resolveSelectionAfterPick(variants, optionGroups, selections, groupKey, value),
        )
        const index = slideIndexForSelection(detail, variant, value)
        if (index != null) setGalleryIndex(index)
      }
      setSelections((current) =>
        resolveSelectionAfterPick(variants, optionGroups, current, groupKey, value),
      )
    },
    [detail, optionGroups, selections, variants],
  )

  const selectLegacyVariant = useCallback((index: number) => {
    setLegacyVariantIndex(index)
  }, [])

  // A colour stays pickable while any of its sizes is in stock: picking it
  // re-resolves the size, so judging it against the current size would lock the
  // shopper out of colours that are only sold out in that one size.
  const isOptionDisabled = useCallback(
    (groupKey: string, value: string) =>
      !isValueAvailable(
        variants,
        optionGroups,
        groupKey === 'color' ? {} : selections,
        groupKey,
        value,
      ),
    [optionGroups, selections, variants],
  )

  const selectionComplete = isSelectionComplete(optionGroups, selections)
  // Until every option is picked, `selectedVariant` is only the first partial
  // match, so stock is judged across all variants the selection still allows.
  const inStock = selectionComplete
    ? (selectedVariant?.inStock ?? detail.product.inStock ?? true)
    : hasInStockVariant(variants, optionGroups, selections)
  const missingOptionLabel = optionGroups.find((group) => !selections[group.key])?.label

  return {
    selectedVariant,
    selections,
    selectOption,
    selectLegacyVariant,
    legacyVariantIndex,
    isOptionDisabled,
    galleryIndex,
    setGalleryIndex,
    displayPriceAmount: selectedVariant?.priceAmount ?? detail.priceAmount,
    displayPriceCurrency: selectedVariant?.priceCurrency ?? detail.priceCurrency,
    inStock,
    isSelectionComplete: selectionComplete,
    /** Label of the first option group still unpicked (e.g. "Size"). */
    missingOptionLabel,
    variantTitle: selectionComplete ? selectedVariant?.name : undefined,
    showOptionGroups: optionGroups.length > 0,
    showLegacyVariantRow: optionGroups.length === 0 && variants.length > 1,
    showSingleVariant: variants.length <= 1 && optionGroups.length === 0,
  }
}
