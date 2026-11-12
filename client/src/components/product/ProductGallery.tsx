import { useState } from 'react'
import type { Product } from '../../types'
import { ArtImage } from '../ui/ArtImage'
import { Dialog } from '../ui/Dialog'

export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const total = 4

  return (
    <>
      <div className="grid grid-cols-[64px_1fr] gap-3 md:grid-cols-[80px_1fr]">
        <div className="flex flex-row gap-2 md:flex-col" role="tablist" aria-label="Product images">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={active === i}
              onClick={() => setActive(i)}
              className={`w-16 md:w-20 ${active === i ? 'opacity-100 ring-1 ring-ink' : 'opacity-60'}`}
            >
              <ArtImage seed={product.id} category={product.category} variant={i} label={`View ${i + 1}`} className="aspect-[4/5] w-full" />
            </button>
          ))}
        </div>
        <button className="block w-full text-left" onClick={() => setZoomOpen(true)} aria-label="Open full-screen image viewer">
          <ArtImage seed={product.id} category={product.category} variant={active} label={`${product.name}, view ${active + 1}`} className="aspect-[4/5] w-full" />
        </button>
      </div>

      <Dialog open={zoomOpen} onClose={() => setZoomOpen(false)} labelledBy="zoom-title">
        <h3 id="zoom-title" className="sr-only">{product.name} full screen</h3>
        <ArtImage seed={product.id} category={product.category} variant={active} label={product.name} className="aspect-[4/5] max-h-[80vh] w-full" />
        <div className="flex justify-center gap-2 pb-6">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View ${i + 1}`}
              className={`h-2 w-8 ${active === i ? 'bg-ink' : 'bg-line'}`}
            />
          ))}
        </div>
      </Dialog>
    </>
  )
}
