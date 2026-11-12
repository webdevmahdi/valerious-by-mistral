import { useState } from 'react'
import { api } from '../../services/api'
import type { Coupon } from '../../types'
import { formatPrice, formatDate } from '../../lib/format'

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>(() => [...api.coupons.list()])
  const [notice, setNotice] = useState<string | null>(null)

  const toggle = (coupon: Coupon) => {
    api.admin.updateCoupon(coupon.code, { isActive: !coupon.isActive })
    setCoupons([...api.coupons.list()])
    setNotice(`${coupon.code} ${coupon.isActive ? 'deactivated' : 'activated'}.`)
    window.setTimeout(() => setNotice(null), 2000)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow text-stone">Promotions</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Coupons</h1>
      <p className="mt-2 text-sm text-stone">
        Validation rules run server-side at checkout; toggles here reflect the promotions API.
      </p>
      {notice && <p className="mt-4 text-xs uppercase tracking-[0.18em] text-moss">{notice}</p>}

      <div className="mt-8 overflow-x-auto border border-line bg-paper">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.18em] text-stone">
              <th className="px-5 py-3 font-normal">Code</th>
              <th className="px-5 py-3 font-normal">Discount</th>
              <th className="px-5 py-3 font-normal">Minimum order</th>
              <th className="px-5 py-3 font-normal">Expires</th>
              <th className="px-5 py-3 font-normal">State</th>
              <th className="px-5 py-3 text-right font-normal">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {coupons.map((c) => (
              <tr key={c.code}>
                <td className="px-5 py-4 font-mono text-xs text-ink">{c.code}</td>
                <td className="px-5 py-4 text-ink">
                  {c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}
                  {c.maximumDiscount ? <span className="block text-xs text-stone">cap {formatPrice(c.maximumDiscount)}</span> : null}
                </td>
                <td className="px-5 py-4 text-stone">{formatPrice(c.minimumOrder)}</td>
                <td className="px-5 py-4 text-stone">{formatDate(c.expiresAt)}</td>
                <td className="px-5 py-4">
                  <span className={c.isActive ? 'text-moss' : 'text-clay'}>{c.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => toggle(c)}
                    className="text-xs uppercase tracking-[0.18em] text-ink underline-offset-4 hover:underline"
                  >
                    {c.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
