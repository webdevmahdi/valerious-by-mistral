import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'
import type { Product } from '../types'
import { skuFor } from '../lib/format'
import { analytics } from '../lib/analytics'
import { useSeo, breadcrumbSchema } from '../lib/seo'
import { useReveal } from '../lib/useReveal'
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch'
import { addItem, openDrawer } from '../store/slices/cartSlice'
import { toggleWishlist } from '../store/slices/wishlistSlice'
import { trackView } from '../store/slices/recentlyViewedSlice'
import { ProductGallery } from '../components/product/ProductGallery'
import { Reviews } from '../components/product/Reviews'
import { SizeGuide } from '../components/product/SizeGuide'
import { ProductCard } from '../components/product/ProductCard'
import { Accordion } from '../components/ui/Accordion'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { Button } from '../components/ui/Button'
import { Price } from '../components/ui/Price'
import { Rating } from '../components/ui/Rating'
import { QuantitySelector } from '../components/ui/QuantitySelector'
import { Badge } from '../components/ui/Badge'
import { SITE_URL } from '../constants/site'

export function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const wishlistIds = useAppSelector((s) => s.wishlist.ids)
  const recentIds = useAppSelector((s) => s.recentlyViewed.ids)

  const [product, setProduct] = useState<Product | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const [related, setRelated] = useState<Product[]>([])
  const [completeLook, setCompleteLook] = useState<Product[]>([])
  const [recent, setRecent] = useState<Product[]>([])
  const ref = useReveal<HTMLDivElement>()

  useEffect(() => {
    let live = true
    window.scrollTo(0, 0)
    api.products.bySlug(slug ?? '').then((p) => {
      if (!live) return
      if (!p) {
        setNotFound(true)
        return
      }
      setProduct(p)
      setColor(p.colors[0].name)
      setSize(null)
      setQty(1)
      setError(null)
      analytics.track('product_view', { productId: p.id, productName: p.name, price: p.price / 100 })
      dispatch(trackView(p.id))
      api.products.related(p).then(setRelated)
      api.products.completeTheLook(p).then(setCompleteLook)
    })
    return () => {
      live = false
    }
  }, [slug, dispatch])

  useEffect(() => {
    const filtered = recentIds.filter((id) => id !== product?.id).slice(0, 4)
    if (filtered.length === 0) {
      setRecent([])
      return
    }
    api.products.byIds(filtered).then(setRecent)
  }, [recentIds, product?.id])

  useSeo({
    title: product ? product.seo.title : 'Product',
    description: product ? product.seo.description : '',
    path: `/product/${slug}`,
    type: 'product',
    jsonLd: product
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: `${SITE_URL}/og/${product.slug}.jpg`,
            description: product.seo.description,
            sku: skuFor(product.skuPrefix, product.colors[0].name, product.sizes[0].size),
            brand: { '@type': 'Brand', name: 'Valerius' },
            offers: {
              '@type': 'Offer',
              url: `${SITE_URL}/product/${product.slug}`,
              priceCurrency: 'BDT',
              price: (product.price / 100).toFixed(2),
              availability: product.sizes.some((s) => s.inStock)
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            },
            ...(product.reviewCount > 0 && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.reviewCount,
              },
            }),
          },
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: product.category.replace('-', ' '), path: `/shop/${product.category}` },
            { name: product.name, path: `/product/${product.slug}` },
          ]),
        ]
      : undefined,
  })

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center md:px-8">
        <h1 className="font-display text-3xl">This piece is no longer available.</h1>
        <p className="mt-3 text-sm text-stone">It may have sold out or been archived.</p>
        <Button className="mt-8" onClick={() => navigate('/shop')}>Back to Shop</Button>
      </div>
    )
  }

  if (!product) {
    return <div className="mx-auto max-w-7xl px-5 py-32 text-center text-sm text-stone md:px-8">Loading…</div>
  }

  const selectedSizeOption = product.sizes.find((s) => s.size === size)
  const inWishlist = wishlistIds.includes(product.id)

  const buildItem = () => ({
    productId: product.id,
    slug: product.slug,
    name: product.name,
    size: size!,
    color: color ?? product.colors[0].name,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    quantity: qty,
    sku: skuFor(product.skuPrefix, color ?? product.colors[0].name, size!),
    seed: product.id,
    category: product.category,
  })

  const handleAdd = (buyNow: boolean) => {
    if (!size) {
      setError('Please select a size.')
      return
    }
    dispatch(addItem(buildItem()))
    analytics.track('add_to_cart', { productId: product.id, productName: product.name, price: product.price / 100 })
    if (buyNow) {
      navigate('/checkout')
    } else {
      dispatch(openDrawer())
    }
  }

  return (
    <div ref={ref} className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <Breadcrumb
        items={[
          { name: 'Home', to: '/' },
          { name: 'Shop', to: '/shop' },
          { name: product.category.replace('-', ' '), to: `/shop/${product.category}` },
          { name: product.name },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <ProductGallery product={product} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-center gap-3">
            {product.isNew && <Badge>New</Badge>}
            {product.compareAtPrice && <Badge tone="bronze">Sale</Badge>}
          </div>
          <h1 className="mt-3 font-display text-3xl font-light leading-tight md:text-4xl">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} className="text-lg" />
            <Rating value={product.rating} count={product.reviewCount} />
          </div>
          <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">{product.description}</p>

          <div className="mt-7">
            <p className="eyebrow mb-2 text-stone">Colour — {color}</p>
            <div className="flex gap-2.5">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  aria-label={`Colour ${c.name}`}
                  aria-pressed={color === c.name}
                  className={`h-9 w-9 rounded-full border-2 ${color === c.name ? 'border-ink' : 'border-line'}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
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
                  className={`min-w-12 border px-3.5 py-2.5 text-sm ${size === s.size ? 'border-ink bg-ink text-bone' : 'border-line hover:border-ink'} ${!s.inStock ? 'cursor-not-allowed text-stone line-through' : ''}`}
                >
                  {s.size}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-stone">{product.modelInfo}</p>
            {error && <p className="mt-2 text-xs text-bronze" role="alert">{error}</p>}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <QuantitySelector value={qty} onChange={setQty} />
            <Button size="lg" className="flex-1" onClick={() => handleAdd(false)} disabled={!selectedSizeOption && !size}>
              Add to Cart
            </Button>
            <Button variant="outline" size="lg" onClick={() => handleAdd(true)}>Buy Now</Button>
            <Button
              variant="ghost"
              size="sm"
              aria-pressed={inWishlist}
              onClick={() => {
                dispatch(toggleWishlist(product.id))
                if (!inWishlist) analytics.track('wishlist_add', { productId: product.id })
              }}
            >
              {inWishlist ? '♥ In Wishlist' : '♡ Add to Wishlist'}
            </Button>
          </div>

          <p className="mt-4 text-xs text-stone">
            {product.sizes.some((s) => s.inStock) ? 'In stock — ships in 1–2 working days · Free delivery over ৳5,000 · 7-day returns' : 'Currently out of stock'}
          </p>

          <div className="mt-8">
            <Accordion
              items={[
                {
                  title: 'Details & Fabric',
                  content: (
                    <dl className="space-y-2">
                      {[
                        ['Fabric', product.fabric],
                        ['Composition', product.composition],
                        ['Weight', product.weight],
                        ['Fit', product.fit],
                        ['Construction', product.construction],
                        ['Origin', product.origin],
                      ].map(([k, v]) => (
                        <div key={k} className="grid grid-cols-[110px_1fr] gap-3">
                          <dt className="text-stone">{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                    </dl>
                  ),
                },
                {
                  title: 'Size & Fit',
                  content: (
                    <div className="space-y-2">
                      <p>{product.fit}. {product.modelInfo}.</p>
                      <p>Measurements vary by 1–2 cm between pieces. When between sizes on oversized fits, size down.</p>
                      <button className="text-bronze underline underline-offset-2" onClick={() => setGuideOpen(true)}>Open full size chart</button>
                    </div>
                  ),
                },
                {
                  title: 'Care',
                  content: (
                    <ul className="list-disc space-y-1 pl-5">
                      {product.care.map((c) => <li key={c}>{c}</li>)}
                    </ul>
                  ),
                },
                {
                  title: 'Delivery & Returns',
                  content: (
                    <div className="space-y-2">
                      <p>Inside Dhaka 1–2 working days (৳60), outside 2–4 working days (৳120). Free delivery over ৳5,000.</p>
                      <p>Unworn pieces with tags can be returned or exchanged within 7 days. <Link to="/returns" className="underline underline-offset-2">Full policy</Link></p>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Reviews product={product} />
      </div>

      {completeLook.length > 0 && (
        <section className="mt-20" aria-label="Complete the look">
          <h2 className="reveal font-display text-2xl">Complete the Look</h2>
          <div className="mt-8 grid grid-cols-2 gap-5 md:gap-7 lg:grid-cols-3">
            {completeLook.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-20" aria-label="Related products">
          <h2 className="reveal font-display text-2xl">You May Also Like</h2>
          <div className="mt-8 grid grid-cols-2 gap-5 md:gap-7 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mt-20" aria-label="Recently viewed">
          <h2 className="reveal font-display text-2xl">Recently Viewed</h2>
          <div className="mt-8 grid grid-cols-2 gap-5 md:gap-7 lg:grid-cols-4">
            {recent.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <SizeGuide open={guideOpen} onClose={() => setGuideOpen(false)} isPants={product.category === 'pants'} />

    </div>
  )
}
