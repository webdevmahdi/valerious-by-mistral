import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import type { Product } from '../../types'
import { skuFor } from '../../lib/format'
import { analytics } from '../../lib/analytics'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch'
import { addItem, openDrawer } from '../../store/slices/cartSlice'
import { setQuickView } from '../../store/slices/uiSlice'
import { Dialog } from '../ui/Dialog'
import { ArtImage } from '../ui/ArtImage'
import { Price } from '../ui/Price'
import { Rating } from '../ui/Rating'
import { Button } from '../ui/Button'
import { QuantitySelector } from '../ui/QuantitySelector'
import { SizeGuide } from './SizeGuide'

export function QuickView() {
  const slug = useAppSelector((s) => s.ui.quickViewSlug)
  const dispatch = useAppDispatch()
  const [product, setProduct] = useState<Product | null>(null)
  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)

  useEffect(() => {
    if (!slug) {
      setProduct(null)
      return
    }
    let live = true
    api.products.bySlug(slug).then((p) => {
      if (!live) return
      setProduct(p ?? null)
      setSize(null)
      setColor(p?.colors[0]?.name ?? null)
      setQty(1)
      setError(null)
    })
    return () => {
      live = false
    }
  }, [slug])

  if (!slug) return null

  const close = () => dispatch(setQuickView(null))

  const handleAdd = (buyNow: boolean) => {
    if (!product) return
    if (!size) {
      setError('Please select a size.')
      return
    }
    dispatch(
      addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        size,
        color: color ?? product.colors[0].name,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        quantity: qty,
        sku: skuFor(product.skuPrefix, color ?? product.colors[0].name, size),
        seed: product.id,
        category: product.category,
      }),
    )
    analytics.track('add_to_cart', { productId: product.id, productName: product.name, price: product.price / 100 })
    close()
    if (buyNow) {
      window.location.href = '/checkout'
    } else {
      dispatch(openDrawer())
    }
  }

  return (
    <Dialog open={!!slug} onClose={close} labelledBy="quickview-title">
      {product && (
        <div className="grid md:grid-cols-2">
          <div className="relative min-h-72">
            <ArtImage seed={product.id} category={product.category} variant={0} label={product.name} className="absolute inset-0 h-full w-full" />
          </div>
          <div className="p-6 md:p-8">
            <p className="eyebrow text-stone">{product.category.replace('-', ' ')}</p>
            <h2 id="quickview-title" className="mt-2 font-display text-2xl">{product.name}</h2>
            <div className="mt-2 flex items-center gap-4">
              <Price price={product.price} compareAtPrice={product.compareAtPrice} />
              <Rating value={product.rating} count={product.reviewCount} />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">{product.shortDescription}</p>

            <div className="mt-5">
              <p className="eyebrow mb-2 text-stone">Colour — {color}</p>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    aria-label={c.name}
                    aria-pressed={color === c.name}
                    className={`h-8 w-8 rounded-full border-2 ${color === c.name ? 'border-ink' : 'border-line'}`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="eyebrow text-stone">Size</p>
                <button className="text-xs text-stone underline underline-offset-2 hover:text-ink" onClick={() => setGuideOpen(true)}>
                  Size guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.size}
                    disabled={!s.inStock}
                    onClick={() => { setSize(s.size); setError(null) }}
                    aria-pressed={size === s.size}
                    className={`min-w-11 border px-3 py-2 text-sm ${size === s.size ? 'border-ink bg-ink text-bone' : 'border-line hover:border-ink'} ${!s.inStock ? 'cursor-not-allowed text-stone line-through' : ''}`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
              {error && <p className="mt-2 text-xs text-bronze" role="alert">{error}</p>}
            </div>

            <div className="mt-5 flex items-center gap-3">
              <QuantitySelector value={qty} onChange={setQty} />
              <Button className="flex-1" onClick={() => handleAdd(false)}>Add to Cart</Button>
            </div>
            <Button variant="outline" className="mt-2 w-full" onClick={() => handleAdd(true)}>Buy Now</Button>

            <Link to={`/product/${product.slug}`} onClick={close} className="mt-4 block text-center text-xs uppercase tracking-[0.18em] text-stone underline-offset-4 hover:underline">
              View full details
            </Link>
          </div>
        </div>
      )}
      <SizeGuide open={guideOpen} onClose={() => setGuideOpen(false)} isPants={product?.category === 'pants'} />
    </Dialog>
  )
}
