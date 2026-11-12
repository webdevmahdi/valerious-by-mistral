import { Link } from 'react-router-dom'
import { collections } from '../data/catalog'
import { useSeo } from '../lib/seo'
import { useReveal } from '../lib/useReveal'
import { ArtImage } from '../components/ui/ArtImage'
import { Breadcrumb } from '../components/ui/Breadcrumb'

export function Collections() {
  useSeo({
    title: 'Collections',
    description: 'Valerius collections — seasonal edits and permanent essentials, each with its own point of view.',
    path: '/collections',
  })
  const ref = useReveal<HTMLDivElement>()

  return (
    <div ref={ref} className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ name: 'Home', to: '/' }, { name: 'Collections' }]} />
      <h1 className="mt-6 font-display text-3xl font-light md:text-5xl">Collections</h1>
      <p className="mt-3 max-w-2xl text-[15px] text-ink-soft">
        Seasonal edits and permanent ranges. Products live in collections without being defined by them.
      </p>
      <div className="mt-12 space-y-16">
        {collections.map((c) => (
          <Link key={c.slug} to={`/collections/${c.slug}`} className="reveal group/card grid gap-8 lg:grid-cols-2 lg:items-center">
            <ArtImage seed={`collection-${c.slug}`} label={c.name} className="aspect-[16/10] w-full" />
            <div>
              <p className="eyebrow text-bronze">{c.season}</p>
              <h2 className="mt-2 font-display text-3xl">{c.name}</h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">{c.description}</p>
              <p className="mt-6 text-xs uppercase tracking-[0.18em] text-stone underline-offset-4 group-hover:underline">View collection</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
