import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { popularSearches } from '../../data/catalog'
import type { Category, Collection, Product } from '../../types'
import { analytics } from '../../lib/analytics'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch'
import { setSearchOpen } from '../../store/slices/uiSlice'
import { ArtImage } from '../ui/ArtImage'
import { formatPrice } from '../../lib/format'

export function SearchOverlay() {
  const open = useAppSelector((s) => s.ui.searchOpen)
  const dispatch = useAppDispatch()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<{ products: Product[]; categories: Category[]; collections: Collection[] }>({ products: [], categories: [], collections: [] })
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    let live = true
    api.search.suggest(q).then((r) => live && setResults(r))
    return () => {
      live = false
    }
  }, [q])

  if (!open) return null

  const close = () => dispatch(setSearchOpen(false))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!q.trim()) return
    analytics.track('search', { query: q.trim() })
    close()
    navigate(`/shop?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 bg-night/60" onClick={close} aria-hidden="true" />
      <div className="fade-in absolute inset-x-0 top-0 max-h-[85vh] overflow-y-auto bg-bone">
        <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
          <form onSubmit={submit} role="search">
            <div className="flex items-center gap-4 border-b border-ink pb-3">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="8" cy="8" r="6" /><path d="M12.5 12.5L17 17" /></svg>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products, categories, collections…"
                className="w-full bg-transparent font-display text-xl outline-none placeholder:text-stone"
                aria-label="Search query"
              />
              <button type="button" onClick={close} aria-label="Close search" className="text-stone hover:text-ink">
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" /></svg>
              </button>
            </div>
          </form>

          {!q && (
            <div className="mt-6">
              <p className="eyebrow mb-3 text-stone">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((s) => (
                  <button key={s} onClick={() => setQ(s)} className="border border-line px-3 py-1.5 text-sm hover:border-ink">{s}</button>
                ))}
              </div>
            </div>
          )}

          {q && (
            <div className="mt-6 space-y-6">
              {(results.categories.length > 0 || results.collections.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {results.categories.map((c) => (
                    <Link key={c.slug} to={`/shop/${c.slug}`} onClick={close} className="border border-line px-3 py-1.5 text-sm hover:border-ink">
                      Category · {c.name}
                    </Link>
                  ))}
                  {results.collections.map((c) => (
                    <Link key={c.slug} to={`/collections/${c.slug}`} onClick={close} className="border border-line px-3 py-1.5 text-sm hover:border-ink">
                      Collection · {c.name}
                    </Link>
                  ))}
                </div>
              )}
              {results.products.length > 0 ? (
                <ul className="divide-y divide-line">
                  {results.products.map((p) => (
                    <li key={p.id}>
                      <Link to={`/product/${p.slug}`} onClick={close} className="flex items-center gap-4 py-3">
                        <ArtImage seed={p.id} category={p.category} variant={0} label="" className="h-16 w-14 shrink-0" />
                        <span className="flex-1">
                          <span className="block font-display">{p.name}</span>
                          <span className="block text-xs text-stone">{p.category.replace('-', ' ')}</span>
                        </span>
                        <span className="text-sm">{formatPrice(p.price)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-ink-soft">
                  <p>No results for “{q}”. Try a different term, or explore:</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {popularSearches.map((s) => (
                      <button key={s} onClick={() => setQ(s)} className="border border-line px-3 py-1.5 text-sm hover:border-ink">{s}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
