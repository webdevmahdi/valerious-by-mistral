import { Link } from 'react-router-dom'
import { useSeo } from '../lib/seo'
import { LinkButton } from '../components/ui/Button'

export function NotFound() {
  useSeo({ title: 'Page Not Found', description: 'The page you requested does not exist.', noindex: true })
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow text-bronze">Error 404</p>
      <h1 className="mt-4 font-display text-4xl font-light md:text-5xl">This page does not exist.</h1>
      <p className="mt-4 text-sm text-ink-soft">The link may be old, or the piece may have moved.</p>
      <div className="mt-8 flex gap-3">
        <LinkButton to="/">Home</LinkButton>
        <LinkButton to="/shop" variant="outline">Shop</LinkButton>
      </div>
      <Link to="/order-tracking" className="mt-6 text-xs uppercase tracking-[0.18em] text-stone underline-offset-4 hover:underline">
        Track an order instead
      </Link>
    </div>
  )
}
