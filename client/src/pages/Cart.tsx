import { useSeo } from '../lib/seo'
import { CartPageContent } from '../components/cart/CartPageContent'
import { Breadcrumb } from '../components/ui/Breadcrumb'

export function Cart() {
  useSeo({
    title: 'Cart',
    description: 'Your Valerius cart.',
    path: '/cart',
    noindex: true,
  })
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ name: 'Home', to: '/' }, { name: 'Cart' }]} />
      <h1 className="mt-6 mb-10 font-display text-3xl font-light md:text-4xl">Cart</h1>
      <CartPageContent />
    </div>
  )
}
