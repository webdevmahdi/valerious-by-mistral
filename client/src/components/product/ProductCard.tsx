import { Link } from 'react-router-dom'
import type { Product } from '../../types'
import { formatPrice, skuFor } from '../../lib/format'
import { analytics } from '../../lib/analytics'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { addItem, openDrawer } from '../../store/slices/cartSlice'
import { setQuickView } from '../../store/slices/uiSlice'
import { ArtImage } from '../ui/ArtImage'
import { Price } from '../ui/Price'
import { Rating } from '../ui/Rating'

export function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch()
  const firstInStock = product.sizes.find((s) => s.inStock)?.size ?? product.sizes[0]?.size

  const quickAdd = () => {
    if (!firstInStock) return
    dispatch(
      addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        size: firstInStock,
        color: product.colors[0].name,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        quantity: 1,
        sku: skuFor(product.skuPrefix, product.colors[0].name, firstInStock),
        seed: product.id,
        category: product.category,
      }),
    )
    dispatch(openDrawer())
    analytics.track('add_to_cart', { productId: product.id, productName: product.name, price: product.price / 100 })
  }

  return (
    <article className="group/card">
      <div className="relative">
        <Link to={`/product/${product.slug}`} className="block" aria-label={`View ${product.name}`}
          onClick={() => analytics.track('select_product', { productId: product.id, productName: product.name })}>
          <ArtImage seed={product.id} category={product.category} variant={0} label={`${product.name} — front view`} className="aspect-[4/5] w-full" />
          <ArtImage seed={product.id} category={product.category} variant={1} label={`${product.name} — alternate view`} className="card-img-alt absolute inset-0 aspect-[4/5] w-full" />
        </Link>
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.isNew && <span className="eyebrow bg-paper px-2.5 py-1 text-ink">New</span>}
          {product.compareAtPrice && <span className="eyebrow bg-bronze px-2.5 py-1 text-bone">Sale</span>}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100">
          <button
            onClick={quickAdd}
            disabled={!firstInStock}
            className="flex-1 bg-ink py-2.5 text-[11px] uppercase tracking-[0.18em] text-bone hover:bg-ink-soft disabled:opacity-40"
          >
            Quick Add
          </button>
          <button
            onClick={() => dispatch(setQuickView(product.slug))}
            className="flex-1 border border-ink bg-paper/95 py-2.5 text-[11px] uppercase tracking-[0.18em] text-ink hover:bg-bone"
          >
            Quick View
          </button>
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg leading-snug">
            <Link to={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
          <Price price={product.price} compareAtPrice={product.compareAtPrice} className="shrink-0 text-sm" />
        </div>
        <div className="flex items-center justify-between">
          <Rating value={product.rating} count={product.reviewCount} />
          <span className="flex items-center gap-1.5" aria-label={`${product.colors.length} colours`}>
            {product.colors.map((c) => (
              <span key={c.name} className="h-3 w-3 rounded-full border border-line" style={{ backgroundColor: c.hex }} title={c.name} />
            ))}
          </span>
        </div>
        <p className="text-xs text-stone">
          {formatPrice(product.price)} · {product.colors.length} colours · {product.sizes.filter((s) => s.inStock).length} sizes in stock
        </p>
      </div>
    </article>
  )
}
