import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import type { Order, OrderStatus } from '../../types'
import { formatPrice, formatDateTime } from '../../lib/format'

const STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURN_REQUESTED',
  'RETURNED',
]

const NEXT_STATUSES: Record<string, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED'],
  SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: ['RETURN_REQUESTED'],
  CANCELLED: [],
  RETURN_REQUESTED: ['RETURNED'],
  RETURNED: [],
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<string>('ALL')
  const [open, setOpen] = useState<string | null>(null)
  const [trackingDraft, setTrackingDraft] = useState('')

  useEffect(() => {
    api.orders.list().then(setOrders)
  }, [])

  const reload = () => api.orders.list().then(setOrders)

  const setStatus = async (order: Order, status: OrderStatus) => {
    await api.orders.update(order.orderNumber, {
      orderStatus: status,
      timeline: [...order.timeline, { status, at: new Date().toISOString() }],
    })
    reload()
  }

  const saveTracking = async (order: Order) => {
    if (!trackingDraft.trim()) return
    await api.orders.update(order.orderNumber, { trackingNumber: trackingDraft.trim() })
    setTrackingDraft('')
    reload()
  }

  const visible = filter === 'ALL' ? orders : orders.filter((o) => o.orderStatus === filter)

  return (
    <div className="mx-auto max-w-5xl">
      <p className="eyebrow text-stone">Fulfilment</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Orders</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {['ALL', ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`border px-3 py-1 text-[11px] uppercase tracking-[0.18em] transition-colors ${
              filter === s ? 'border-ink bg-ink text-bone' : 'border-line text-stone hover:border-ink'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-8 text-sm text-stone">No orders in this view.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {visible.map((o) => (
            <article key={o.orderNumber} className="border border-line bg-paper">
              <button
                onClick={() => setOpen(open === o.orderNumber ? null : o.orderNumber)}
                className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"
                aria-expanded={open === o.orderNumber}
              >
                <span className="font-mono text-xs text-ink">{o.orderNumber}</span>
                <span className="text-sm text-ink">{o.customer.name}</span>
                <span className="text-xs uppercase tracking-[0.18em] text-stone">{o.orderStatus.replace(/_/g, ' ')}</span>
                <span className="text-sm text-ink">{formatPrice(o.total)}</span>
              </button>

              {open === o.orderNumber && (
                <div className="border-t border-line px-5 py-5">
                  <div className="grid gap-6 text-sm md:grid-cols-2">
                    <div>
                      <p className="eyebrow text-stone">Items</p>
                      <ul className="mt-2 space-y-1 text-ink">
                        {o.items.map((i) => (
                          <li key={i.sku} className="flex justify-between gap-4">
                            <span>{i.productName} · {i.color} · {i.size} × {i.quantity}</span>
                            <span>{formatPrice(i.total)}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-stone">
                        Placed {formatDateTime(o.createdAt)} · {o.paymentMethod.toUpperCase()} · {o.paymentStatus.toLowerCase()}
                      </p>
                      {o.trackingNumber && <p className="mt-1 font-mono text-xs text-ink">Tracking: {o.trackingNumber}</p>}
                    </div>
                    <div>
                      <p className="eyebrow text-stone">Shipping to</p>
                      <p className="mt-2 leading-relaxed text-ink">
                        {o.shippingAddress.fullName}<br />
                        {o.shippingAddress.line1}<br />
                        {o.shippingAddress.city} {o.shippingAddress.postcode}<br />
                        {o.shippingAddress.phone}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-end gap-4 border-t border-line pt-4">
                    <div>
                      <label htmlFor={`status-${o.orderNumber}`} className="eyebrow block text-stone">Update status</label>
                      <select
                        id={`status-${o.orderNumber}`}
                        value=""
                        onChange={(e) => {
                          const status = e.target.value as OrderStatus
                          if (status) setStatus(o, status)
                        }}
                        className="mt-1 border border-line bg-bone px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
                      >
                        <option value="">Choose…</option>
                        {(NEXT_STATUSES[o.orderStatus] ?? []).map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`tracking-${o.orderNumber}`} className="eyebrow block text-stone">Tracking number</label>
                      <input
                        id={`tracking-${o.orderNumber}`}
                        value={trackingDraft}
                        onChange={(e) => setTrackingDraft(e.target.value)}
                        placeholder="e.g. STEADFAST-88213"
                        className="mt-1 w-56 border border-line bg-bone px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => saveTracking(o)}
                      className="pb-2 text-xs uppercase tracking-[0.18em] text-ink underline-offset-4 hover:underline"
                    >
                      Save tracking
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
