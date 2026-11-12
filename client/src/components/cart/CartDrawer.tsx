import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch'
import { closeDrawer, removeItem, setQuantity } from '../../store/slices/cartSlice'
import { formatPrice } from '../../lib/format'
import { freeShippingThreshold } from '../../data/content'
import { ArtImage } from '../ui/ArtImage'
import { QuantitySelector } from '../ui/QuantitySelector'
import { LinkButton } from '../ui/Button'
import { analytics } from '../../lib/analytics'

export function CartDrawer() {
  const open = useAppSelector((s) => s.cart.drawerOpen)
  const items = useAppSelector((s) => s.cart.items)
  const dispatch = useAppDispatch()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0)
  const close = () => dispatch(closeDrawer())
  const remaining = freeShippingThreshold - subtotal

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Cart">
      <div className="absolute inset-0 bg-night/60" onClick={close} aria-hidden="true" />
      <aside className="drawer-in absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-bone">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-xl">Your Cart ({items.reduce((n, i) => n + i.quantity, 0)})</h2>
          <button onClick={close} aria-label="Close cart" className="flex h-9 w-9 items-center justify-center hover:opacity-70">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" /></svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-display text-xl">Your cart is empty.</p>
            <p className="text-sm text-stone">Considered essentials are waiting.</p>
            <LinkButton to="/shop" onClick={close}>Shop the Collection</LinkButton>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((item) => (
                <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 py-4">
                  <Link to={`/product/${item.slug}`} onClick={close}>
                    <ArtImage seed={item.seed} category={item.category} variant={0} label={item.name} className="h-24 w-20 shrink-0" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link to={`/product/${item.slug}`} onClick={close} className="font-display leading-snug">{item.name}</Link>
                      <span className="text-sm">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                    <p className="text-xs text-stone">{item.color} · Size {item.size}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
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
            <div className="border-t border-line px-6 py-4">
              {remaining > 0 ? (
                <p className="mb-3 text-xs text-stone">
                  {formatPrice(remaining)} away from free delivery.
                </p>
              ) : (
                <p className="mb-3 text-xs text-moss">Your order qualifies for free delivery.</p>
              )}
              <div className="mb-3 flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="mb-4 text-xs text-stone">Delivery and coupons calculated at checkout.</p>
              <LinkButton to="/checkout" className="w-full" onClick={() => { analytics.track('begin_checkout', { value: subtotal / 100 }); close() }}>
                Checkout
              </LinkButton>
              <Link to="/cart" onClick={close} className="mt-3 block text-center text-xs uppercase tracking-[0.18em] text-stone hover:text-ink">
                View full cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
