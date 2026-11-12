import { useState } from 'react'
import { api } from '../../services/api'
import { heroContent } from '../../data/content'
import { Button } from '../../components/ui/Button'
import { TextField, TextArea } from '../../components/ui/Field'

export function AdminContent() {
  const [eyebrow, setEyebrow] = useState(heroContent.eyebrow)
  const [headline, setHeadline] = useState(heroContent.headline)
  const [copy, setCopy] = useState(heroContent.copy)
  const [saved, setSaved] = useState(false)

  const save = () => {
    api.admin.setHero({ eyebrow, headline, copy })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow text-stone">Merchandising</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Homepage content</h1>
      <p className="mt-2 text-sm text-stone">
        Edits apply to the storefront hero immediately and persist in this environment. The content API takes over once connected.
      </p>

      <form
        className="mt-8 space-y-5 border border-line bg-paper p-6"
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <TextField label="Eyebrow" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
        <TextField label="Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
        <TextArea label="Supporting copy" rows={4} value={copy} onChange={(e) => setCopy(e.target.value)} />
        <div className="flex items-center gap-4">
          <Button type="submit">Save changes</Button>
          {saved && <span className="text-xs uppercase tracking-[0.18em] text-moss">Saved</span>}
        </div>
      </form>

      <div className="mt-10 border border-line bg-bone p-8">
        <p className="eyebrow text-stone">Preview</p>
        <p className="eyebrow mt-4 text-bronze">{eyebrow}</p>
        <h2 className="mt-3 max-w-xl font-display text-4xl leading-tight text-ink">{headline}</h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-stone">{copy}</p>
      </div>
    </div>
  )
}
