import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import type { Order, OrderStatus } from '../types'
import { formatPrice, formatDateTime } from '../lib/format'
import { useSeo } from '../lib/seo'
import { Button, LinkButton } from '../components/ui/Button'
import { TextField } from '../components/ui/Field'
import { Breadcrumb } from '../components/ui/Breadcrumb'

const TRACK_FLOW: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']

const LABELS: Record<OrderStatus, string> = {
  PENDING: 'Order received',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURN_REQUESTED: 'Return requested',
  RETURNED: 'Returned',
}

export function OrderTracking() {
  const [searchParams] = useSearchParams()
  const [number, setNumber] = useState(searchParams.get('number') ?? '')
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const lookup = async (value?: string) => {
    const target = (value ?? number).trim()
    if (!target) return
    const found = await api.orders.byNumber(target)
    setSearched(true)
    if (found) {
      setOrder(found)
      setError(null)
    } else {
      setOrder(null)
      setError('No order found with this number. Check the confirmation email or SMS.')
    }
  }

  useEffect(() => {
    const prefill = searchParams.get('number')
    if (prefill) void lookup(prefill)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useSeo({
    title: 'Order Tracking',
    description: 'Track your Valerius order — from confirmation to delivery.',
    path: '/order-tracking',
  })

  const currentIndex = order ? TRACK_FLOW.indexOf(order.orderStatus) : -1
  const isCancelled = order && ['CANCELLED', 'RETURNED'].includes(order.orderStatus)

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ name: 'Home', to: '/' }, { name: 'Order Tracking' }]} />
      <h1 className="mt-6 font-display text-3xl font-light md:text-4xl">Track Your Order</h1>
      <p className="mt-3 text-sm text-ink-soft">Enter the order number from your confirmation email or SMS.</p>

      <form
        className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault()
          void lookup()
        }}
      >
        <div className="flex-1">
          <TextField label="Order number" placeholder="VAL-2025-XXXX" value={number} onChange={(e) => setNumber(e.target.value)} />
        </div>
        <Button type="submit" size="lg">Track</Button>
      </form>

      {error && <p className="mt-4 text-sm text-bronze" role="alert">{error}</p>}

      {order && (
        <div className="fade-in mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink pb-4">
            <h2 className="font-display text-2xl">{order.orderNumber}</h2>
            <p className="text-xs text-stone">Placed {formatDateTime(order.createdAt)}</p>
          </div>

          {!isCancelled ? (
            <ol className="mt-8 space-y-0">
              {TRACK_FLOW.map((status, i) => {
                const reached = i <= currentIndex
                const event = order.timeline.find((t) => t.status === status)
                return (
                  <li key={status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className={`mt-1 flex h-4 w-4 items-center justify-center rounded-full border ${reached ? 'border-ink bg-ink' : 'border-line bg-transparent'}`}>
                        {reached && <span className="h-1.5 w-1.5 rounded-full bg-bone" />}
                      </span>
                      {i < TRACK_FLOW.length - 1 && <span className={`w-px flex-1 ${reached ? 'bg-ink' : 'bg-line'}`} style={{ minHeight: 28 }} />}
                    </div>
                    <div className="pb-6">
                      <p className={`text-sm ${reached ? 'text-ink' : 'text-stone'}`}>{LABELS[status]}</p>
                      {event && <p className="text-xs text-stone">{formatDateTime(event.at)}</p>}
                    </div>
                  </li>
                )
              })}
            </ol>
          ) : (
            <p className="mt-6 border border-line bg-paper p-5 text-sm">This order is {LABELS[order.orderStatus].toLowerCase()}. Contact us if this is unexpected.</p>
          )}

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="border border-line p-5 text-sm">
              <p className="eyebrow mb-2 text-stone">Delivery</p>
              <p>{order.shippingAddress.fullName}</p>
              <p className="text-ink-soft">{order.shippingAddress.line1}, {order.shippingAddress.city} {order.shippingAddress.postcode}</p>
              {order.trackingNumber && <p className="mt-2 text-xs text-stone">Courier tracking: {order.trackingNumber}</p>}
              <p className="mt-2 text-xs text-stone">Estimated: {formatDateTime(order.estimatedDelivery)}</p>
            </div>
            <div className="border border-line p-5 text-sm">
              <p className="eyebrow mb-2 text-stone">Payment</p>
              <p>{order.paymentMethod.toUpperCase()} · {order.paymentStatus}</p>
              <p className="mt-2 text-stone">Total: {formatPrice(order.total)}</p>
              <p className="mt-2 text-xs text-stone">{order.items.reduce((n, i) => n + i.quantity, 0)} item(s)</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {order.orderStatus === 'DELIVERED' && (
              <Button variant="outline" onClick={() => api.orders.update(order.orderNumber, { orderStatus: 'RETURN_REQUESTED', timeline: [...order.timeline, { status: 'RETURN_REQUESTED', at: new Date().toISOString(), note: 'Requested by customer' }] }).then((o) => o && setOrder({ ...o }))}>
                Request Return / Exchange
              </Button>
            )}
            <LinkButton to="/contact" variant="ghost">Need help with this order?</LinkButton>
          </div>
        </div>
      )}

      {searched && !order && !error && null}
    </div>
  )
}
