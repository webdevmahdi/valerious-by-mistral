import { useState } from 'react'
import type { Product } from '../../types'
import { api } from '../../services/api'
import { formatDate } from '../../lib/format'
import { analytics } from '../../lib/analytics'
import { Button } from '../ui/Button'
import { Rating } from '../ui/Rating'
import { TextField, TextArea, SelectField } from '../ui/Field'

export function Reviews({ product }: { product: Product }) {
  const [reviews, setReviews] = useState(
    product.reviews.filter((r) => !api.admin.hiddenReviewIds().includes(r.id)),
  )
  const [formOpen, setFormOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [author, setAuthor] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!author.trim() || !body.trim()) {
      setError('Please add your name and a few words about the fit and fabric.')
      return
    }
    const review = await api.reviews.add(product.slug, { author: author.trim(), rating, title: title.trim() || 'Verified review', body: body.trim(), verified: true })
    setReviews((r) => [review, ...r])
    analytics.track('review_submit', { productId: product.id, rating })
    setSubmitted(true)
    setFormOpen(false)
  }

  return (
    <section aria-label="Customer reviews" className="border-t border-line pt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl">Reviews ({reviews.length})</h2>
        <Button variant="outline" size="sm" onClick={() => setFormOpen(!formOpen)}>
          Write a review
        </Button>
      </div>

      {formOpen && (
        <div className="fade-in mt-6 border border-line bg-paper p-6">
          {submitted ? (
            <p className="text-sm text-moss">Thank you — your review has been submitted and will appear after moderation.</p>
          ) : (
            <div className="space-y-4">
              <SelectField label="Rating" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} star{r > 1 ? 's' : ''}</option>
                ))}
              </SelectField>
              <TextField label="Name" value={author} onChange={(e) => setAuthor(e.target.value)} />
              <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarise your experience" />
              <TextArea label="Review" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Fit, fabric, feel — what should others know?" />
              {error && <p className="text-xs text-bronze" role="alert">{error}</p>}
              <Button onClick={submit}>Submit review</Button>
            </div>
          )}
        </div>
      )}

      {reviews.length === 0 && !formOpen && (
        <p className="mt-4 text-sm text-stone">No written reviews yet for this piece. Purchases can be reviewed from your account.</p>
      )}

      <ul className="mt-6 space-y-6">
        {reviews.map((r) => (
          <li key={r.id} className="border-b border-line pb-6">
            <div className="flex flex-wrap items-center gap-3">
              <Rating value={r.rating} />
              <h3 className="text-sm font-medium">{r.title}</h3>
              {r.verified && <span className="eyebrow border border-line px-2 py-0.5 text-moss">Verified purchase</span>}
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">{r.body}</p>
            <p className="mt-2 text-xs text-stone">{r.author} · {formatDate(r.date)} · {r.helpful} found this helpful</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
