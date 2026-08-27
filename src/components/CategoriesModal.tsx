import { useCallback, useEffect, useRef, useState } from 'react'
import AlarmWarningLineIcon from 'remixicon-react/AlarmWarningLineIcon'
import AppsLineIcon from 'remixicon-react/AppsLineIcon'
import ArrowLeftSLineIcon from 'remixicon-react/ArrowLeftSLineIcon'
import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon'
import ComputerLineIcon from 'remixicon-react/ComputerLineIcon'
import HammerLineIcon from 'remixicon-react/HammerLineIcon'
import HandbagLineIcon from 'remixicon-react/HandbagLineIcon'
import Home2LineIcon from 'remixicon-react/Home2LineIcon'
import LightbulbFlashLineIcon from 'remixicon-react/LightbulbFlashLineIcon'
import PaletteLineIcon from 'remixicon-react/PaletteLineIcon'
import PlantLineIcon from 'remixicon-react/PlantLineIcon'
import StarLineIcon from 'remixicon-react/StarLineIcon'
import TShirt2LineIcon from 'remixicon-react/TShirt2LineIcon'
import {
  categoryIdByTitle,
  categoryPanelContent,
  sidebarCategories,
  type SidebarCategoryId,
  type Subcategory,
} from '../data/categoriesModal'
import { allCategoriesListingSelection } from '../data/categoryListing'
import type { CategoryListingSelection } from '../data/categoryListing'

type CategoriesModalProps = {
  isOpen: boolean
  initialCategoryId: SidebarCategoryId
  onClose: () => void
  onSubcategorySelect: (selection: CategoryListingSelection) => void
}

type MobileView = 'list' | 'detail'

type RemixIcon = typeof StarLineIcon

const categoryIcons: Record<SidebarCategoryId, RemixIcon> = {
  'all-categories': AppsLineIcon,
  featured: StarLineIcon,
  'new-releases': AlarmWarningLineIcon,
  electronics: ComputerLineIcon,
  fashion: TShirt2LineIcon,
  'home-garden': PlantLineIcon,
  decor: PaletteLineIcon,
  furniture: Home2LineIcon,
  accessories: HandbagLineIcon,
  construction: HammerLineIcon,
  energy: LightbulbFlashLineIcon,
}

function CategoryIcon({
  categoryId,
  className = 'size-6',
  isActive = false,
}: {
  categoryId: SidebarCategoryId
  className?: string
  isActive?: boolean
}) {
  const IconComponent = categoryIcons[categoryId]

  return (
    <IconComponent
      className={`shrink-0 transition-colors ${className} ${
        isActive ? 'text-primary-orange' : 'text-text-secondary'
      }`}
      aria-hidden
    />
  )
}

