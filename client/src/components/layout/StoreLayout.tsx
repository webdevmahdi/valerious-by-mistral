import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileNav } from './MobileNav'
import { SearchOverlay } from './SearchOverlay'
import { Toast } from './Toast'
import { WhatsAppDock } from './WhatsAppDock'
import { CartDrawer } from '../cart/CartDrawer'
import { QuickView } from '../product/QuickView'
import { analytics } from '../../lib/analytics'

export function StoreLayout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
    analytics.track('page_view', { path: location.pathname })
  }, [location])

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:bg-ink focus:px-4 focus:py-2 focus:text-bone">
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <SearchOverlay />
      <CartDrawer />
      <QuickView />
      <Toast />
      <WhatsAppDock />
    </div>
  )
}
