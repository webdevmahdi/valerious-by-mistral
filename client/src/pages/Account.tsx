import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { api } from '../services/api'
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch'
import { loginSuccess, logout, registerSuccess, updateProfile, saveAddress, removeAddress } from '../store/slices/authSlice'
import { toggleWishlist } from '../store/slices/wishlistSlice'
import { clearRecentlyViewed } from '../store/slices/recentlyViewedSlice'
import type { Order, Product, UserAccount } from '../types'
import { useSeo } from '../lib/seo'
import { formatDate, formatDateTime, formatPrice } from '../lib/format'
import { Button, LinkButton } from '../components/ui/Button'
import { TextField } from '../components/ui/Field'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { ProductCard } from '../components/product/ProductCard'
import { ArtImage } from '../components/ui/ArtImage'

const registerSchema = z.object({
  name: z.string().min(2, 'Please enter your name.'),
  email: z.string().email('Enter a valid email address.'),
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'Enter a valid Bangladeshi mobile number.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

const USERS_KEY = 'valerius.accounts.v1'

function readAccounts(): (UserAccount & { passwordHash: string })[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function AuthPanel() {
  const dispatch = useAppDispatch()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>
    if (mode === 'register') {
      const parsed = registerSchema.safeParse(data)
      if (!parsed.success) {
        const map: Record<string, string> = {}
        parsed.error.issues.forEach((i) => (map[String(i.path[0])] = i.message))
        setErrors(map)
        return
      }
      const accounts = readAccounts()
      if (accounts.some((a) => a.email === data.email)) {
        setErrors({ email: 'An account with this email already exists.' })
        return
      }
      const user: UserAccount = {
        id: `u-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: 'CUSTOMER',
        addresses: [],
        marketingConsent: true,
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem(USERS_KEY, JSON.stringify([...accounts, { ...user, passwordHash: `hashed:${data.password}` }]))
      dispatch(registerSuccess(user))
    } else {
      const parsed = loginSchema.safeParse(data)
      if (!parsed.success) {
        const map: Record<string, string> = {}
        parsed.error.issues.forEach((i) => (map[String(i.path[0])] = i.message))
        setErrors(map)
        return
      }
      const account = readAccounts().find((a) => a.email === data.email && a.passwordHash === `hashed:${data.password}`)
      if (!account) {
        setErrors({ password: 'Email or password is incorrect.' })
        return
      }
      const { passwordHash: _hash, ...user } = account
      dispatch(loginSuccess(user))
    }
    setErrors({})
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="font-display text-3xl font-light">{mode === 'login' ? 'Sign in' : 'Create an account'}</h1>
      <p className="mt-2 text-sm text-stone">
        {mode === 'login' ? 'Welcome back.' : 'Track orders, save addresses and build a wishlist.'} Checkout never requires an account.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
        {mode === 'register' && <TextField label="Name" name="name" error={errors.name} autoComplete="name" />}
        <TextField label="Email" name="email" type="email" error={errors.email} autoComplete="email" />
        {mode === 'register' && <TextField label="Phone" name="phone" error={errors.phone} placeholder="01712345678" autoComplete="tel" />}
        <TextField label="Password" name="password" type="password" error={errors.password} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        <Button type="submit" size="lg" className="w-full">{mode === 'login' ? 'Sign In' : 'Create Account'}</Button>
      </form>

      <button
        className="mt-6 text-sm text-stone underline underline-offset-4 hover:text-ink"
        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}) }}
      >
        {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}
      </button>
    </div>
  )
}

export function Account() {
  const user = useAppSelector((s) => s.auth.user)
  const wishlistIds = useAppSelector((s) => s.wishlist.ids)
  const recentIds = useAppSelector((s) => s.recentlyViewed.ids)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile'>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [recent, setRecent] = useState<Product[]>([])

  useEffect(() => {
    if (!user) return
    api.orders.list().then(setOrders)
    if (wishlistIds.length) api.products.byIds(wishlistIds).then(setWishlist)
    else setWishlist([])
    if (recentIds.length) api.products.byIds(recentIds).then(setRecent)
    else setRecent([])
  }, [user, wishlistIds, recentIds])

  useSeo({
    title: 'My Account',
    description: 'Your Valerius account — orders, wishlist, addresses and preferences.',
    path: '/account',
    noindex: true,
  })

  if (!user) return <AuthPanel />

  const tabs = [
    { id: 'orders' as const, label: `Orders (${orders.length})` },
    { id: 'wishlist' as const, label: `Wishlist (${wishlist.length})` },
    { id: 'addresses' as const, label: 'Addresses' },
    { id: 'profile' as const, label: 'Profile' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ name: 'Home', to: '/' }, { name: 'Account' }]} />
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-display text-3xl font-light md:text-4xl">Hello, {user.name.split(' ')[0]}</h1>
        <Button variant="ghost" size="sm" onClick={() => { dispatch(logout()); navigate('/') }}>Sign out</Button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-line" role="tablist" aria-label="Account sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-xs uppercase tracking-[0.16em] ${tab === t.id ? 'border-b-2 border-ink text-ink' : 'text-stone hover:text-ink'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {tab === 'orders' && (
          orders.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-display text-xl">No orders yet.</p>
              <LinkButton to="/shop" className="mt-6">Shop the Collection</LinkButton>
            </div>
          ) : (
            <ul className="space-y-6">
              {orders.map((o) => (
                <li key={o.orderNumber} className="border border-line bg-paper">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4 text-sm">
                    <div>
                      <Link to={`/order-tracking?number=${o.orderNumber}`} className="font-medium underline-offset-4 hover:underline">{o.orderNumber}</Link>
                      <p className="text-xs text-stone">{formatDateTime(o.createdAt)}</p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.14em] text-moss">{o.orderStatus.replace(/_/g, ' ')}</p>
                    <p className="text-sm">{formatPrice(o.total)}</p>
                  </div>
                  <ul className="divide-y divide-line px-6">
                    {o.items.map((i) => (
                      <li key={i.sku} className="flex items-center gap-4 py-3 text-sm">
                        <ArtImage seed={i.seed} label="" className="h-14 w-12 shrink-0" />
                        <span className="flex-1">{i.productName} <span className="text-stone">· {i.size} × {i.quantity}</span></span>
                        <span>{formatPrice(i.total)}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )
        )}

        {tab === 'wishlist' && (
          wishlist.length === 0 ? (
            <p className="py-12 text-center text-sm text-stone">Your wishlist is empty. Save pieces while you compare.</p>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:gap-7 lg:grid-cols-4">
              {wishlist.map((p) => (
                <div key={p.id} className="relative">
                  <ProductCard product={p} />
                  <button
                    className="mt-2 text-xs text-stone underline underline-offset-2 hover:text-ink"
                    onClick={() => dispatch(toggleWishlist(p.id))}
                  >
                    Remove from wishlist
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'addresses' && (
          <div className="max-w-xl space-y-6">
            {user.addresses.map((a) => (
              <div key={a.id} className="flex items-start justify-between border border-line bg-paper p-5 text-sm">
                <div>
                  <p className="eyebrow text-stone">{a.label}</p>
                  <p className="mt-1">{a.fullName}</p>
                  <p className="text-ink-soft">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                  <p className="text-ink-soft">{a.city} {a.postcode}, {a.country}</p>
                  <p className="text-ink-soft">{a.phone}</p>
                </div>
                <button className="text-xs text-stone underline underline-offset-2 hover:text-ink" onClick={() => dispatch(removeAddress(a.id))}>Remove</button>
              </div>
            ))}
            <form
              className="space-y-4 border border-line p-5"
              onSubmit={(e) => {
                e.preventDefault()
                const data = Object.fromEntries(new FormData(e.currentTarget).entries())
                dispatch(
                  saveAddress({
                    id: `a-${Date.now()}`,
                    label: String(data.label || 'Address'),
                    fullName: String(data.fullName),
                    phone: String(data.phone),
                    line1: String(data.line1),
                    city: String(data.city),
                    postcode: String(data.postcode),
                    country: 'Bangladesh',
                  }),
                )
                e.currentTarget.reset()
              }}
            >
              <p className="font-display text-lg">Add an address</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Label" name="label" placeholder="Home" />
                <TextField label="Full name" name="fullName" required />
                <TextField label="Phone" name="phone" required />
                <TextField label="Street address" name="line1" required />
                <TextField label="City" name="city" required />
                <TextField label="Postcode" name="postcode" required />
              </div>
              <Button type="submit" size="sm">Save Address</Button>
            </form>
          </div>
        )}

        {tab === 'profile' && (
          <div className="max-w-xl space-y-8">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                const data = Object.fromEntries(new FormData(e.currentTarget).entries())
                dispatch(updateProfile({ name: String(data.name), phone: String(data.phone) }))
              }}
            >
              <p className="font-display text-lg">Profile</p>
              <TextField label="Name" name="name" defaultValue={user.name} />
              <TextField label="Email" value={user.email} disabled hint="Contact us to change your email." />
              <TextField label="Phone" name="phone" defaultValue={user.phone ?? ''} />
              <Button type="submit" size="sm">Save Changes</Button>
            </form>

            <div className="border-t border-line pt-6">
              <p className="font-display text-lg">Preferences</p>
              <label className="mt-3 flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={user.marketingConsent}
                  onChange={(e) => dispatch(updateProfile({ marketingConsent: e.target.checked }))}
                />
                Email me about new collections, launches and editorial.
              </label>
              <button
                className="mt-6 text-xs text-bronze underline underline-offset-2"
                onClick={() => { dispatch(clearRecentlyViewed()) }}
              >
                Clear recently viewed
              </button>
            </div>

            <div className="border-t border-line pt-6 text-sm text-stone">
              <p>Member since {formatDate(user.createdAt)}</p>
              <p className="mt-1">Recent activity: {recent.length} recently viewed piece(s)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