function CategoryLinkButton({
  category,
  isActive = false,
  onClick,
  showActiveState = true,
}: {
  category: (typeof sidebarCategories)[number]
  isActive?: boolean
  onClick: () => void
  showActiveState?: boolean
}) {
  const active = showActiveState && isActive

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-12 w-full items-center gap-2 rounded-lg p-4 text-left transition-colors ${
        active ? 'bg-orange-light' : 'hover:bg-bg-secondary active:bg-bg-secondary'
      }`}
    >
      <CategoryIcon categoryId={category.id} isActive={active} />
      <span
        className={`min-w-0 flex-1 text-base font-medium tracking-[-0.32px] ${
          active ? 'text-primary-orange' : 'text-text-secondary'
        }`}
      >
        {category.label}
      </span>
      <ArrowRightSLineIcon className="size-6 shrink-0 text-text-secondary" aria-hidden />
    </button>
  )
}

function SubcategoryCard({
  label,
  image,
  onSelect,
}: Subcategory & { onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className="flex flex-col items-center gap-2 text-center">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-full bg-bg-secondary">
        <img alt="" className="size-full object-cover" src={image} />
      </div>
      <span className="line-clamp-2 w-full text-base font-medium tracking-[-0.32px] text-text-primary">
        {label}
      </span>
    </button>
  )
}

function CategorySectionPanel({
  sectionId,
  title,
  items,
  onSubcategorySelect,
}: {
  sectionId: SidebarCategoryId
  title: string
  items: Subcategory[]
  onSubcategorySelect: (selection: CategoryListingSelection) => void
}) {
  return (
    <section data-section-id={sectionId} className="flex scroll-mt-4 flex-col gap-2">
      <h3 className="text-2xl font-medium tracking-[-0.48px] text-text-primary">{title}</h3>
      <div className="grid grid-cols-3 gap-x-8 gap-y-8 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-7">
        {items.map((item) => (
          <SubcategoryCard
            key={`${title}-${item.label}`}
            {...item}
            onSelect={() =>
              onSubcategorySelect({
                categoryId: sectionId,
                categoryLabel: title,
                subcategoryLabel: item.label,
                subcategoryOptions: items.map((entry) => entry.label),
              })
            }
          />
        ))}
      </div>
    </section>
  )
}

function CategorySections({
  sections,
  onSubcategorySelect,
}: {
  sections: (typeof categoryPanelContent)[SidebarCategoryId]
  onSubcategorySelect: (selection: CategoryListingSelection) => void
}) {
  return (
    <div className="flex flex-col gap-8">
      {sections.map((section) => {
        const sectionId = categoryIdByTitle[section.title]
        if (!sectionId) return null

        return (
          <CategorySectionPanel
            key={section.title}
            sectionId={sectionId}
            title={section.title}
            items={section.items}
            onSubcategorySelect={onSubcategorySelect}
          />
        )
      })}
    </div>
  )
}

export function CategoriesModal({
  isOpen,
  initialCategoryId,
  onClose,
  onSubcategorySelect,
}: CategoriesModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isScrollingToSection = useRef(false)
  const [selectedId, setSelectedId] = useState<SidebarCategoryId>('featured')
  const [activeId, setActiveId] = useState<SidebarCategoryId>('featured')
  const [mobileView, setMobileView] = useState<MobileView>('list')

  const sections = categoryPanelContent[selectedId]
  const selectedCategory = sidebarCategories.find((category) => category.id === selectedId)

  const scrollToSection = useCallback((categoryId: SidebarCategoryId) => {
    const container = scrollContainerRef.current
    const section = container?.querySelector<HTMLElement>(`[data-section-id="${categoryId}"]`)
    if (!container || !section) return

    isScrollingToSection.current = true
    const containerTop = container.getBoundingClientRect().top
    const sectionTop = section.getBoundingClientRect().top
    container.scrollTo({
      top: container.scrollTop + (sectionTop - containerTop),
      behavior: 'smooth',
    })

    window.setTimeout(() => {
      isScrollingToSection.current = false
    }, 400)
  }, [])

  const handleDesktopCategorySelect = useCallback(
    (categoryId: SidebarCategoryId) => {
      if (categoryId === 'all-categories') {
        onSubcategorySelect(allCategoriesListingSelection)
        return
      }

      const sectionExists = sections.some(
        (section) => categoryIdByTitle[section.title] === categoryId,
      )

      setActiveId(categoryId)

      if (sectionExists) {
        scrollToSection(categoryId)
        return
      }

      setSelectedId(categoryId)
      scrollContainerRef.current?.scrollTo({ top: 0 })
    },
    [onSubcategorySelect, scrollToSection, sections],
  )

  const handleMobileCategorySelect = useCallback(
    (categoryId: SidebarCategoryId) => {
      if (categoryId === 'all-categories') {
        onSubcategorySelect(allCategoriesListingSelection)
        return
      }

      setSelectedId(categoryId)
      setActiveId(categoryId)
      setMobileView('detail')
    },
    [onSubcategorySelect],
  )

  const handleMobileBack = useCallback(() => {
    setMobileView('list')
  }, [])

  useEffect(() => {
    if (!isOpen) return

    setSelectedId(initialCategoryId)
    setActiveId(initialCategoryId)
    setMobileView(
      window.matchMedia('(max-width: 1023px)').matches && initialCategoryId !== 'featured'
        ? 'detail'
        : 'list',
    )
    scrollContainerRef.current?.scrollTo({ top: 0 })
  }, [initialCategoryId, isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (mobileView === 'detail' && window.matchMedia('(max-width: 1023px)').matches) {
          setMobileView('list')
          return
        }

        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    document.body.style.width = '100%'
    document.addEventListener('keydown', handleKeyDown)

    const handleResize = () => {
      document.body.style.width = '100%'
    }

    window.addEventListener('resize', handleResize)

    return () => {
      document.body.style.overflow = ''
      document.body.style.width = ''
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen, mobileView, onClose])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || !isOpen) return

    const sectionElements = container.querySelectorAll('[data-section-id]')
    if (sectionElements.length === 0) return

    const visibleSections = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingToSection.current) return

        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-section-id')
          if (!id) return

          if (entry.isIntersecting) {
            visibleSections.set(id, entry.intersectionRatio)
          } else {
            visibleSections.delete(id)
          }
        })

        if (visibleSections.size === 0) return

        let bestId: SidebarCategoryId | null = null
        let bestRatio = 0

        visibleSections.forEach((ratio, id) => {
          if (ratio >= bestRatio) {
            bestRatio = ratio
            bestId = id as SidebarCategoryId
          }
        })

        if (bestId) setActiveId(bestId)
      },
      {
        root: container,
        rootMargin: '-10% 0px -55% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    )

    sectionElements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [isOpen, selectedId, sections])

  if (!isOpen) return null

  return (
    <>
      <button
        type="button"
        aria-label="Close categories"
        className="fixed inset-0 z-40 bg-linear-to-b from-transparent via-[rgba(0,6,7,0.0)] to-[rgba(0,6,7,0.7)]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Categories"
        className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-178px)] overflow-hidden bg-bg-primary shadow-lg lg:max-h-175 lg:px-16 lg:py-4"
      >
        <div className="mx-auto flex h-full max-h-[inherit] w-full max-w-360 overflow-hidden lg:max-h-167">
          <nav className="hidden w-72 shrink-0 flex-col overflow-y-auto p-2 lg:flex">
            {sidebarCategories.map((category) => {
              const isActive = category.id === activeId

              return (
                <CategoryLinkButton
                  key={category.id}
                  category={category}
                  isActive={isActive}
                  onClick={() => handleDesktopCategorySelect(category.id)}
                />
              )
            })}
          </nav>

          <div
            ref={scrollContainerRef}
            className="hidden min-w-0 flex-1 overflow-y-auto border-border-primary p-4 lg:block lg:border-l"
          >
            <CategorySections sections={sections} onSubcategorySelect={onSubcategorySelect} />
          </div>

          {mobileView === 'list' ? (
            <nav className="flex w-full flex-col overflow-y-auto p-2 lg:hidden">
              {sidebarCategories.map((category) => (
                <CategoryLinkButton
                  key={category.id}
                  category={category}
                  onClick={() => handleMobileCategorySelect(category.id)}
                  showActiveState={false}
                />
              ))}
            </nav>
          ) : (
            <div className="flex min-h-0 w-full flex-col overflow-y-auto lg:hidden">
              <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border-primary bg-bg-primary p-4">
                <button
                  type="button"
                  onClick={handleMobileBack}
                  aria-label="Back to categories"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-secondary transition-colors hover:bg-orange-light active:bg-orange-light"
                >
                  <ArrowLeftSLineIcon className="size-5 text-text-secondary" aria-hidden />
                </button>
                <h2 className="min-w-0 flex-1 text-base font-medium tracking-[-0.32px] text-text-primary">
                  {selectedCategory?.label}
                </h2>
              </div>

              <div className="p-4">
                <CategorySections sections={sections} onSubcategorySelect={onSubcategorySelect} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
