type CarouselDotsProps = {
  count: number
  activeIndex: number
  onSelect?: (index: number) => void
  className?: string
}

export function CarouselDots({
  count,
  activeIndex,
  onSelect,
  className = '',
}: CarouselDotsProps) {
  return (
    <div className={`flex items-center justify-center gap-2 px-8 py-2 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect?.(index)}
          aria-label={`Go to slide ${index + 1}`}
          className={`rounded-full transition-[width,background-color] duration-300 ${
            index === activeIndex
              ? 'h-2 w-8 bg-primary-orange'
              : 'size-2 bg-bg-tertiary hover:bg-border-secondary'
          }`}
        />
      ))}
    </div>
  )
}
