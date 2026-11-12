export const brand = {
  name: 'VALERIUS',
  tagline: 'Modern essentials, considered differently.',
  email: 'hello@valerius.example',
  phone: '+880 1700-000000',
  whatsapp: '+8801700000000',
  address: 'House 42, Road 11, Banani, Dhaka 1213, Bangladesh',
  hours: 'Saturday–Thursday, 10:00–19:00 (BST)',
  social: [
    { name: 'Instagram', href: 'https://instagram.com/valerius' },
    { name: 'Facebook', href: 'https://facebook.com/valerius' },
    { name: 'TikTok', href: 'https://tiktok.com/@valerius' },
  ],
}

const defaultHero = {
  eyebrow: 'Monsoon Edit — Now Live',
  headline: 'Modern essentials, considered differently.',
  copy: 'Heavyweight cottons, honest construction, and a palette drawn from the city we design in. Made in limited runs, priced without theatre.',
  primaryCta: { label: 'Explore the Collection', to: '/collections/monsoon-edit-25' },
  secondaryCta: { label: 'Shop All', to: '/shop' },
}

export const heroContent = (() => {
  try {
    const raw = localStorage.getItem('valerius.hero.v1')
    if (!raw) return defaultHero
    const saved = JSON.parse(raw) as Partial<typeof defaultHero>
    return { ...defaultHero, ...saved }
  } catch {
    return defaultHero
  }
})()

export const shippingTiers = [
  { zone: 'Inside Dhaka', standard: '৳60', express: '৳130', time: '1–2 working days' },
  { zone: 'Outside Dhaka', standard: '৳120', express: '—', time: '2–4 working days' },
]

export const freeShippingThreshold = 500000
