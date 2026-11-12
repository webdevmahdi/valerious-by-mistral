import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch'
import { clearCart } from '../store/slices/cartSlice'
import { api } from '../services/api'
import { formatPrice, generateOrderNumber } from '../lib/format'
import { freeShippingThreshold } from '../data/content'
import { analytics } from '../lib/analytics'
import type { Order, PaymentMethod } from '../types'
import { Button } from '../components/ui/Button'
import { TextField, SelectField, TextArea } from '../components/ui/Field'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { ArtImage } from '../components/ui/ArtImage'

const addressSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name.'),
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'Enter a valid Bangladeshi mobile number (e.g. 01712345678).'),
  email: z.string().email('Enter a valid email address.'),
  line1: z.string().min(5, 'Enter your street address.'),
  city: z.string().min(2, 'Enter your city.'),
  postcode: z.string().min(4, 'Enter a valid postcode.'),
  country: z.enum(['Bangladesh']),
})

type Step = 1 | 2 | 3 | 4

interface AddressForm {
  fullName: string
  phone: string
  email: string
  line1: string
  line2: string
  city: string
  postcode: string
  country: 'Bangladesh'
}

const PAYMENT_METHODS: { id: PaymentMethod; name: string; note: string }[] = [
  { id: 'cod', name: 'Cash on Delivery', note: 'Pay when your order arrives. Available nationwide.' },
  { id: 'bkash', name: 'bKash', note: 'You will confirm the payment on the next screen.' },
  { id: 'nagad', name: 'Nagad', note: 'You will confirm the payment on the next screen.' },
  { id: 'card', name: 'Card (SSLCommerz)', note: 'Visa, Mastercard, AmEx — processed on a secure page.' },
]

