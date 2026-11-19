import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppsFillIcon from 'remixicon-react/AppsFillIcon'
import AppsLineIcon from 'remixicon-react/AppsLineIcon'
import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon'
import { useCatalog } from '../context/CatalogContext'
import { getCategoryNavIcon } from '../data/categoryNavIcons'
import {
  buildMegaMenuContent,
  buildMegaMenuEntries,
  resolveMegaMenuEntryId,
  type MegaMenuGroup,
  type MegaMenuTile,
} from '../data/categoryMegaMenu'

type CategoriesMenuProps = {
  isOpen: boolean
  /** Category the menu opens on (the one being browsed, or a picked one). */
  initialCategoryId: string
  onClose: () => void
  /**
   * Path of the category a quick link points at, while that link is hovered.
   * Its tile is highlighted so the menu shows where the link sits in the tree.
   */
  highlightPath?: string | null
  /** Desktop hover: the pointer entered or left the open panel. */
  onPointerEnterPanel?: () => void
  onPointerLeavePanel?: () => void
}

/** Matches Tailwind's `lg` breakpoint, where the desktop dropdown takes over. */
const MOBILE_QUERY = '(max-width: 1023.98px)'

/**
 * Delay before a hovered main category replaces the open one. It lets the
 * pointer cross other rows on its way to the subcategories without switching
 * the panel under it.
 */
const HOVER_INTENT_MS = 120

/**
 * Elements that open or toggle the menu. A press on one of them is not an
 * "outside click", otherwise the press would close the menu and the click that
 * follows would reopen it.
 */
export const CATEGORIES_TRIGGER_ATTR = 'data-categories-trigger'

function TileCircle({ tile, isHighlighted }: { tile: MegaMenuTile; isHighlighted: boolean }) {
  const iconSize = 'size-7'

  let content = null
  if (tile.isViewAll) {
    content = <AppsLineIcon className={`${iconSize} text-text-secondary`} aria-hidden />
  } else if (tile.image) {
    content = (
      <img
        alt=""
        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        src={tile.image}
      />
    )
  } else if (tile.iconCategoryId) {
    content = createElement(getCategoryNavIcon(tile.iconCategoryId), {
      className: `${iconSize} text-text-secondary`,
      'aria-hidden': true,
    })
  }

  return (
    <span
      className={`flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg-secondary ring-offset-2 ring-offset-bg-primary transition-shadow ${
        isHighlighted ? '' : ''
      }`}
    >
      {content}
    </span>
  )
}

function Tile({
  tile,
  highlightPath,
  onSelect,
}: {
  tile: MegaMenuTile
  highlightPath?: string | null
  onSelect: (path: string) => void
}) {
  const isHighlighted = Boolean(highlightPath) && tile.path === highlightPath

  return (
    <li className="min-w-0" data-highlighted={isHighlighted ? '' : undefined}>
      <a
        href={tile.path}
        onClick={(event) => {
          event.preventDefault()
          onSelect(tile.path)
        }}
        className="group flex cursor-pointer flex-col items-center gap-2 text-center"
      >
        <TileCircle tile={tile} isHighlighted={isHighlighted} />
        <span
          className={`line-clamp-2 w-full text-xs font-medium leading-4 transition-colors group-hover:text-primary-orange ${
            isHighlighted ? 'text-primary-orange' : 'text-text-primary'
          }`}
        >
          {tile.label}
        </span>
      </a>
    </li>
  )
}

function ShopByCategoryHeading() {
  return (
    <h3 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-[-0.28px] text-primary-orange">
      <AppsFillIcon className="size-4 shrink-0" aria-hidden />
      Shop by category
    </h3>
  )
}

function GroupSection({
  group,
  gridClassName,
  highlightPath,
  onSelect,
}: {
  group: MegaMenuGroup
  gridClassName: string
  highlightPath?: string | null
  onSelect: (path: string) => void
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold uppercase tracking-[-0.28px] text-text-primary">
        {group.title}
      </h3>
      <ul className={gridClassName}>
        {group.tiles.map((tile) => (
          <Tile key={tile.key} tile={tile} highlightPath={highlightPath} onSelect={onSelect} />
        ))}
      </ul>
    </section>
  )
}

/**
 * The SHEIN-style Categories menu.
 *
 * Desktop: a full-width dropdown under the header. Main categories run down
 * the start edge; hovering (or clicking, for touch screens) one shows its
 * "Shop by category" grid and its grouped subcategories beside it. The shopper
 * stays on the current page, and the menu closes on an outside click, Escape,
 * leaving the menu with the mouse, or a route change.
 *
 * Mobile and tablet: the same content as two columns, main categories in a
 * narrow column and the selected category's grids beside it.
 */
