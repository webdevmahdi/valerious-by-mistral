import { formatPrice } from '../../lib/format'

export function Price({ price, compareAtPrice, className = '' }: { price: number; compareAtPrice?: number; className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className={compareAtPrice ? 'text-bronze' : ''}>{formatPrice(price)}</span>
      {compareAtPrice && <span className="text-sm text-stone line-through">{formatPrice(compareAtPrice)}</span>}
    </span>
  )
}
