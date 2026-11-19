import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import ArrowLeftSLineIcon from 'remixicon-react/ArrowLeftSLineIcon'
import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon'
import { useLocation } from 'react-router-dom'
import { getNavigationLinks } from '../api/services/navigation'
import { fallbackNavigationLinks, type NavigationLink } from '../data/navigationLinks'
import { BannerLink } from '../utils/bannerLink'
import { inlineDirectionSign } from '../utils/layoutDirection'

const scrollButtonClass =
  'hidden size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-orange-light hover:text-primary-orange disabled:pointer-events-none disabled:opacity-30 lg:flex'

type QuickNavigationBarProps = {
  /**
   * Mobile only: the header is transparent over the home hero, so the links are
   * drawn in white until the header turns solid.
   */
  isFloating?: boolean
  /** Rendered before the links, e.g. the desktop Categories trigger (SHEIN-style). */
  leading?: ReactNode
  /**
   * Desktop hover: like the nav row on SHEIN, resting the mouse on a link opens
   * the Categories menu where that link sits in the category tree.
   */
  onLinkHover?: (link: NavigationLink) => void
  onLinkHoverEnd?: () => void
  /** The link whose place the open Categories menu is showing. */
  menuLinkUrl?: string | null
}

/** Whether a storefront link points at the page being viewed. */
function isCurrentLink(linkUrl: string, pathname: string, search: string): boolean {
  if (!linkUrl.startsWith('/') || linkUrl.startsWith('//')) return false

  const [linkPath, linkQuery = ''] = linkUrl.split('?')
  if (linkPath !== pathname) return false
  if (!linkQuery) return true

  const current = new URLSearchParams(search)
  const wanted = new URLSearchParams(linkQuery)
  for (const [key, value] of wanted) {
    if (current.get(key) !== value) return false
  }
  return true
}

/**
 * Shortcut links under the search bar (New Arrivals, Best Sellers, Bags…).
 *
 * The categories themselves live in the Categories menu, so this bar holds a
 * short, staff-managed list rather than repeating the category tree. It
 * scrolls sideways on narrow screens and never wraps onto a second line.
 */
export function QuickNavigationBar({
  isFloating = false,
  leading,
  onLinkHover,
  onLinkHoverEnd,
  menuLinkUrl = null,
}: QuickNavigationBarProps) {
  const { pathname, search } = useLocation()
  const [links, setLinks] = useState<NavigationLink[]>(fallbackNavigationLinks)

  const listRef = useRef<HTMLUListElement>(null)
  const [overflow, setOverflow] = useState({ start: false, end: false })

  // Desktop shows ‹ › buttons, like SHEIN, once the links no longer fit.
  // `scrollLeft` is negative in a right-to-left list, hence `Math.abs`.
  const syncOverflow = useCallback(() => {
    const list = listRef.current
    if (!list) return
    const offset = Math.abs(list.scrollLeft)
    const start = offset > 1
    const end = offset + list.clientWidth < list.scrollWidth - 1
    setOverflow((current) =>
      current.start === start && current.end === end ? current : { start, end },
    )
  }, [])

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const observer = new ResizeObserver(syncOverflow)
    observer.observe(list)
    list.addEventListener('scroll', syncOverflow, { passive: true })
    return () => {
      observer.disconnect()
      list.removeEventListener('scroll', syncOverflow)
    }
  }, [syncOverflow])

  useEffect(() => {
    syncOverflow()
  }, [links, syncOverflow])

  const scrollLinks = (direction: 'back' | 'forward') => {
    const list = listRef.current
    if (!list) return
    const distance = list.clientWidth * 0.7 * (direction === 'forward' ? 1 : -1)
    list.scrollBy({ left: distance * inlineDirectionSign(list), behavior: 'smooth' })
  }

  useEffect(() => {
    let cancelled = false
    void getNavigationLinks().then((items) => {
      if (!cancelled) setLinks(items)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <nav
      aria-label="Quick links"
      className={`transition-colors duration-300 lg:border-b lg:border-border-primary lg:bg-bg-primary lg:px-14 ${
        isFloating ? 'bg-transparent' : 'border-b border-border-primary bg-bg-primary'
      }`}
    >
      <div className="mx-auto flex max-w-380 items-center lg:gap-1 lg:py-2">
        {leading}
        <ul
          ref={listRef}
          className="flex min-w-0 flex-1 gap-1 overflow-x-auto lg:gap-0 overscroll-x-contain scroll-smooth px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {links.map((link) => {
            const isActive = isCurrentLink(link.linkUrl, pathname, search)
            const isShowingMenu = menuLinkUrl === link.linkUrl
            const colorClass = isActive || isShowingMenu
              ? 'bg-orange-light text-primary-orange'
              : isFloating
                ? 'text-text-inverse hover:bg-white/15 lg:text-text-secondary lg:hover:bg-orange-light lg:hover:text-primary-orange'
                : 'text-text-secondary hover:bg-orange-light hover:text-primary-orange'

            return (
              <li
                key={`${link.label}-${link.linkUrl}`}
                className="shrink-0"
                onPointerEnter={(event) => {
                  if (event.pointerType === 'mouse') onLinkHover?.(link)
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === 'mouse') onLinkHoverEnd?.()
                }}
              >
                <BannerLink
                  linkUrl={link.linkUrl}
                  ariaCurrent={isActive ? 'page' : undefined}
                  className={`flex h-9 cursor-pointer items-center whitespace-nowrap rounded-lg px-3 text-sm font-medium tracking-[-0.28px] transition-colors lg:h-12 lg:px-3 lg:text-base lg:tracking-[-0.32px] ${colorClass}`}
                >
                  {link.label}
                </BannerLink>
              </li>
            )
          })}
        </ul>
        {overflow.start || overflow.end ? (
          <>
            <button
              type="button"
              onClick={() => scrollLinks('back')}
              disabled={!overflow.start}
              aria-label="Previous links"
              className={scrollButtonClass}
            >
              <ArrowLeftSLineIcon className="size-5 rtl:-scale-x-100" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollLinks('forward')}
              disabled={!overflow.end}
              aria-label="More links"
              className={scrollButtonClass}
            >
              <ArrowRightSLineIcon className="size-5 rtl:-scale-x-100" aria-hidden />
            </button>
          </>
        ) : null}
      </div>
    </nav>
  )
}
