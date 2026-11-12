interface Props {
  value: number
  onChange: (v: number) => void
  max?: number
}

export function QuantitySelector({ value, onChange, max = 10 }: Props) {
  return (
    <div className="inline-flex items-center border border-line">
      <button
        className="flex h-11 w-11 items-center justify-center text-lg hover:bg-bone disabled:opacity-30"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-10 text-center text-sm" aria-live="polite">{value}</span>
      <button
        className="flex h-11 w-11 items-center justify-center text-lg hover:bg-bone disabled:opacity-30"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
