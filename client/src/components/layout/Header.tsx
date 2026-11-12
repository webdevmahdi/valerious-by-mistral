import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch'
import { openDrawer } from '../../store/slices/cartSlice'
import { setMobileNav, setSearchOpen } from '../../store/slices/uiSlice'
import { categories } from '../../data/catalog'

const navItems = [
  { label: 'New Arrivals', to: '/shop?sort=newest' },
  { label: 'Shop', to: '/shop' },
  { label: 'Collections', to: '/collections' },
  { label: 'Men', to: '/shop' },
  { label: 'Editorial', to: '/editorial' },
  { label: 'About', to: '/about' },
]

export function Header() {
  const dispatch = useAppDispatch()
  const cartCount = useAppSelector((s) => s.cart.items.reduce((n, i) => n + i.quantity, 0))
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        scrolled ? 'border-line bg-bone/95 backdrop-blur' : 'border-transparent bg-bone'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <button
          className="flex h-10 w-10 items-center justify-center lg:hidden"
          onClick={() => dispatch(setMobileNav(true))}
          aria-label="Open menu"
          aria-expanded={false}
        >
          <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true"><path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" /></svg>
        </button>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {navItems.slice(0, 3).map((item) => (
            <NavLink key={item.label} to={item.to} className="eyebrow text-ink-soft hover:text-ink">
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/" className="font-display text-2xl tracking-[0.28em] md:absolute md:left-1/2 md:-translate-x-1/2" aria-label="Valerius home">
          VALERIUS
        </Link>

        <div className="flex items-center gap-1 md:gap-2">
          <nav className="mr-4 hidden items-center gap-7 lg:flex" aria-label="Secondary">
            {navItems.slice(3).map((item) => (
              <NavLink key={item.label} to={item.to} className="eyebrow text-ink-soft hover:text-ink">
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button className="flex h-10 w-10 items-center justify-center" onClick={() => dispatch(setSearchOpen(true))} aria-label="Search">
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="8" cy="8" r="6" /><path d="M12.5 12.5L17 17" /></svg>
          </button>
          <Link to="/account" className="hidden h-10 w-10 items-center justify-center md:flex" aria-label="Account">
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="9" cy="5.5" r="3.5" /><path d="M2 16.5c1.2-3.4 3.9-5 7-5s5.8 1.6 7 5" /></svg>
          </Link>
          <button className="relative flex h-10 w-10 items-center justify-center" onClick={() => dispatch(openDrawer())} aria-label={`Cart, ${cartCount} items`}>
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" aria-hidden="true"><path d="M3 6h12l-1 11H4L3 6z" /><path d="M6 6V5a3 3 0 016 0v1" /></svg>
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center bg-bronze px-1 text-[10px] text-bone">{cartCount}</span>
            )}
          </button>
        </div>
      </div>

      {menuOpen && null}
      <div className="hidden border-t border-line bg-bone lg:block">
        <div className="mx-auto flex max-w-7xl gap-8 px-8 py-3">
          {categories.map((c) => (
            <Link key={c.slug} to={`/shop/${c.slug}`} className="text-xs text-stone hover:text-ink">{c.name}</Link>
          ))}
        </div>
      </div>
    </header>
  )
}