export function Checkout() {
  const { items, couponCode, discount } = useAppSelector((s) => s.cart)
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>(1)
  const [placing, setPlacing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState<AddressForm>({
    fullName: user?.name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    line1: user?.addresses[0]?.line1 ?? '',
    line2: user?.addresses[0]?.line2 ?? '',
    city: user?.addresses[0]?.city ?? 'Dhaka',
    postcode: user?.addresses[0]?.postcode ?? '1213',
    country: 'Bangladesh',
  })
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [notes, setNotes] = useState('')

  const set = (key: keyof AddressForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0)
  const insideDhaka = form.city.trim().toLowerCase() === 'dhaka'
  const shippingCost = useMemo(() => {
    if (subtotal >= freeShippingThreshold) return 0
    if (shippingMethod === 'express' && insideDhaka) return 13000
    return insideDhaka ? 6000 : 12000
  }, [subtotal, shippingMethod, insideDhaka])
  const total = Math.max(0, subtotal - discount) + shippingCost

  const validateAddress = (): boolean => {
    const result = addressSchema.safeParse(form)
    if (!result.success) {
      const map: Record<string, string> = {}
      for (const issue of result.error.issues) {
        map[String(issue.path[0])] = issue.message
      }
      setErrors(map)
      return false
    }
    setErrors({})
    return true
  }

  const placeOrder = async () => {
    setPlacing(true)
    const order: Order = {
      orderNumber: generateOrderNumber(),
      createdAt: new Date().toISOString(),
      customer: { name: form.fullName, email: form.email, phone: form.phone },
      items: items.map((i) => ({
        productId: i.productId,
        productName: i.name,
        sku: i.sku,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        unitPrice: i.price,
        total: i.price * i.quantity,
        seed: i.seed,
      })),
      shippingAddress: {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        postcode: form.postcode,
        country: form.country,
      },
      shippingMethod,
      shippingCost,
      subtotal,
      discount,
      couponCode: couponCode ?? undefined,
      total,
      currency: 'BDT',
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'PENDING' : 'PAID',
      orderStatus: 'CONFIRMED',
      timeline: [
        { status: 'PENDING', at: new Date().toISOString(), note: 'Order received' },
        { status: 'CONFIRMED', at: new Date().toISOString(), note: paymentMethod === 'cod' ? 'Cash on delivery order confirmed' : 'Payment received' },
      ],
      estimatedDelivery: new Date(Date.now() + (insideDhaka ? 2 : 4) * 86400000).toISOString(),
      notes: notes.trim() || undefined,
    }
    analytics.track('purchase', { value: total / 100, orderId: order.orderNumber, method: paymentMethod })
    await api.orders.create(order)
    dispatch(clearCart())
    setPlacing(false)
    navigate(`/order-confirmation/${order.orderNumber}`, { replace: true })
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl">Your cart is empty.</h1>
        <p className="mt-3 text-sm text-stone">Add a piece before checking out.</p>
        <Button className="mt-8" onClick={() => navigate('/shop')}>Shop the Collection</Button>
      </div>
    )
  }

  const steps = ['Address', 'Delivery', 'Payment', 'Review']

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <Breadcrumb items={[{ name: 'Home', to: '/' }, { name: 'Cart', to: '/cart' }, { name: 'Checkout' }]} />
      <h1 className="mt-6 font-display text-3xl font-light md:text-4xl">Checkout</h1>
      <p className="mt-2 text-sm text-stone">Guest checkout — no account required.</p>

      <ol className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.16em]" aria-label="Checkout progress">
        {steps.map((label, i) => (
          <li key={label} className={i + 1 === step ? 'text-ink' : i + 1 < step ? 'text-moss' : 'text-stone'}>
            <span aria-hidden="true">{i + 1 < step ? '✓ ' : `${i + 1}. `}</span>{label}
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          {step === 1 && (
            <div className="fade-in space-y-5">
              <h2 className="font-display text-xl">Contact & Delivery Address</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField label="Full name" value={form.fullName} onChange={set('fullName')} error={errors.fullName} autoComplete="name" />
                <TextField label="Phone" value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="01712345678" autoComplete="tel" inputMode="numeric" />
              </div>
              <TextField label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
              <TextField label="Street address" value={form.line1} onChange={set('line1')} error={errors.line1} autoComplete="address-line1" />
              <TextField label="Apartment, floor, etc. (optional)" value={form.line2} onChange={set('line2')} autoComplete="address-line2" />
              <div className="grid gap-5 sm:grid-cols-3">
                <TextField label="City" value={form.city} onChange={set('city')} error={errors.city} autoComplete="address-level2" />
                <TextField label="Postcode" value={form.postcode} onChange={set('postcode')} error={errors.postcode} autoComplete="postal-code" />
                <SelectField label="Country" value="Bangladesh" disabled>
                  <option>Bangladesh</option>
                </SelectField>
              </div>
              <Button size="lg" onClick={() => validateAddress() && setStep(2)}>Continue to Delivery</Button>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in space-y-5">
              <h2 className="font-display text-xl">Delivery Method</h2>
              <div className="space-y-3">
                <label className={`flex cursor-pointer items-start justify-between gap-4 border p-5 ${shippingMethod === 'standard' ? 'border-ink bg-paper' : 'border-line'}`}>
                  <span>
                    <span className="block text-sm font-medium">Standard</span>
                    <span className="mt-1 block text-xs text-stone">{insideDhaka ? '1–2 working days' : '2–4 working days'} · tracked courier</span>
                  </span>
                  <span className="text-sm">{subtotal >= freeShippingThreshold ? 'Free' : formatPrice(insideDhaka ? 6000 : 12000)}</span>
                  <input type="radio" name="shipping" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} className="mt-1" />
                </label>
                <label className={`flex cursor-pointer items-start justify-between gap-4 border p-5 ${shippingMethod === 'express' ? 'border-ink bg-paper' : 'border-line'} ${!insideDhaka ? 'opacity-50' : ''}`}>
                  <span>
                    <span className="block text-sm font-medium">Express</span>
                    <span className="mt-1 block text-xs text-stone">{insideDhaka ? 'Same-day / next working day' : 'Express is available inside Dhaka only'}</span>
                  </span>
                  <span className="text-sm">{insideDhaka ? formatPrice(13000) : '—'}</span>
                  <input type="radio" name="shipping" checked={shippingMethod === 'express'} disabled={!insideDhaka} onChange={() => setShippingMethod('express')} className="mt-1" />
                </label>
              </div>
              <TextArea label="Delivery notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Landmarks, preferred time window…" />
              <div className="flex gap-3">
                <Button variant="outline" size="lg" onClick={() => setStep(1)}>Back</Button>
                <Button size="lg" onClick={() => setStep(3)}>Continue to Payment</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="fade-in space-y-5">
              <h2 className="font-display text-xl">Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m.id} className={`flex cursor-pointer items-start gap-4 border p-5 ${paymentMethod === m.id ? 'border-ink bg-paper' : 'border-line'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === m.id} onChange={() => { setPaymentMethod(m.id); analytics.track('add_payment_info', { method: m.id }) }} className="mt-1" />
                    <span>
                      <span className="block text-sm font-medium">{m.name}</span>
                      <span className="mt-1 block text-xs text-stone">{m.note}</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="lg" onClick={() => setStep(2)}>Back</Button>
                <Button size="lg" onClick={() => setStep(4)}>Review Order</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="fade-in space-y-6">
              <h2 className="font-display text-xl">Review & Place Order</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border border-line p-5 text-sm">
                  <p className="eyebrow mb-2 text-stone">Deliver to</p>
                  <p>{form.fullName}</p>
                  <p className="text-ink-soft">{form.line1}{form.line2 ? `, ${form.line2}` : ''}</p>
                  <p className="text-ink-soft">{form.city} {form.postcode}, {form.country}</p>
                  <p className="mt-1 text-ink-soft">{form.phone} · {form.email}</p>
                </div>
                <div className="border border-line p-5 text-sm">
                  <p className="eyebrow mb-2 text-stone">Delivery & payment</p>
                  <p>{shippingMethod === 'express' ? 'Express' : 'Standard'} delivery</p>
                  <p className="mt-1 text-ink-soft">{PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.name}</p>
                </div>
              </div>
              <ul className="divide-y divide-line border-y border-line">
                {items.map((i) => (
                  <li key={`${i.productId}-${i.size}-${i.color}`} className="flex items-center gap-4 py-3 text-sm">
                    <ArtImage seed={i.seed} category={i.category} variant={0} label="" className="h-16 w-14 shrink-0" />
                    <span className="flex-1">{i.name} <span className="text-stone">· {i.color} · {i.size} × {i.quantity}</span></span>
                    <span>{formatPrice(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <Button variant="outline" size="lg" onClick={() => setStep(3)}>Back</Button>
                <Button size="lg" onClick={placeOrder} disabled={placing}>
                  {placing ? 'Placing order…' : `Place Order — ${formatPrice(total)}`}
                </Button>
              </div>
              {paymentMethod !== 'cod' && (
                <p className="text-xs text-stone">
                  You will confirm the {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.name} payment after placing the order.
                </p>
              )}
            </div>
          )}
        </div>

        <aside className="h-fit border border-line bg-paper p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-lg">Order Summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <li key={`${i.productId}-${i.size}-${i.color}`} className="flex justify-between gap-3">
                <span className="text-ink-soft">{i.name} <span className="text-stone">× {i.quantity}</span></span>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
            {discount > 0 && (
              <div className="flex justify-between text-moss"><dt>Discount ({couponCode})</dt><dd>−{formatPrice(discount)}</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-stone">Delivery</dt><dd>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</dd></div>
            <div className="flex justify-between border-t border-line pt-3"><dt>Total</dt><dd className="font-display text-lg">{formatPrice(total)}</dd></div>
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-stone">
            Prices include VAT. Your total is verified server-side before payment. Need help? <a href="#/contact" className="underline underline-offset-2">Contact us</a>
          </p>
        </aside>
      </div>
    </div>
  )
}
