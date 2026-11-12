import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { categories, collections, editorial } from '../data/catalog'
import { heroContent } from '../data/content'
import type { Product } from '../types'
import { useSeo, organizationSchema, websiteSchema } from '../lib/seo'
import { useReveal } from '../lib/useReveal'
import { ArtImage } from '../components/ui/ArtImage'
import { LinkButton } from '../components/ui/Button'
import { ProductGrid } from '../components/product/ProductGrid'
import { SectionHeading } from '../components/ui/SectionHeading'
import { Rating } from '../components/ui/Rating'
import { formatDate } from '../lib/format'

export function Home() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const ref = useReveal<HTMLDivElement>()

  useEffect(() => {
    api.products.featured().then(setFeatured)
    api.products.newArrivals().then(setNewArrivals)
  }, [])

  useSeo({
    title: 'VALERIUS — Modern Menswear, Considered Differently',
    description: heroContent.copy,
    path: '/',
    jsonLd: [organizationSchema(), websiteSchema()],
  })

  const monsoon = collections[0]
  const reviewed = [...featured].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 3)

  return (
    <div ref={ref}>
      {/* Cinematic hero */}
      <section className="relative flex min-h-[88vh] items-end">
        <ArtImage seed="valerius-campaign-hero" label="Valerius Monsoon Edit campaign" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-night/45" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 md:px-8 md:pb-24">
          <p className="eyebrow text-bone/80">{heroContent.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-light leading-[1.1] text-bone md:text-6xl">
            {heroContent.headline}
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-bone/85">{heroContent.copy}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton to={heroContent.primaryCta.to} size="lg">{heroContent.primaryCta.label}</LinkButton>
            <LinkButton to={heroContent.secondaryCta.to} variant="light" size="lg">{heroContent.secondaryCta.label}</LinkButton>
          </div>
        </div>
      </section>

      {/* New collection — editorial split */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="reveal-img">
            <ArtImage seed="monsoon-campaign" label="Monsoon Edit campaign imagery" className="aspect-[4/5] w-full" />
          </div>
          <div className="reveal">
            <p className="eyebrow text-bronze">{monsoon.season}</p>
            <h2 className="mt-3 font-display text-3xl font-light leading-tight md:text-5xl">{monsoon.name}</h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft">{monsoon.story}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton to={`/collections/${monsoon.slug}`}>Explore the Edit</LinkButton>
              <LinkButton to="/collections" variant="outline">All Collections</LinkButton>
            </div>
            {newArrivals.length > 0 && (
              <ul className="mt-10 divide-y divide-line border-t border-line">
                {newArrivals.slice(0, 3).map((p) => (
                  <li key={p.id}>
                    <Link to={`/product/${p.slug}`} className="flex items-center justify-between py-3.5 text-sm hover:text-bronze">
                      <span>{p.name}</span>
                      <span className="text-stone">New</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-paper py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Selected Work" title="Featured this season" copy="Pieces our customers reach for most — chosen for cloth, cut and longevity." />
            <Link to="/shop" className="reveal eyebrow text-ink underline-offset-4 hover:underline">View all</Link>
          </div>
          <div className="mt-12">
            <ProductGrid products={featured} />
          </div>
        </div>
      </section>

      {/* Brand story */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div className="reveal-img order-2 lg:order-1">
            <ArtImage seed="brand-story" label="Valerius studio, fabric in progress" className="aspect-[3/4] w-full" />
          </div>
          <div className="reveal order-1 lg:order-2 lg:pt-10">
            <p className="eyebrow text-bronze">The House</p>
            <h2 className="mt-3 font-display text-3xl font-light leading-tight md:text-4xl">
              What is Valerius?
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
              A menswear house built around a single conviction: that a wardrobe of twelve honest pieces outlives a
              closet of forty impulses. We design in Dhaka, cut in limited runs, and specify fabric by weight and
              behaviour — not by marketing name.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              Every garment answers to the same question: does it earn its place? If the answer is no, it is not made.
            </p>
            <LinkButton to="/about" variant="outline" className="mt-8">Read Our Approach</LinkButton>
          </div>
        </div>
      </section>

      {/* Product demonstration — fabric & detail */}
      <section className="bg-night py-20 text-bone md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="reveal">
            <p className="eyebrow text-bone/60">In Detail</p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-light leading-tight md:text-4xl">
              Fabric you can judge. Construction you can inspect.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { seed: 'fabric-closeup', title: 'The cloth', copy: '240–480 gsm knits and wovens, specified by weight and mill.' },
              { seed: 'detail-stitch', title: 'The stitching', copy: 'Twin-needle hems, bar tacks at stress points, reinforced collars.' },
              { seed: 'movement-shot', title: 'The wear', copy: 'Cut for movement — checked on real bodies, not dress forms.' },
            ].map((item, i) => (
              <figure key={item.seed} className="reveal" style={{ transitionDelay: `${i * 90}ms` }}>
                <ArtImage seed={item.seed} label={item.title} className="aspect-[4/3] w-full" />
                <figcaption className="mt-4">
                  <p className="font-display text-lg">{item.title}</p>
                  <p className="mt-1 text-sm text-bone/70">{item.copy}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by category */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <SectionHeading eyebrow="Categories" title="Shop by category" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((c, i) => (
            <Link key={c.slug} to={`/shop/${c.slug}`} className="reveal group/card" style={{ transitionDelay: `${i * 70}ms` }}>
              <ArtImage seed={`category-${c.slug}`} category={c.slug} label={c.name} className="aspect-[3/4] w-full" />
              <p className="mt-3 font-display text-lg">{c.name}</p>
              <p className="text-xs text-stone">{c.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial preview */}
      <section className="bg-paper py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Editorial" title="From the journal" copy="Styling guides, fabric education and collection stories." />
            <Link to="/editorial" className="reveal eyebrow text-ink underline-offset-4 hover:underline">All stories</Link>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {editorial.slice(0, 3).map((a, i) => (
              <Link key={a.slug} to={`/editorial/${a.slug}`} className="reveal group/card" style={{ transitionDelay: `${i * 80}ms` }}>
                <ArtImage seed={`editorial-${a.slug}`} label={a.title} className="aspect-[3/2] w-full" />
                <p className="eyebrow mt-4 text-bronze">{a.category}</p>
                <h3 className="mt-2 font-display text-xl leading-snug">{a.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{a.excerpt}</p>
                <p className="mt-3 text-xs text-stone">{formatDate(a.date)} · {a.readingTime} min read</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof — real data only */}
      {reviewed.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <SectionHeading eyebrow="Verified Customers" title="What buyers report" copy="Ratings and reviews from verified purchases. Nothing here is written by us." />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {reviewed.map((p) => (
              <div key={p.id} className="reveal border-t border-ink pt-5">
                <Rating value={p.rating} count={p.reviewCount} size="md" />
                <p className="mt-3 font-display text-lg leading-snug">
                  <Link to={`/product/${p.slug}`} className="hover:text-bronze">{p.name}</Link>
                </p>
                {p.reviews[0] && (
                  <blockquote className="mt-3 text-sm leading-relaxed text-ink-soft">
                    “{p.reviews[0].body}”
                    <footer className="mt-2 text-xs text-stone">— {p.reviews[0].author}, verified purchase</footer>
                  </blockquote>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Community */}
      <section className="border-y border-line bg-bone-deep py-16">
        <div className="reveal mx-auto max-w-2xl px-5 text-center md:px-8">
          <p className="eyebrow text-bronze">The Circle</p>
          <h2 className="mt-3 font-display text-3xl font-light">Stay in the Valerius circle.</h2>
          <p className="mt-3 text-sm text-ink-soft">New collections, product launches and editorial — first, and quietly.</p>
          <LinkButton to="/contact" variant="outline" className="mt-6">Get in Touch</LinkButton>
        </div>
      </section>

    </div>
  )
}
