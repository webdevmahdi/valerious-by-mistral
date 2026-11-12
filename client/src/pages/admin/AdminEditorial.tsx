import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import type { EditorialArticle } from '../../types'
import { formatDate } from '../../lib/format'

export function AdminEditorial() {
  const [articles, setArticles] = useState<EditorialArticle[]>([])

  useEffect(() => {
    api.editorial.list().then(setArticles)
  }, [])

  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow text-stone">Journal</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Editorial</h1>
      <p className="mt-2 max-w-2xl text-sm text-stone">
        Drafting and scheduling run through the editorial API; the live journal currently carries the pieces below.
      </p>

      <ul className="mt-8 divide-y divide-line border border-line bg-paper">
        {articles.map((a) => (
          <li key={a.slug} className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-4">
            <div>
              <p className="font-display text-lg text-ink">{a.title}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone">
                {a.category} · {a.author} · {a.readingTime} min read
              </p>
            </div>
            <p className="text-sm text-stone">{formatDate(a.date)}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
