import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api, type ProductQuery } from '../services/api'
import { categories, collections } from '../data/catalog'
import type { Paginated, } from '../services/api'
import type { Product } from '../types'
import { useSeo, breadcrumbSchema } from '../lib/seo'
import { useReveal } from '../lib/useReveal'
import { analytics } from '../lib/analytics'
import { ProductGrid } from '../components/product/ProductGrid'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { Button } from '../components/ui/Button'
import { Dialog } from '../components/ui/Dialog'

const SORTS: { value: NonNullable<ProductQuery['sort']>; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'best_selling', label: 'Best Selling' },
  { value: 'rating', label: 'Highest Rated' },
]

const PRICE_BANDS = [
  { label: 'Under ৳1,200', min: 0, max: 120000 },
  { label: '৳1,200 – ৳2,500', min: 120000, max: 250000 },
  { label: '৳2,500 – ৳3,500', min: 250000, max: 350000 },
  { label: 'Over ৳3,500', min: 350000, max: undefined },
]

const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36']
const ALL_COLORS = ['Ink', 'Bone', 'Moss', 'Sand', 'Clay', 'Olive', 'Stone', 'Slate', 'Charcoal', 'Indigo', 'Cloud', 'Slate Blue', 'Deep Moss', 'Washed Black', 'Rust']

