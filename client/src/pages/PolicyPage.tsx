import { useSeo } from '../lib/seo'
import { Breadcrumb } from '../components/ui/Breadcrumb'

export interface PolicySection {
  heading: string
  paragraphs: string[]
  list?: string[]
}

export function PolicyPage({
  title,
  description,
  path,
  intro,
  sections,
}: {
  title: string
  description: string
  path: string
  intro: string
  sections: PolicySection[]
}) {
  useSeo({ title, description, path })
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ name: 'Home', to: '/' }, { name: title }]} />
      <h1 className="mt-6 font-display text-3xl font-light md:text-4xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{intro}</p>
      <div className="mt-10 space-y-10">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-xl">{s.heading}</h2>
            {s.paragraphs.map((p, i) => (
              <p key={i} className="mt-3 text-[15px] leading-relaxed text-ink-soft">{p}</p>
            ))}
            {s.list && (
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] text-ink-soft">
                {s.list.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
