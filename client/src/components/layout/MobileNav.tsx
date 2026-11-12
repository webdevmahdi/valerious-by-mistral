import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch'
import { setMobileNav } from '../../store/slices/uiSlice'
import { categories } from '../../data/catalog'

export function MobileNav() {
  const open = useAppSelector((s) => s.ui.mobileNavOpen)
  const dispatch = useAppDispatch()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const close = () => dispatch(setMobileNav(false))

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="absolute inset-0 bg-night/60" onClick={close} aria-hidden="true" />
      <div className="drawer-in absolute inset-y-0 left-0 w-[86%] max-w-sm overflow-y-auto bg-bone p-6">
        <div className="flex items-center justify-between">
          <span className="font-display text-xl tracking-[0.28em]">VALERIUS</span>
          <button onClick={close} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" /></svg>
          </button>
        </div>
        <nav className="mt-8" aria-label="Mobile">
          <ul className="space-y-1">
            {[
              { label: 'New Arrivals', to: '/shop?sort=newest' },
              { label: 'Shop All', to: '/shop' },
              { label: 'Collections', to: '/collections' },
              { label: 'Editorial', to: '/editorial' },
              { label: 'About', to: '/about' },
              { label: 'Contact', to: '/contact' },
              { label: 'Order Tracking', to: '/order-tracking' },
              { label: 'Account', to: '/account' },
            ].map((item) => (
              <li key={item.label}>
                <Link to={item.to} onClick={close} className="block border-b border-line py-4 font-display text-xl">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="eyebrow mt-8 mb-3 text-stone">Categories</p>
          <ul className="grid grid-cols-2 gap-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link to={`/shop/${c.slug}`} onClick={close} className="block border border-line px-3 py-2 text-sm">{c.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
