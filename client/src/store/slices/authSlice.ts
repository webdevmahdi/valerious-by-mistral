import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Address, UserAccount } from '../../types'

interface AuthState {
  user: UserAccount | null
}

const initialState: AuthState = { user: null }

function persist(user: UserAccount | null): void {
  if (user) {
    localStorage.setItem('valerius.user.v1', JSON.stringify(user))
  } else {
    localStorage.removeItem('valerius.user.v1')
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateAuth(state, action: PayloadAction<UserAccount | null>) {
      state.user = action.payload
    },
    loginSuccess(state, action: PayloadAction<UserAccount>) {
      state.user = action.payload
      persist(action.payload)
    },
    registerSuccess(state, action: PayloadAction<UserAccount>) {
      state.user = action.payload
      persist(action.payload)
    },
    logout(state) {
      state.user = null
      persist(null)
    },
    updateProfile(state, action: PayloadAction<Partial<UserAccount>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        persist(state.user)
      }
    },
    saveAddress(state, action: PayloadAction<Address>) {
      if (state.user) {
        const addresses = [...state.user.addresses]
        const idx = addresses.findIndex((a) => a.id === action.payload.id)
        if (idx >= 0) addresses[idx] = action.payload
        else addresses.push(action.payload)
        state.user = { ...state.user, addresses }
        persist(state.user)
      }
    },
    removeAddress(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user = { ...state.user, addresses: state.user.addresses.filter((a) => a.id !== action.payload) }
        persist(state.user)
      }
    },
  },
})

export const { hydrateAuth, loginSuccess, registerSuccess, logout, updateProfile, saveAddress, removeAddress } =
  authSlice.actions
export default authSlice.reducer
