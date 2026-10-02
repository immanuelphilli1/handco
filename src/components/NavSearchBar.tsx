import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CloseCircleFillIcon from 'remixicon-react/CloseCircleFillIcon'
import SearchLineIcon from 'remixicon-react/SearchLineIcon'
import { resolveAssetUrl } from '../api/mappers'
import { useCatalog } from '../context/CatalogContext'
import { getSearchPath } from '../data/shopRoutes'
import { useSearchSuggestions } from '../hooks/useProductSearch'

type NavSearchBarProps = {
  variant: 'desktop' | 'mobile'
  inputClassName: string
  buttonClassName: string
  buttonLabelClassName: string
}

export function NavSearchBar({
  variant,
  inputClassName,
  buttonClassName,
  buttonLabelClassName,
}: NavSearchBarProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { allProducts } = useCatalog()
  const { suggestions, isLoading } = useSearchSuggestions(query, allProducts)

  // Having text in the field is itself proof of intent, so the list opens on
  // typing alone. Gating on `onFocus` as well would keep it closed whenever
  // focus arrives without the React event (programmatic focus, or focus restored
  // by the browser on reload); `isDismissed` is what closes it again, and is
  // reset from the change handler so a new keystroke always reopens the list.
  const [isDismissed, setIsDismissed] = useState(false)
  const isOpen = query.trim().length >= 2 && !isDismissed

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setIsDismissed(false)
  }

  // Dismiss the suggestion list when focus or a pointer leaves the bar. Both
  // signals are needed: pointer alone misses keyboard-only dismissal, and focus
  // alone fires mid-type on some browsers where the input loses focus briefly.
  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (!containerRef.current?.contains(target)) setIsDismissed(true)
    }

    const handleFocusOut = (event: FocusEvent) => {
      const nextTarget = event.relatedTarget
      // A null relatedTarget means focus left the document entirely.
      if (nextTarget && containerRef.current?.contains(nextTarget as Node)) return
      setIsDismissed(true)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('focusout', handleFocusOut)
    }
  }, [isOpen])

  const submitSearch = (term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return

    setIsDismissed(true)
    inputRef.current?.blur()
    navigate(getSearchPath(trimmed))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter always runs the full search rather than jumping to the highlighted
    // suggestion, so it lands on the same "See all results" destination the
    // dropdown offers. Picking a single product stays an explicit click.
    if (event.key === 'Enter') {
      event.preventDefault()
      submitSearch(query)
      return
    }

    if (event.key === 'Escape') {
      setIsDismissed(true)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          submitSearch(query)
        }}
        className="flex w-full items-center gap-2 rounded-full border border-border-secondary bg-bg-primary p-1"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
          <SearchLineIcon className="size-5 shrink-0 text-text-tertiary" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={variant === 'desktop' ? 'Search product' : 'Search'}
            aria-label="Search product"
            autoComplete="off"
            className={`min-w-0 flex-1 bg-transparent text-base font-medium tracking-[-0.32px] text-text-primary outline-none placeholder:text-text-tertiary ${inputClassName}`}
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                handleQueryChange('')
                inputRef.current?.focus()
              }}
              aria-label="Clear search"
              className="flex size-5 shrink-0 cursor-pointer items-center justify-center"
            >
              <CloseCircleFillIcon className="size-5 text-text-tertiary" aria-hidden />
            </button>
          ) : null}
        </div>
        <button type="submit" className={buttonClassName} aria-label="Search">
          <SearchLineIcon className="size-5 text-text-inverse" aria-hidden />
          {buttonLabelClassName ? (
            <span className={buttonLabelClassName}>Search</span>
          ) : null}
        </button>
      </form>

      {isOpen ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-[12px] border border-border-primary bg-bg-primary shadow-lg">
          {isLoading ? (
            <p className="px-4 py-3 text-sm text-text-secondary">Searching...</p>
          ) : suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-text-secondary">
              No matches for &ldquo;{query.trim()}&rdquo;
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {suggestions.map((suggestion) => (
                <li key={suggestion.rid ?? suggestion.name}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDismissed(true)
                      if (suggestion.rid) {
                        navigate(`/products/${suggestion.rid}`)
                      } else {
                        submitSearch(suggestion.name)
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left hover:bg-bg-secondary"
                  >
                    <img
                      alt=""
                      className="size-10 shrink-0 rounded-[8px] border border-border-primary object-cover"
                      src={suggestion.imageUrl ?? resolveAssetUrl(suggestion.image)}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium tracking-[-0.28px] text-text-primary">
                      {suggestion.name}
                    </span>
                  </button>
                </li>
              ))}
              <li className="border-t border-border-primary">
                <button
                  type="button"
                  onClick={() => submitSearch(query)}
                  className="w-full cursor-pointer px-3 py-3 text-left text-sm font-medium tracking-[-0.28px] text-primary-orange"
                >
                  See all results for &ldquo;{query.trim()}&rdquo;
                </button>
              </li>
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}
