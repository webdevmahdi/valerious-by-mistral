import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { loginSuccess } from '../../store/slices/authSlice'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/Field'

const credentialsSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

const DEMO_EMAIL = 'admin@valerius.example'
const DEMO_PASSWORD = 'valerius-admin'

export function AdminLogin() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = credentialsSchema.safeParse({ email, password })
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      setErrors({ email: fieldErrors.email?.[0], password: fieldErrors.password?.[0] })
      return
    }
    if (parsed.data.email !== DEMO_EMAIL || parsed.data.password !== DEMO_PASSWORD) {
      setErrors({ form: 'These credentials do not match an administrator account.' })
      return
    }
    dispatch(
      loginSuccess({
        id: 'admin-1',
        name: 'Store Administrator',
        email: DEMO_EMAIL,
        role: 'ADMIN',
        addresses: [],
        marketingConsent: false,
        createdAt: new Date().toISOString(),
      }),
    )
    navigate('/admin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bone px-6">
      <div className="w-full max-w-md">
        <p className="eyebrow text-stone">Valerius Back Office</p>
        <h1 className="mt-3 font-display text-3xl text-ink">Administrator sign in</h1>
        <p className="mt-2 text-sm text-stone">
          Restricted area. All actions are authorised and audited server-side.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-5 border border-line bg-paper p-6" noValidate>
          <TextField
            label="Email"
            type="email"
            value={email}
            error={errors.email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            error={errors.password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {errors.form && <p className="text-sm text-clay">{errors.form}</p>}
          <Button type="submit" className="w-full">Sign in</Button>
          <div className="border-t border-line pt-4 text-xs leading-relaxed text-stone">
            <p className="font-sans uppercase tracking-[0.18em] text-ink">Demo credentials</p>
            <p className="mt-2 font-mono">{DEMO_EMAIL}</p>
            <p className="font-mono">{DEMO_PASSWORD}</p>
          </div>
        </form>
      </div>
    </div>
  )
}
