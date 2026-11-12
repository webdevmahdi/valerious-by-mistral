import { useState } from 'react'

export function Accordion({ items }: { items: { title: string; content: React.ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="flex w-full items-center justify-between py-5 text-left"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="font-display text-lg">{item.title}</span>
            <span aria-hidden="true" className="text-lg text-stone">{open === i ? '−' : '+'}</span>
          </button>
          {open === i && <div className="fade-in pb-6 text-[15px] leading-relaxed text-ink-soft">{item.content}</div>}
        </div>
      ))}
    </div>
  )
}
