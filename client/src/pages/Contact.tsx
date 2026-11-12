import { useState } from 'react'
import { useSeo } from '../lib/seo'
import { brand } from '../data/content'
import { Button } from '../components/ui/Button'
import { TextField, TextArea } from '../components/ui/Field'
import { Breadcrumb } from '../components/ui/Breadcrumb'

export function Contact() {
  useSeo({
    title: 'Contact',
    description: 'Reach the Valerius team — product questions, orders, delivery and support via email, phone or WhatsApp.',
    path: '/contact',
  })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    if (!String(data.get('name')).trim() || !String(data.get('email')).includes('@') || !String(data.get('message')).trim()) {
      setError('Please fill in your name, a valid email, and your message.')
      return
    }
    setError(null)
    setSent(true)
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ name: 'Home', to: '/' }, { name: 'Contact' }]} />
      <h1 className="mt-6 font-display text-3xl font-light md:text-4xl">Contact</h1>
      <p className="mt-3 max-w-xl text-[15px] text-ink-soft">
        Product questions, order support, or anything else — we answer within one working day.
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-8 text-sm">
          <div>
            <p className="eyebrow mb-2 text-stone">Email</p>
            <a href={`mailto:${brand.email}`} className="underline underline-offset-4">{brand.email}</a>
          </div>
          <div>
            <p className="eyebrow mb-2 text-stone">Phone & WhatsApp</p>
            <a href={`https://wa.me/${brand.whatsapp}`} className="underline underline-offset-4">{brand.phone}</a>
            <p className="mt-1 text-xs text-stone">Fastest for order and delivery questions.</p>
          </div>
          <div>
            <p className="eyebrow mb-2 text-stone">Studio</p>
            <p className="leading-relaxed text-ink-soft">{brand.address}</p>
            <p className="mt-1 text-xs text-stone">{brand.hours}</p>
          </div>
        </div>

        {sent ? (
          <div className="fade-in border border-line bg-paper p-8">
            <p className="font-display text-xl">Message received.</p>
            <p className="mt-2 text-sm text-ink-soft">We will reply to you within one working day.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5" noValidate>
            <TextField label="Name" name="name" autoComplete="name" required />
            <TextField label="Email" name="email" type="email" autoComplete="email" required />
            <TextField label="Order number (optional)" name="order" placeholder="VAL-2025-XXXX" />
            <TextArea label="Message" name="message" required />
            {error && <p className="text-xs text-bronze" role="alert">{error}</p>}
            <Button type="submit">Send Message</Button>
          </form>
        )}
      </div>
    </div>
  )
}
