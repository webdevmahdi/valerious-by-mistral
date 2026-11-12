import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface RecentlyViewedState {
  ids: string[]
}

const initialState: RecentlyViewedState = { ids: [] }

const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState,
  reducers: {
    hydrateRecentlyViewed(state, action: PayloadAction<string[]>) {
      state.ids = action.payload
    },
    trackView(state, action: PayloadAction<string>) {
      state.ids = [action.payload, ...state.ids.filter((id) => id !== action.payload)].slice(0, 8)
      localStorage.setItem('valerius.recent.v1', JSON.stringify(state.ids))
    },
    clearRecentlyViewed(state) {
      state.ids = []
      localStorage.removeItem('valerius.recent.v1')
    },
  },
})

export const { hydrateRecentlyViewed, trackView, clearRecentlyViewed } = recentlyViewedSlice.actions
export default recentlyViewedSlice.reducer
