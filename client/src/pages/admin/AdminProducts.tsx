import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import type { Product } from '../../types'
import { formatPrice } from '../../lib/format'
import { Button } from '../../components/ui/Button'

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({})
  const [savedId, setSavedId] = useState<string | null>(null)

  useEffect(() => {
    setProducts(api.products.all().concat())
  }, [])

  const refresh = () => setProducts([...api.products.all()])

  const savePrice = (product: Product) => {
    const raw = priceDrafts[product.id]
    if (raw === undefined) return
    const taka = Number(raw)
    if (!Number.isFinite(taka) || taka <= 0) return
    api.admin.updateProduct(product.id, { price: Math.round(taka * 100) })
    setSavedId(product.id)
    window.setTimeout(() => setSavedId(null), 1500)
    refresh()
  }

  const toggleFeatured = (product: Product) => {
    api.admin.updateProduct(product.id, { featured: !product.featured })
    refresh()
  }

  const toggleStatus = (product: Product) => {
    api.admin.updateProduct(product.id, { status: product.status === 'active' ? 'archived' : 'active' })
    refresh()
  }

  const toggleSize = (product: Product, size: string) => {
    const sizes = product.sizes.map((s) => (s.size === size ? { ...s, inStock: !s.inStock } : s))
    api.admin.updateProduct(product.id, { sizes })
    refresh()
  }

  return (
    <div className="mx-auto max-w-5xl">
      <p className="eyebrow text-stone">Catalogue</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Products</h1>
      <p className="mt-2 max-w-2xl text-sm text-stone">
        Pricing, visibility, and stock are enforced server-side; these controls mirror the admin API contract.
      </p>

      <div className="mt-8 space-y-4">
        {products.map((p) => (
          <article key={p.id} className="border border-line bg-paper p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <h2 className="font-display text-lg text-ink">{p.name}</h2>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone">
                  {p.category} · {p.skuPrefix} · {p.status}
                </p>
              </div>
              <p className="font-display text-lg text-ink">{formatPrice(p.price)}</p>
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-4 border-t border-line pt-4">
              <div>
                <label htmlFor={`price-${p.id}`} className="eyebrow block text-stone">Price (৳)</label>
                <input
                  id={`price-${p.id}`}
                  type="number"
                  min={1}
                  value={priceDrafts[p.id] ?? String(p.price / 100)}
                  onChange={(e) => setPriceDrafts({ ...priceDrafts, [p.id]: e.target.value })}
                  className="mt-1 w-28 border border-line bg-bone px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
                />
              </div>
              <Button size="sm" variant="outline" onClick={() => savePrice(p)}>Save price</Button>
              <Button size="sm" variant="ghost" onClick={() => toggleFeatured(p)}>
                {p.featured ? 'Remove from featured' : 'Mark featured'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toggleStatus(p)}>
                {p.status === 'active' ? 'Archive' : 'Restore'}
              </Button>
              {savedId === p.id && <span className="text-xs uppercase tracking-[0.18em] text-moss">Saved</span>}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {p.sizes.map((s) => (
                <button
                  key={s.size}
                  onClick={() => toggleSize(p, s.size)}
                  className={`border px-3 py-1 font-mono text-xs transition-colors ${
                    s.inStock ? 'border-line bg-bone text-ink hover:border-ink' : 'border-clay/40 bg-clay/10 text-clay line-through'
                  }`}
                  aria-pressed={s.inStock}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
