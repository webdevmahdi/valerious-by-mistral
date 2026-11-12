import { Link } from 'react-router-dom'
import { editorial } from '../data/catalog'
import { useSeo } from '../lib/seo'
import { useReveal } from '../lib/useReveal'
import { formatDate } from '../lib/format'
import { ArtImage } from '../components/ui/ArtImage'
import { Breadcrumb } from '../components/ui/Breadcrumb'

export function Editorial() {
  useSeo({
    title: 'Editorial — The Valerius Journal',
    description: 'Styling guides, fabric education, collection stories and brand philosophy from the Valerius studio.',
    path: '/editorial',
  })
  const ref = useReveal<HTMLDivElement>()
  const [lead, ...rest] = [...editorial].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div ref={ref} className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ name: 'Home', to: '/' }, { name: 'Editorial' }]} />
      <h1 className="mt-6 font-display text-3xl font-light md:text-5xl">The Journal</h1>
      <p className="mt-3 max-w-2xl text-[15px] text-ink-soft">
        How we think about clothing — styling, fabric, process and the occasional strong opinion.
      </p>

      <Link to={`/editorial/${lead.slug}`} className="reveal group/card mt-12 grid gap-8 lg:grid-cols-2 lg:items-center">
        <ArtImage seed={`editorial-${lead.slug}`} label={lead.title} className="aspect-[16/10] w-full" />
        <div>
          <p className="eyebrow text-bronze">{lead.category} · Latest</p>
          <h2 className="mt-3 font-display text-3xl leading-tight">{lead.title}</h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">{lead.excerpt}</p>
          <p className="mt-4 text-xs text-stone">{lead.author} · {formatDate(lead.date)} · {lead.readingTime} min read</p>
        </div>
      </Link>

      <div className="mt-16 grid gap-10 md:grid-cols-3">
        {rest.map((a) => (
          <Link key={a.slug} to={`/editorial/${a.slug}`} className="reveal group/card">
            <ArtImage seed={`editorial-${a.slug}`} label={a.title} className="aspect-[3/2] w-full" />
            <p className="eyebrow mt-4 text-bronze">{a.category}</p>
            <h2 className="mt-2 font-display text-xl leading-snug">{a.title}</h2>
            <p className="mt-2 text-sm text-ink-soft">{a.excerpt}</p>
            <p className="mt-3 text-xs text-stone">{formatDate(a.date)} · {a.readingTime} min read</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
