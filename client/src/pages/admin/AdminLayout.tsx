import { NavLink, Navigate, Outlet, Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../hooks/useAppDispatch'
import { logout } from '../../store/slices/authSlice'

const nav = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/coupons', label: 'Coupons' },
  { to: '/admin/reviews', label: 'Reviews' },
  { to: '/admin/editorial', label: 'Editorial' },
  { to: '/admin/content', label: 'Homepage Content' },
]

export function AdminLayout() {
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()

  if (!user || user.role !== 'ADMIN') return <Navigate to="/admin/login" replace />

  return (
    <div className="flex min-h-screen bg-bone">
      <aside className="hidden w-60 shrink-0 flex-col bg-ink px-6 py-8 text-bone md:flex">
        <Link to="/admin" className="font-display text-xl tracking-[0.28em]">VALERIUS</Link>
        <p className="eyebrow mt-1 text-stone">Back Office</p>
        <nav className="mt-10 flex flex-col gap-1" aria-label="Admin">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-2 text-xs uppercase tracking-[0.18em] transition-colors ${
                  isActive ? 'bg-bone/10 text-bone' : 'text-bone/60 hover:text-bone'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-bone/15 pt-5 text-xs text-bone/60">
          <p>{user.name}</p>
          <button
            onClick={() => dispatch(logout())}
            className="mt-2 uppercase tracking-[0.18em] text-bone/80 underline-offset-4 hover:underline"
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-paper px-6 py-4 md:hidden">
          <Link to="/admin" className="font-display text-lg tracking-[0.28em] text-ink">VALERIUS</Link>
          <button onClick={() => dispatch(logout())} className="text-xs uppercase tracking-[0.18em] text-stone">
            Sign out
          </button>
        </header>
        <nav className="flex gap-4 overflow-x-auto border-b border-line bg-paper px-6 py-3 md:hidden" aria-label="Admin">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap text-[11px] uppercase tracking-[0.18em] ${isActive ? 'text-ink underline underline-offset-4' : 'text-stone'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 px-6 py-10 md:px-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
