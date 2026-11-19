import { useCallback, useState } from 'react'
import { getMajorCategoryId } from '../data/catalogCategories'

type UseCategoryNavigationOptions = {
  /**
   * Category id from the current route, when browsing a category. Takes
   * precedence over the last-opened target so the Categories menu opens on the
   * category being viewed.
   */
  routeCategoryId?: string
}

/**
 * Categories menu state and handlers, shared by every page so the Categories
 * trigger, the mobile tab and the menu behave identically everywhere. The menu
 * navigates by itself when a category is picked.
 */
export function useCategoryNavigation(options?: UseCategoryNavigationOptions) {
  const { routeCategoryId } = options ?? {}
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [categoriesTargetId, setCategoriesTargetId] = useState<string>('featured')

  const activeCategoryId = getMajorCategoryId(routeCategoryId ?? categoriesTargetId)

  const openCategories = useCallback((categoryId: string = 'featured') => {
    setCategoriesTargetId(categoryId)
    setIsCategoriesOpen(true)
  }, [])

  // Toggles the menu open on a given category; picking the one already showing
  // closes it, so the menu can be dismissed from the same control.
  const toggleCategoriesFromLinkBar = useCallback(
    (categoryId: string = 'featured') => {
      setIsCategoriesOpen((open) => {
        if (open && getMajorCategoryId(categoriesTargetId) === getMajorCategoryId(categoryId)) {
          return false
        }

        setCategoriesTargetId(categoryId)
        return true
      })
    },
    [categoriesTargetId],
  )

  const toggleCategories = useCallback(() => {
    setIsCategoriesOpen((open) => {
      if (open) return false
      setCategoriesTargetId(activeCategoryId)
      return true
    })
  }, [activeCategoryId])

  const closeCategories = useCallback(() => {
    setIsCategoriesOpen(false)
  }, [])

  return {
    activeCategoryId,
    categoriesTargetId,
    closeCategories,
    isCategoriesOpen,
    openCategories,
    toggleCategories,
    toggleCategoriesFromLinkBar,
  }
}