export function Shop() {
  const { category: categoryParam } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [result, setResult] = useState<Paginated<Product> | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const ref = useReveal<HTMLDivElement>()

  const category = categories.find((c) => c.slug === categoryParam)
  const q = searchParams.get('q') ?? undefined
  const sort = (searchParams.get('sort') as ProductQuery['sort']) ?? 'featured'
  const page = Number(searchParams.get('page') ?? '1')
  const activeSizes = searchParams.get('sizes')?.split(',').filter(Boolean) ?? []
  const activeColors = searchParams.get('colors')?.split(',').filter(Boolean) ?? []
  const band = searchParams.get('band')
  const inStockOnly = searchParams.get('stock') === '1'
  const activeCollection = searchParams.get('collection') ?? undefined

  const query = useMemo<ProductQuery>(() => {
    const selectedBand = PRICE_BANDS.find((b) => b.label === band)
    return {
      category: category?.slug,
      collection: activeCollection,
      q,
      sizes: activeSizes,
      colors: activeColors,
      priceMin: selectedBand?.min,
      priceMax: selectedBand?.max,
      availability: inStockOnly || undefined,
      sort,
      page,
      limit: 12,
    }
  }, [category, activeCollection, q, activeSizes.join(','), activeColors.join(','), band, inStockOnly, sort, page])

  useEffect(() => {
    let live = true
    api.products.list(query).then((r) => live && setResult(r))
    return () => {
      live = false
    }
  }, [query])

  useSeo({
    title: category ? `${category.name} — Shop` : q ? `Search: ${q}` : 'Shop All',
    description: category ? category.description : 'Browse all Valerius pieces — t-shirts, shirts, pants, hoodies and jackets, made in limited runs.',
    path: category ? `/shop/${category.slug}` : '/shop',
    jsonLd: breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Shop', path: '/shop' },
      ...(category ? [{ name: category.name, path: `/shop/${category.slug}` }] : []),
    ]),
  })

  const updateParams = (mutate: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams)
    mutate(next)
    if (!next.get('page') || next.get('page') === '1') next.delete('page')
    setSearchParams(next, { replace: false })
  }

  const toggleFilter = (key: string, value: string) => {
    analytics.track('filter_use', { filter: key, value })
    updateParams((p) => {
      const list = (p.get(key)?.split(',').filter(Boolean) ?? [])
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
      if (next.length) p.set(key, next.join(','))
      else p.delete(key)
    })
  }

  const activeFilterCount = activeSizes.length + activeColors.length + (band ? 1 : 0) + (inStockOnly ? 1 : 0) + (activeCollection ? 1 : 0)

  const filterPanel = (
    <div className="space-y-8">
      {!category && (
        <fieldset>
          <legend className="eyebrow mb-3 text-stone">Category</legend>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop" className={!categoryParam ? 'text-ink underline underline-offset-4' : 'text-ink-soft hover:text-ink'}>All</Link></li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link to={`/shop/${c.slug}`} className={categoryParam === c.slug ? 'text-ink underline underline-offset-4' : 'text-ink-soft hover:text-ink'}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      <fieldset>
        <legend className="eyebrow mb-3 text-stone">Collection</legend>
        <ul className="space-y-2 text-sm">
          <li>
            <button className={!activeCollection ? 'text-ink underline underline-offset-4' : 'text-ink-soft hover:text-ink'} onClick={() => updateParams((p) => p.delete('collection'))}>
              All
            </button>
          </li>
          {collections.map((c) => (
            <li key={c.slug}>
              <button
                className={activeCollection === c.slug ? 'text-ink underline underline-offset-4' : 'text-ink-soft hover:text-ink'}
                onClick={() => updateParams((p) => (activeCollection === c.slug ? p.delete('collection') : p.set('collection', c.slug)))}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3 text-stone">Price</legend>
        <ul className="space-y-2 text-sm">
          <li>
            <button className={!band ? 'text-ink underline underline-offset-4' : 'text-ink-soft hover:text-ink'} onClick={() => updateParams((p) => p.delete('band'))}>
              Any price
            </button>
          </li>
          {PRICE_BANDS.map((b) => (
            <li key={b.label}>
              <button
                className={band === b.label ? 'text-ink underline underline-offset-4' : 'text-ink-soft hover:text-ink'}
                onClick={() => updateParams((p) => (band === b.label ? p.delete('band') : p.set('band', b.label)))}
              >
                {b.label}
              </button>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3 text-stone">Size</legend>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((s) => (
            <button
              key={s}
              aria-pressed={activeSizes.includes(s)}
              onClick={() => toggleFilter('sizes', s)}
              className={`min-w-10 border px-2.5 py-1.5 text-sm ${activeSizes.includes(s) ? 'border-ink bg-ink text-bone' : 'border-line hover:border-ink'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3 text-stone">Colour</legend>
        <div className="flex flex-wrap gap-2">
          {ALL_COLORS.map((c) => (
            <button
              key={c}
              aria-pressed={activeColors.includes(c)}
              onClick={() => toggleFilter('colors', c)}
              className={`border px-2.5 py-1.5 text-xs ${activeColors.includes(c) ? 'border-ink bg-ink text-bone' : 'border-line hover:border-ink'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3 text-stone">Availability</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={inStockOnly} onChange={() => updateParams((p) => (inStockOnly ? p.delete('stock') : p.set('stock', '1')))} />
          In stock only
        </label>
      </fieldset>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={() => setSearchParams(new URLSearchParams(searchParams.get('q') ? { q: searchParams.get('q')! } : {}), { replace: true })}>
          Clear all filters
        </Button>
      )}
    </div>
  )

  return (
    <div ref={ref} className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ name: 'Home', to: '/' }, { name: 'Shop', to: '/shop' }, ...(category ? [{ name: category.name }] : [])]} />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-light md:text-4xl">{category ? category.name : q ? `Results for “${q}”` : 'Shop All'}</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            {category ? category.description : 'Every Valerius piece, made in limited runs.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Button>
          <label className="flex items-center gap-2 text-xs text-stone">
            <span className="hidden sm:inline">Sort</span>
            <select
              value={sort}
              onChange={(e) => updateParams((p) => p.set('sort', e.target.value))}
              className="border border-line bg-paper px-3 py-2 text-xs outline-none focus:border-ink"
              aria-label="Sort products"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block" aria-label="Product filters">
          {filterPanel}
        </aside>
        <div>
          {result && (
            <>
              <p className="mb-6 text-xs text-stone" aria-live="polite">
                {result.pagination.total} piece{result.pagination.total === 1 ? '' : 's'}
                {result.pagination.pages > 1 && ` · Page ${result.pagination.page} of ${result.pagination.pages}`}
              </p>
              {result.data.length > 0 ? (
                <ProductGrid products={result.data} columns={3} />
              ) : (
                <div className="border border-line bg-paper p-10 text-center">
                  <p className="font-display text-xl">Nothing matches these filters.</p>
                  <p className="mt-2 text-sm text-stone">Try widening the price range or clearing a filter.</p>
                </div>
              )}
              {result.pagination.pages > 1 && (
                <nav className="mt-12 flex justify-center gap-2" aria-label="Pagination">
                  {Array.from({ length: result.pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateParams((params) => params.set('page', String(p)))}
                      aria-current={p === result.pagination.page ? 'page' : undefined}
                      className={`h-10 w-10 border text-sm ${p === result.pagination.page ? 'border-ink bg-ink text-bone' : 'border-line hover:border-ink'}`}
                    >
                      {p}
                    </button>
                  ))}
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={filtersOpen} onClose={() => setFiltersOpen(false)} labelledBy="filters-title" size="md">
        <h2 id="filters-title" className="font-display text-2xl">Filters</h2>
        <div className="mt-6">{filterPanel}</div>
        <Button className="mt-8 w-full" onClick={() => setFiltersOpen(false)}>Show results</Button>
      </Dialog>
    </div>
  )
}
