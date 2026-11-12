import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CartItem } from '../../types'

interface CartState {
  items: CartItem[]
  drawerOpen: boolean
  couponCode: string | null
  discount: number
}

const initialState: CartState = {
  items: [],
  drawerOpen: false,
  couponCode: null,
  discount: 0,
}

function persist(state: CartState): void {
  localStorage.setItem('valerius.cart.v1', JSON.stringify({ items: state.items, couponCode: state.couponCode }))
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateCart(state, action: PayloadAction<Pick<CartState, 'items' | 'couponCode'>>) {
      state.items = action.payload.items
      state.couponCode = action.payload.couponCode
    },
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId && i.size === action.payload.size && i.color === action.payload.color,
      )
      if (existing) {
        existing.quantity = Math.min(10, existing.quantity + action.payload.quantity)
      } else {
        state.items.push(action.payload)
      }
      persist(state)
    },
    removeItem(state, action: PayloadAction<{ productId: string; size: string; color: string }>) {
      state.items = state.items.filter(
        (i) => !(i.productId === action.payload.productId && i.size === action.payload.size && i.color === action.payload.color),
      )
      persist(state)
    },
    setQuantity(state, action: PayloadAction<{ productId: string; size: string; color: string; quantity: number }>) {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId && i.size === action.payload.size && i.color === action.payload.color,
      )
      if (item) {
        item.quantity = Math.max(1, Math.min(10, action.payload.quantity))
      }
      persist(state)
    },
    clearCart(state) {
      state.items = []
      state.couponCode = null
      state.discount = 0
      persist(state)
    },
    openDrawer(state) {
      state.drawerOpen = true
    },
    closeDrawer(state) {
      state.drawerOpen = false
    },
    applyCoupon(state, action: PayloadAction<{ code: string; discount: number }>) {
      state.couponCode = action.payload.code
      state.discount = action.payload.discount
      persist(state)
    },
    clearCoupon(state) {
      state.couponCode = null
      state.discount = 0
      persist(state)
    },
  },
})

export const {
  hydrateCart,
  addItem,
  removeItem,
  setQuantity,
  clearCart,
  openDrawer,
  closeDrawer,
  applyCoupon,
  clearCoupon,
} = cartSlice.actions

export default cartSlice.reducer
