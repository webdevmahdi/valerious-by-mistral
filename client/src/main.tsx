import type { CartItem } from './types'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store'
import { hydrateCart } from './store/slices/cartSlice'
import { hydrateWishlist } from './store/slices/wishlistSlice'
import { hydrateRecentlyViewed } from './store/slices/recentlyViewedSlice'
import { hydrateAuth } from './store/slices/authSlice'
import { App } from './App'
import './styles/index.css'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const savedCart = readJson<{ items:CartItem[]; couponCode: string | null }>('valerius.cart.v1', { items: [], couponCode: null })
store.dispatch(hydrateCart({ items: savedCart.items ?? [], couponCode: savedCart.couponCode ?? null }))
store.dispatch(hydrateWishlist(readJson('valerius.wishlist.v1', [])))
store.dispatch(hydrateRecentlyViewed(readJson('valerius.recent.v1', [])))
store.dispatch(hydrateAuth(readJson('valerius.user.v1', null)))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