export function CategoriesMenu({
  isOpen,
  initialCategoryId,
  onClose,
  highlightPath = null,
  onPointerEnterPanel,
  onPointerLeavePanel,
}: CategoriesMenuProps) {
  const { categories } = useCatalog()
  const navigate = useNavigate()
  const location = useLocation()
  const entries = useMemo(() => buildMegaMenuEntries(categories), [categories])
  const panelRef = useRef<HTMLDivElement>(null)
  const desktopContentRef = useRef<HTMLDivElement>(null)
  const mobileContentRef = useRef<HTMLDivElement>(null)
  const hoverTimerRef = useRef<number | null>(null)
  const [selectedId, setSelectedId] = useState('featured')

  const content = useMemo(
    () => buildMegaMenuContent(selectedId, categories),
    [categories, selectedId],
  )
  const hasGroups = content.groups.length > 0

  const clearHoverTimer = useCallback(() => {
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }, [])

  const selectEntry = useCallback(
    (entryId: string) => {
      clearHoverTimer()
      setSelectedId(entryId)
    },
    [clearHoverTimer],
  )

  const scheduleEntry = useCallback(
    (entryId: string) => {
      clearHoverTimer()
      hoverTimerRef.current = window.setTimeout(() => selectEntry(entryId), HOVER_INTENT_MS)
    },
    [clearHoverTimer, selectEntry],
  )

  const openPath = useCallback(
    (path: string) => {
      onClose()
      navigate(path)
    },
    [navigate, onClose],
  )

  useEffect(() => clearHoverTimer, [clearHoverTimer])

  // Each opening starts on the category being browsed.
  useEffect(() => {
    if (!isOpen) return
    setSelectedId(resolveMegaMenuEntryId(initialCategoryId, categories))
  }, [categories, initialCategoryId, isOpen])

  // A newly selected category starts at the top of its content, unless a
  // quick link is being hovered: then its tile is brought into view.
  useEffect(() => {
    const highlighted = highlightPath
      ? [...(panelRef.current?.querySelectorAll<HTMLElement>('[data-highlighted]') ?? [])].find(
          (element) => element.offsetParent !== null,
        )
      : undefined

    if (highlighted) {
      highlighted.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      return
    }

    desktopContentRef.current?.scrollTo({ top: 0 })
    mobileContentRef.current?.scrollTo({ top: 0 })
  }, [highlightPath, selectedId])

  // Close when the route changes, e.g. a link elsewhere in the header was
  // followed while the menu was open.
  const locationKey = `${location.pathname}${location.search}`
  const lastLocationKeyRef = useRef(locationKey)
  useEffect(() => {
    if (lastLocationKeyRef.current === locationKey) return
    lastLocationKeyRef.current = locationKey
    if (isOpen) onClose()
  }, [isOpen, locationKey, onClose])

  // Outside click. The backdrop handles its own click, and the Categories
  // triggers toggle the menu themselves, so both are skipped here.
  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (panelRef.current?.contains(target)) return
      if (target.closest(`[${CATEGORIES_TRIGGER_ATTR}]`)) return
      if (target.closest('[data-categories-backdrop]')) return
      onClose()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // The mobile sheet covers the page, so the page behind it must not scroll.
  // On desktop the menu is a dropdown and the page stays scrollable.
  useEffect(() => {
    if (!isOpen) return

    const mediaQuery = window.matchMedia(MOBILE_QUERY)
    const syncScrollLock = () => {
      document.body.style.overflow = mediaQuery.matches ? 'hidden' : ''
      document.body.style.width = mediaQuery.matches ? '100%' : ''
    }

    syncScrollLock()
    mediaQuery.addEventListener('change', syncScrollLock)

    return () => {
      mediaQuery.removeEventListener('change', syncScrollLock)
      document.body.style.overflow = ''
      document.body.style.width = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handlePanelPointerEnter = (event: ReactPointerEvent) => {
    if (event.pointerType === 'mouse') onPointerEnterPanel?.()
  }
  const handlePanelPointerLeave = (event: ReactPointerEvent) => {
    if (event.pointerType === 'mouse') onPointerLeavePanel?.()
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close categories"
        data-categories-backdrop
        tabIndex={-1}
        className="fixed inset-x-0 bottom-0 top-(--nav-height,8rem) z-40 cursor-default bg-[rgba(0,6,7,0.5)]"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        id="categories-menu"
        role="region"
        aria-label="Categories"
        className="absolute inset-x-0 top-full z-50 bg-bg-primary shadow-lg"
        onClick={(event) => event.stopPropagation()}
        onPointerEnter={handlePanelPointerEnter}
        onPointerLeave={handlePanelPointerLeave}
      >
        {/* Desktop */}
        <div className="mx-auto hidden h-[min(37.5rem,calc(100dvh-var(--nav-height,8rem)-1rem))] max-w-400 px-16 py-5 lg:flex">
          <nav
            aria-label="Main categories"
            className="flex w-60 shrink-0 flex-col overflow-y-auto pe-6"
            onPointerLeave={clearHoverTimer}
          >
            {entries.map((entry) => {
              const isActive = entry.id === selectedId
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => selectEntry(entry.id)}
                  onPointerEnter={(event) => {
                    if (event.pointerType === 'mouse') scheduleEntry(entry.id)
                  }}
                  onPointerLeave={clearHoverTimer}
                  onFocus={() => selectEntry(entry.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`flex min-h-10 w-full shrink-0 cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-left rtl:text-right text-sm tracking-[-0.28px] transition-colors ${
                    isActive
                      ? 'bg-bg-secondary font-medium text-text-primary'
                      : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                  }`}
                >
                  <span className="min-w-0 flex-1">{entry.label}</span>
                  <ArrowRightSLineIcon
                    className="size-4 shrink-0 text-text-tertiary rtl:-scale-x-100"
                    aria-hidden
                  />
                </button>
              )
            })}
          </nav>

          <div ref={desktopContentRef} className="flex min-w-0 flex-1 overflow-hidden">
            <div
              className={`flex flex-col gap-4 overflow-y-auto border-s border-border-primary px-8 ${
                hasGroups ? 'w-88 shrink-0' : 'min-w-0 flex-1'
              }`}
            >
              <ShopByCategoryHeading />
              <ul
                className={`grid gap-x-4 gap-y-5 ${
                  hasGroups ? 'grid-cols-3' : 'grid-cols-[repeat(auto-fill,minmax(6rem,1fr))]'
                }`}
              >
                {content.shopByCategory.map((tile) => (
                  <Tile
                    key={tile.key}
                    tile={tile}
                    highlightPath={highlightPath}
                    onSelect={openPath}
                  />
                ))}
              </ul>
            </div>

            {hasGroups ? (
              <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto border-s border-border-primary ps-8">
                {content.groups.map((group) => (
                  <GroupSection
                    key={group.key}
                    group={group}
                    highlightPath={highlightPath}
                    gridClassName="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-x-4 gap-y-5"
                    onSelect={openPath}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile and tablet */}
        <div className="flex h-[calc(100dvh-var(--nav-height,7rem)-5.5rem)] lg:hidden">
          <nav
            aria-label="Main categories"
            className="flex w-28 shrink-0 flex-col overflow-y-auto bg-bg-secondary sm:w-40"
          >
            {entries.map((entry) => {
              const isActive = entry.id === selectedId
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => selectEntry(entry.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`relative flex min-h-12 w-full shrink-0 cursor-pointer items-center px-3 py-2 text-left rtl:text-right text-sm leading-4.5 tracking-[-0.28px] transition-colors ${
                    isActive
                      ? 'bg-bg-primary font-medium text-text-primary'
                      : 'text-text-secondary active:bg-bg-primary'
                  }`}
                >
                  {isActive ? (
                    <span
                      className="absolute inset-y-3 start-0 w-0.75 rounded-e-full bg-primary-orange"
                      aria-hidden
                    />
                  ) : null}
                  {entry.label}
                </button>
              )
            })}
          </nav>

          <div
            ref={mobileContentRef}
            className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-3 pb-6"
          >
            <section className="flex flex-col gap-3">
              <ShopByCategoryHeading />
              <ul className="grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-4 md:grid-cols-5">
                {content.shopByCategory.map((tile) => (
                  <Tile
                    key={tile.key}
                    tile={tile}
                    highlightPath={highlightPath}
                    onSelect={openPath}
                  />
                ))}
              </ul>
            </section>

            {content.groups.map((group) => (
              <GroupSection
                key={group.key}
                group={group}
                highlightPath={highlightPath}
                gridClassName="grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-4 md:grid-cols-5"
                onSelect={openPath}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
