import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, type ProductQuery } from '../services/api'
import { collections } from '../data/catalog'
import type { Paginated } from '../services/api'
import type { Product } from '../types'
import { useSeo, breadcrumbSchema } from '../lib/seo'
import { useReveal } from '../lib/useReveal'
import { ProductGrid } from '../components/product/ProductGrid'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { ArtImage } from '../components/ui/ArtImage'
import { NotFound } from './NotFound'

export function CollectionDetail() {
  const { slug } = useParams()
  const collection = collections.find((c) => c.slug === slug)
  const [result, setResult] = useState<Paginated<Product> | null>(null)
  const [sort, setSort] = useState<ProductQuery['sort']>('featured')
  const ref = useReveal<HTMLDivElement>()

  useEffect(() => {
    let live = true
    api.products.list({ collection: slug, sort }).then((r) => live && setResult(r))
    return () => {
      live = false
    }
  }, [slug, sort])

  useSeo({
    title: collection ? `${collection.name} — Collection` : 'Collection',
    description: collection ? collection.description : '',
    path: `/collections/${slug}`,
    jsonLd: breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Collections', path: '/collections' },
      { name: collection?.name ?? '', path: `/collections/${slug}` },
    ]),
  })

  if (!collection) return <NotFound />
  const ref2 = ref

  return (
    <div ref={ref2}>
      <section className="relative flex min-h-[52vh] items-end">
        <ArtImage seed={`collection-hero-${collection.slug}`} label={collection.name} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-night/40" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-12 md:px-8">
          <p className="eyebrow text-bone/80">{collection.season}</p>
          <h1 className="mt-3 font-display text-4xl font-light text-bone md:text-6xl">{collection.name}</h1>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <Breadcrumb items={[{ name: 'Home', to: '/' }, { name: 'Collections', to: '/collections' }, { name: collection.name }]} />
        <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-ink-soft">{collection.story}</p>

        <div className="mt-10 flex items-center justify-between">
          <p className="text-xs text-stone" aria-live="polite">{result?.pagination.total ?? 0} pieces in this edit</p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as ProductQuery['sort'])}
            className="border border-line bg-paper px-3 py-2 text-xs outline-none focus:border-ink"
            aria-label="Sort collection"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {result && (
          <div className="mt-8">
            <ProductGrid products={result.data} />
          </div>
        )}
      </div>
    </div>
  )
}
