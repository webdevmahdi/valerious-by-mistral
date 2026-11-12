import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import type { Order, Product } from '../../types'
import { formatPrice, formatDate } from '../../lib/format'

interface Metrics {
  revenue: number
  orderCount: number
  unitsSold: number
  aov: number
  cancelled: number
  returnRequested: number
}

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    api.orders.list().then(setOrders)
    setProducts(api.products.all())
  }, [])

  const fulfilled = orders.filter((o) => o.orderStatus !== 'CANCELLED')
  const revenue = fulfilled.reduce((sum, o) => sum + o.total, 0)
  const unitsSold = fulfilled.reduce((sum, o) => sum + o.items.reduce((n, i) => n + i.quantity, 0), 0)
  const metrics: Metrics = {
    revenue,
    orderCount: orders.length,
    unitsSold,
    aov: fulfilled.length > 0 ? Math.round(revenue / fulfilled.length) : 0,
    cancelled: orders.filter((o) => o.orderStatus === 'CANCELLED').length,
    returnRequested: orders.filter((o) => o.orderStatus === 'RETURN_REQUESTED' || o.orderStatus === 'RETURNED').length,
  }

  const topProducts = [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 5)
  const lowStock = products.flatMap((p) =>
    p.sizes.filter((s) => !s.inStock).map((s) => ({ product: p, size: s.size })),
  )

  const stats = [
    { label: 'Revenue', value: formatPrice(metrics.revenue) },
    { label: 'Orders', value: String(metrics.orderCount) },
    { label: 'Avg. order value', value: formatPrice(metrics.aov) },
    { label: 'Units sold', value: String(metrics.unitsSold) },
    { label: 'Cancelled', value: String(metrics.cancelled) },
    { label: 'Returns', value: String(metrics.returnRequested) },
  ]

  return (
    <div className="mx-auto max-w-5xl">
      <p className="eyebrow text-stone">Overview</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Dashboard</h1>

      <dl className="mt-8 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-paper px-5 py-6">
            <dt className="eyebrow text-stone">{s.label}</dt>
            <dd className="mt-2 font-display text-2xl text-ink">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="top-products">
          <h2 id="top-products" className="font-display text-xl text-ink">Top products</h2>
          <ul className="mt-4 divide-y divide-line border border-line bg-paper">
            {topProducts.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="text-ink">
                  <span className="mr-3 font-mono text-xs text-stone">{String(i + 1).padStart(2, '0')}</span>
                  {p.name}
                </span>
                <span className="text-stone">{p.soldCount} sold</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="low-stock">
          <h2 id="low-stock" className="font-display text-xl text-ink">Out-of-stock sizes</h2>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-stone">Every size is in stock.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line border border-line bg-paper">
              {lowStock.slice(0, 8).map(({ product, size }) => (
                <li key={`${product.id}-${size}`} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="text-ink">{product.name}</span>
                  <span className="font-mono text-xs text-clay">size {size}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-12" aria-labelledby="recent-orders">
        <div className="flex items-baseline justify-between">
          <h2 id="recent-orders" className="font-display text-xl text-ink">Recent orders</h2>
          <Link to="/admin/orders" className="text-xs uppercase tracking-[0.18em] text-stone underline-offset-4 hover:underline">
            Manage orders
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-stone">No orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto border border-line bg-paper">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-[0.18em] text-stone">
                  <th className="px-5 py-3 font-normal">Order</th>
                  <th className="px-5 py-3 font-normal">Customer</th>
                  <th className="px-5 py-3 font-normal">Date</th>
                  <th className="px-5 py-3 font-normal">Status</th>
                  <th className="px-5 py-3 text-right font-normal">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.orderNumber}>
                    <td className="px-5 py-3 font-mono text-xs text-ink">{o.orderNumber}</td>
                    <td className="px-5 py-3 text-ink">{o.customer.name}</td>
                    <td className="px-5 py-3 text-stone">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-3 text-stone">{o.orderStatus.replace(/_/g, ' ').toLowerCase()}</td>
                    <td className="px-5 py-3 text-right text-ink">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
