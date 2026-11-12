import { Link, useParams } from 'react-router-dom'
import { editorial } from '../data/catalog'
import { useSeo, breadcrumbSchema } from '../lib/seo'
import { useReveal } from '../lib/useReveal'
import { formatDate } from '../lib/format'
import { ArtImage } from '../components/ui/ArtImage'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { NotFound } from './NotFound'

export function EditorialArticle() {
  const { slug } = useParams()
  const article = editorial.find((a) => a.slug === slug)
  const ref = useReveal<HTMLElement>()

  useSeo({
    title: article ? article.title : 'Editorial',
    description: article ? article.excerpt : '',
    path: `/editorial/${slug}`,
    type: 'article',
    jsonLd: article
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.excerpt,
            author: { '@type': 'Organization', name: article.author },
            datePublished: article.date,
            publisher: { '@type': 'Organization', name: 'Valerius' },
          },
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Editorial', path: '/editorial' },
            { name: article.title, path: `/editorial/${article.slug}` },
          ]),
        ]
      : undefined,
  })

  if (!article) return <NotFound />
  const others = editorial.filter((a) => a.slug !== article.slug).slice(0, 2)

  return (
    <article ref={ref} className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ name: 'Home', to: '/' }, { name: 'Editorial', to: '/editorial' }, { name: article.category }]} />
      <p className="eyebrow mt-8 text-bronze">{article.category}</p>
      <h1 className="mt-4 font-display text-3xl font-light leading-tight md:text-5xl">{article.title}</h1>
      <p className="mt-4 text-xs text-stone">
        {article.author} · {formatDate(article.date)} · {article.readingTime} min read
      </p>
      <ArtImage seed={`editorial-${article.slug}`} label={article.title} className="reveal-img mt-10 aspect-[16/9] w-full" />
      <div className="mt-10 space-y-8 text-[16px] leading-[1.8] text-ink-soft">
        {article.body.map((block, i) => (
          <section key={i} className="reveal">
            {block.heading && <h2 className="mb-3 font-display text-2xl text-ink">{block.heading}</h2>}
            {block.paragraphs.map((p, j) => (
              <p key={j} className="mb-4">{p}</p>
            ))}
            {block.pullQuote && (
              <blockquote className="my-8 border-l-2 border-bronze pl-6 font-display text-2xl font-light leading-snug text-ink">
                {block.pullQuote}
              </blockquote>
            )}
          </section>
        ))}
      </div>

      <div className="mt-14 border-t border-line pt-8">
        <p className="eyebrow mb-5 text-stone">Share</p>
        <div className="flex gap-4 text-sm">
          <a href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" className="underline underline-offset-4">Facebook</a>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}`} target="_blank" rel="noreferrer" className="underline underline-offset-4">X / Twitter</a>
        </div>
      </div>

      <div className="mt-14">
        <p className="eyebrow mb-6 text-stone">Keep reading</p>
        <div className="grid gap-8 sm:grid-cols-2">
          {others.map((a) => (
            <Link key={a.slug} to={`/editorial/${a.slug}`} className="group/card">
              <ArtImage seed={`editorial-${a.slug}`} label={a.title} className="aspect-[3/2] w-full" />
              <h2 className="mt-3 font-display text-lg leading-snug">{a.title}</h2>
            </Link>
          ))}
        </div>
      </div>
    </article>
  )
}
