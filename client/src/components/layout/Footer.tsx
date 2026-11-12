import { Link } from 'react-router-dom'
import { useState } from 'react'
import { brand } from '../../data/content'
import { categories } from '../../data/catalog'

export function Footer() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.includes('@')) setDone(true)
  }

  return (
    <footer className="mt-24 border-t border-line bg-bone-deep">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl tracking-[0.28em]">VALERIUS</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">{brand.tagline} Designed in Dhaka, made in limited runs.</p>
            <div className="mt-6">
              <p className="eyebrow mb-3 text-stone">Stay in the Valerius circle</p>
              {done ? (
                <p className="text-sm text-moss">Welcome. Look for us in your inbox.</p>
              ) : (
                <form onSubmit={subscribe} className="flex max-w-xs" aria-label="Newsletter subscription">
                  <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-ink"
                  />
                  <button type="submit" className="bg-ink px-4 text-xs uppercase tracking-[0.18em] text-bone hover:bg-ink-soft">
                    Join
                  </button>
                </form>
              )}
              <p className="mt-2 text-[11px] text-stone">New collections, launches and editorial. No noise.</p>
            </div>
          </div>

          <nav aria-label="Shop">
            <p className="eyebrow mb-4 text-stone">Shop</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/shop?sort=newest" className="hover:underline">New Arrivals</Link></li>
              {categories.map((c) => (
                <li key={c.slug}><Link to={`/shop/${c.slug}`} className="hover:underline">{c.name}</Link></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Help">
            <p className="eyebrow mb-4 text-stone">Help</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/contact" className="hover:underline">Contact</Link></li>
              <li><Link to="/faq" className="hover:underline">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:underline">Shipping</Link></li>
              <li><Link to="/returns" className="hover:underline">Returns & Exchange</Link></li>
              <li><Link to="/order-tracking" className="hover:underline">Order Tracking</Link></li>
            </ul>
          </nav>

          <nav aria-label="Company">
            <p className="eyebrow mb-4 text-stone">Company</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:underline">About</Link></li>
              <li><Link to="/editorial" className="hover:underline">Editorial</Link></li>
              <li><Link to="/collections" className="hover:underline">Collections</Link></li>
            </ul>
            <p className="eyebrow mb-3 mt-8 text-stone">Follow</p>
            <ul className="space-y-2.5 text-sm">
              {brand.social.map((s) => (
                <li key={s.name}><a href={s.href} target="_blank" rel="noreferrer" className="hover:underline">{s.name}</a></li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-line pt-6 text-xs text-stone md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Valerius. All rights reserved.</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-5">
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="hover:underline">Terms & Conditions</Link>
            <Link to="/returns" className="hover:underline">Return Policy</Link>
            <Link to="/shipping" className="hover:underline">Shipping Policy</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
