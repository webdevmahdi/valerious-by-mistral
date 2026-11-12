interface Props {
  eyebrow?: string
  title: string
  copy?: string
  align?: 'left' | 'center'
}

export function SectionHeading({ eyebrow, title, copy, align = 'left' }: Props) {
  return (
    <div className={`reveal ${align === 'center' ? 'text-center' : ''}`}>
      {eyebrow && <p className="eyebrow mb-3 text-bronze">{eyebrow}</p>}
      <h2 className="font-display text-3xl font-light leading-tight md:text-4xl">{title}</h2>
      {copy && <p className={`mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft ${align === 'center' ? 'mx-auto' : ''}`}>{copy}</p>}
    </div>
  )
}
