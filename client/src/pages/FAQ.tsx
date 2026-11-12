import { faqs } from '../data/catalog'
import { useSeo } from '../lib/seo'
import { Accordion } from '../components/ui/Accordion'
import { Breadcrumb } from '../components/ui/Breadcrumb'

export function FAQ() {
  useSeo({
    title: 'FAQ',
    description: 'Answers on ordering, payments, shipping, returns and product care at Valerius.',
    path: '/faq',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    },
  })

  const groups = [...new Set(faqs.map((f) => f.group))]

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ name: 'Home', to: '/' }, { name: 'FAQ' }]} />
      <h1 className="mt-6 font-display text-3xl font-light md:text-4xl">Frequently Asked Questions</h1>
      <div className="mt-10 space-y-12">
        {groups.map((g) => (
          <section key={g} aria-label={g}>
            <h2 className="eyebrow mb-4 text-bronze">{g}</h2>
            <Accordion items={faqs.filter((f) => f.group === g).map((f) => ({ title: f.question, content: f.answer }))} />
          </section>
        ))}
      </div>
    </div>
  )
}
