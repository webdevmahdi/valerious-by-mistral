import { useState } from 'react'
import { api } from '../../services/api'
import type { Product, ProductReview } from '../../types'
import { formatDate } from '../../lib/format'
import { Rating } from '../../components/ui/Rating'

export function AdminReviews() {
  const [hidden, setHidden] = useState<string[]>(() => api.admin.hiddenReviewIds())
  const entries = api.admin.allReviews()

  const toggle = (id: string) => {
    const isHidden = hidden.includes(id)
    api.admin.setReviewHidden(id, !isHidden)
    setHidden(api.admin.hiddenReviewIds())
  }

  const visibleCount = entries.filter((e) => !hidden.includes(e.review.id)).length

  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow text-stone">Moderation</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Reviews</h1>
      <p className="mt-2 text-sm text-stone">
        {entries.length} total · {visibleCount} published. Hidden reviews are excluded from product pages and rating aggregates.
      </p>

      <div className="mt-8 space-y-4">
        {entries.map(({ product, review }: { product: Product; review: ProductReview }) => {
          const isHidden = hidden.includes(review.id)
          return (
            <article key={review.id} className={`border bg-paper p-5 ${isHidden ? 'border-clay/40' : 'border-line'}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="text-sm text-ink">
                    {review.author} <span className="text-stone">on</span>{' '}
                    <span className="font-display">{product.name}</span>
                  </p>
                  <p className="mt-1 text-xs text-stone">{formatDate(review.date)} · {review.verified ? 'Verified purchase' : 'Unverified'}</p>
                </div>
                <Rating value={review.rating} />
              </div>
              <p className="mt-3 text-sm font-medium text-ink">{review.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-stone">{review.body}</p>
              <button
                onClick={() => toggle(review.id)}
                className="mt-4 text-xs uppercase tracking-[0.18em] text-ink underline-offset-4 hover:underline"
              >
                {isHidden ? 'Publish review' : 'Hide review'}
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}
