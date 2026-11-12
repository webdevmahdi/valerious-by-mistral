import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../services/api'
import type { Order } from '../types'
import { formatPrice, formatDateTime } from '../lib/format'
import { useSeo } from '../lib/seo'
import { Button, LinkButton } from '../components/ui/Button'
import { NotFound } from './NotFound'

export function OrderConfirmation() {
  const { orderNumber } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.orders.byNumber(orderNumber ?? '').then((o) => {
      setOrder(o ?? null)
      setLoaded(true)
    })
  }, [orderNumber])

  useSeo({
    title: 'Order Confirmed',
    description: 'Your Valerius order is confirmed.',
    noindex: true,
  })

  if (!loaded) return <div className="py-32 text-center text-sm text-stone">Loading…</div>
  if (!order) return <NotFound />

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <div className="fade-in text-center">
        <p className="eyebrow text-bronze">Thank you</p>
        <h1 className="mt-4 font-display text-4xl font-light">Order confirmed.</h1>
        <p className="mt-4 text-[15px] text-ink-soft">
          Order <strong className="text-ink">{order.orderNumber}</strong> is confirmed. A confirmation has been sent to {order.customer.email}.
        </p>
        <p className="mt-2 text-sm text-stone">
          {order.paymentMethod === 'cod'
            ? 'Keep the exact amount ready for delivery.'
            : 'Payment received — no further action needed.'}{' '}
          Estimated delivery: {formatDateTime(order.estimatedDelivery)}.
        </p>
      </div>

      <div className="mt-12 border border-line bg-paper p-6 md:p-8">
        <h2 className="font-display text-xl">Order Summary</h2>
        <ul className="mt-4 divide-y divide-line text-sm">
          {order.items.map((i) => (
            <li key={i.sku} className="flex justify-between gap-4 py-3">
              <span>{i.productName} <span className="text-stone">· {i.color} · {i.size} × {i.quantity}</span></span>
              <span>{formatPrice(i.total)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between text-moss"><dt>Discount</dt><dd>−{formatPrice(order.discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-stone">Delivery</dt><dd>{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</dd></div>
          <div className="flex justify-between border-t border-line pt-3"><dt>Total</dt><dd className="font-display text-lg">{formatPrice(order.total)}</dd></div>
          <div className="flex justify-between"><dt className="text-stone">Payment</dt><dd>{order.paymentMethod.toUpperCase()} · {order.paymentStatus}</dd></div>
        </dl>
        <div className="mt-6 text-sm">
          <p className="eyebrow mb-2 text-stone">Delivering to</p>
          <p>{order.shippingAddress.fullName}</p>
          <p className="text-ink-soft">{order.shippingAddress.line1}, {order.shippingAddress.city} {order.shippingAddress.postcode}</p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <LinkButton to={`/order-tracking?number=${order.orderNumber}`}>Track This Order</LinkButton>
        <Link to="/shop" className="self-center text-xs uppercase tracking-[0.18em] text-stone underline-offset-4 hover:underline">Continue shopping</Link>
      </div>
      <p className="mt-8 text-center text-xs text-stone">Save your order number — it is your tracking reference.</p>
      <div className="mt-6 text-center">
        <Button variant="ghost" size="sm" onClick={() => window.print()}>Print receipt</Button>
      </div>
    </div>
  )
}
