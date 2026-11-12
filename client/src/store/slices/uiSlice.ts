import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  mobileNavOpen: boolean
  searchOpen: boolean
  quickViewSlug: string | null
  toast: string | null
}

const initialState: UiState = {
  mobileNavOpen: false,
  searchOpen: false,
  quickViewSlug: null,
  toast: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMobileNav(state, action: PayloadAction<boolean>) {
      state.mobileNavOpen = action.payload
    },
    setSearchOpen(state, action: PayloadAction<boolean>) {
      state.searchOpen = action.payload
    },
    setQuickView(state, action: PayloadAction<string | null>) {
      state.quickViewSlug = action.payload
    },
    showToast(state, action: PayloadAction<string>) {
      state.toast = action.payload
    },
    clearToast(state) {
      state.toast = null
    },
  },
})

export const { setMobileNav, setSearchOpen, setQuickView, showToast, clearToast } = uiSlice.actions
export default uiSlice.reducer
