import { configureStore } from '@reduxjs/toolkit'
import cart from './slices/cartSlice'
import wishlist from './slices/wishlistSlice'
import recentlyViewed from './slices/recentlyViewedSlice'
import ui from './slices/uiSlice'
import auth from './slices/authSlice'

export const store = configureStore({
  reducer: { cart, wishlist, recentlyViewed, ui, auth },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
