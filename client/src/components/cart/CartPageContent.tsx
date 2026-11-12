import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch'
import { removeItem, setQuantity } from '../../store/slices/cartSlice'
import { formatPrice } from '../../lib/format'
import { freeShippingThreshold } from '../../data/content'
import { ArtImage } from '../ui/ArtImage'
import { QuantitySelector } from '../ui/QuantitySelector'
import { LinkButton, Button } from '../ui/Button'
import { TextField } from '../ui/Field'
import { api } from '../../services/api'
import { applyCoupon, clearCoupon } from '../../store/slices/cartSlice'
import { analytics } from '../../lib/analytics'
import { useState } from 'react'

export function CartPageContent() {
  const { items, couponCode, discount } = useAppSelector((s) => s.cart)
  const dispatch = useAppDispatch()
  const [code, setCode] = useState(couponCode ?? '')
  const [couponMessage, setCouponMessage] = useState<string | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)

  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0)
  const estimatedShipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 6000
  const total = Math.max(0, subtotal - discount) + estimatedShipping

  const applyCode = async () => {
    if (!code.trim()) return
    const result = await api.coupons.validate(code, subtotal)
    analytics.track('coupon_apply', { code, ok: result.ok })
    if (result.ok && result.discount !== undefined) {
      dispatch(applyCoupon({ code: code.trim().toUpperCase(), discount: result.discount }))
      setCouponMessage(result.message)
      setCouponError(null)
    } else {
      dispatch(clearCoupon())
      setCouponError(result.message)
      setCouponMessage(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <h1 className="font-display text-3xl">Your cart is empty.</h1>
        <p className="mt-3 text-sm text-stone">Everything in the shop is made in limited runs — when something speaks, it usually does not wait.</p>
        <LinkButton to="/shop" className="mt-8">Shop the Collection</LinkButton>
      </div>
    )
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
      <div>
        <ul className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-5 py-6">
              <Link to={`/product/${item.slug}`}>
                <ArtImage seed={item.seed} category={item.category} variant={0} label={item.name} className="h-32 w-26 shrink-0" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <Link to={`/product/${item.slug}`} className="font-display text-lg">{item.name}</Link>
                    <p className="mt-1 text-xs text-stone">{item.color} · Size {item.size} · {item.sku}</p>
                    <p className="mt-1 text-xs text-moss">Estimated delivery in 1–4 working days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{formatPrice(item.price * item.quantity)}</p>
                    {item.quantity > 1 && <p className="text-xs text-stone">{formatPrice(item.price)} each</p>}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <QuantitySelector
                    value={item.quantity}
                    onChange={(q) => dispatch(setQuantity({ productId: item.productId, size: item.size, color: item.color, quantity: q }))}
                  />
                  <button
                    className="text-xs text-stone underline underline-offset-2 hover:text-ink"
                    onClick={() => {
                      analytics.track('remove_from_cart', { productId: item.productId })
                      dispatch(removeItem({ productId: item.productId, size: item.size, color: item.color }))
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Link to="/shop" className="mt-6 inline-block text-xs uppercase tracking-[0.18em] text-stone underline-offset-4 hover:underline">
          Continue shopping
        </Link>
      </div>

      <aside className="h-fit border border-line bg-paper p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-xl">Order Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
          {discount > 0 && (
            <div className="flex justify-between text-moss">
              <dt>Discount ({couponCode})</dt>
              <dd>−{formatPrice(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between"><dt className="text-stone">Estimated delivery</dt><dd>{estimatedShipping === 0 ? 'Free' : formatPrice(estimatedShipping)}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-base"><dt>Total</dt><dd className="font-display text-lg">{formatPrice(total)}</dd></div>
        </dl>

        <div className="mt-5">
          <TextField
            label="Coupon code"
            placeholder="e.g. WELCOME200"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            error={couponError ?? undefined}
            hint={couponMessage ?? undefined}
          />
          <Button variant="outline" size="sm" className="mt-2 w-full" onClick={applyCode}>Apply code</Button>
        </div>

        <LinkButton to="/checkout" className="mt-5 w-full" onClick={() => analytics.track('begin_checkout', { value: total / 100 })}>
          Proceed to Checkout
        </LinkButton>
        <p className="mt-3 text-center text-xs text-stone">Secure checkout · COD, bKash, Nagad & cards</p>
      </aside>
    </div>
  )
}
