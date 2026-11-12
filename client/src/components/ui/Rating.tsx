interface RatingProps {
  value: number
  count?: number
  size?: 'sm' | 'md'
}

export function Rating({ value, count, size = 'sm' }: RatingProps) {
  const dim = size === 'sm' ? 12 : 14
  return (
    <span className="inline-flex items-center gap-2" aria-label={`Rated ${value} out of 5${count ? ` from ${count} reviews` : ''}`}>
      <span className="inline-flex items-center gap-[2px]" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} width={dim} height={dim} viewBox="0 0 24 24" fill={i <= Math.round(value) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className="text-bronze">
            <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z" />
          </svg>
        ))}
      </span>
      <span className="text-xs text-stone">
        {value.toFixed(1)}
        {count !== undefined && ` (${count})`}
      </span>
    </span>
  )
}
