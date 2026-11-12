const BDT = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
})

export function formatPrice(minorUnits: number): string {
  return BDT.format(Math.round(minorUnits / 100))
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function generateOrderNumber(): string {
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase()
  const year = new Date().getFullYear()
  return `VAL-${year}-${rnd}`
}

export function skuFor(prefix: string, color: string, size: string): string {
  return `${prefix}-${color.slice(0, 3).toUpperCase()}-${size.toUpperCase()}`
}
