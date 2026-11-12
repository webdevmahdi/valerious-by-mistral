import { Dialog } from '../ui/Dialog'
import { sizeChart } from '../../data/catalog'

export function SizeGuide({ open, onClose, isPants }: { open: boolean; onClose: () => void; isPants?: boolean }) {
  const chart = isPants ? sizeChart.pants : sizeChart.tops
  return (
    <Dialog open={open} onClose={onClose} labelledBy="size-guide-title" size="md">
      <div className="p-6 md:p-8">
        <h3 id="size-guide-title" className="font-display text-2xl">Size Guide</h3>
        <p className="mt-2 text-sm text-ink-soft">
          Garment measurements, taken flat. Allow 1–2 cm tolerance. When between sizes on oversized fits, size down.
        </p>
        <table className="mt-5 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink text-left">
              {chart.columns.map((c) => (
                <th key={c} className="eyebrow py-3 pr-4 text-stone">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chart.rows.map((row) => (
              <tr key={row[0]} className="border-b border-line">
                {row.map((cell, i) => (
                  <td key={i} className="py-3 pr-4">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Dialog>
  )
}
