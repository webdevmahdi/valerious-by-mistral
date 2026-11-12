import { categories, collections, coupons, editorial, products } from '../data/catalog'
import type { Category, Collection, Coupon, EditorialArticle, Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus, Product, ProductReview, SizeOption } from '../types'

interface ProductOverride {
  price?: number
  status?: 'active' | 'archived'
  featured?: boolean
  sizes?: SizeOption[]
}

const OVERRIDE_KEY = 'valerius.productOverrides.v1'
const HIDDEN_REVIEWS_KEY = 'valerius.reviewsHidden.v1'
const HERO_KEY = 'valerius.hero.v1'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function applyProductOverrides(): void {
  const overrides = readJson<Record<string, ProductOverride>>(OVERRIDE_KEY, {})
  for (const product of products) {
    const override = overrides[product.id]
    if (override) Object.assign(product, override)
  }
}

function persistProductOverride(id: string, patch: ProductOverride): void {
  const overrides = readJson<Record<string, ProductOverride>>(OVERRIDE_KEY, {})
  overrides[id] = { ...overrides[id], ...patch }
  localStorage.setItem(OVERRIDE_KEY, JSON.stringify(overrides))
}

applyProductOverrides()

const LATENCY = 120

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export interface ProductQuery {
  category?: string
  collection?: string
  sizes?: string[]
  colors?: string[]
  priceMin?: number
  priceMax?: number
  availability?: boolean
  rating?: number
  q?: string
  sort?: 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'best_selling' | 'rating'
  page?: number
  limit?: number
}

export interface Paginated<T> {
  data: T[]
  pagination: { page: number; limit: number; total: number; pages: number }
}

function matchesQuery(p: Product, query: ProductQuery): boolean {
  if (p.status !== 'active') return false
  if (query.category && p.category !== query.category) return false
  if (query.collection && !p.collections.includes(query.collection)) return false
  if (query.sizes && query.sizes.length > 0 && !query.sizes.some((s) => p.sizes.some((o) => o.size === s && o.inStock))) return false
  if (query.colors && query.colors.length > 0 && !query.colors.some((c) => p.colors.some((o) => o.name.toLowerCase() === c.toLowerCase()))) return false
  if (query.priceMin !== undefined && p.price < query.priceMin) return false
  if (query.priceMax !== undefined && p.price > query.priceMax) return false
  if (query.availability && !p.sizes.some((s) => s.inStock)) return false
  if (query.rating !== undefined && p.rating < query.rating) return false
  if (query.q) {
    const q = query.q.toLowerCase()
    const haystack = [p.name, p.shortDescription, p.description, p.category, p.fabric, p.composition, ...p.collections, ...p.colors.map((c) => c.name)]
      .join(' ')
      .toLowerCase()
    if (!haystack.includes(q)) {
      const words = q.split(/\s+/).filter(Boolean)
      if (!words.every((w) => haystack.includes(w))) return false
    }
  }
  return true
}

function sortProducts(list: Product[], sort: ProductQuery['sort']): Product[] {
  const sorted = [...list]
  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.soldCount - a.soldCount)
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'best_selling':
      return sorted.sort((a, b) => b.soldCount - a.soldCount)
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'featured':
    default:
      return sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || b.soldCount - a.soldCount)
  }
}

function paginate<T>(list: T[], page = 1, limit = 24): Paginated<T> {
  const total = list.length
  const pages = Math.max(1, Math.ceil(total / limit))
  const safePage = Math.min(Math.max(1, page), pages)
  return {
    data: list.slice((safePage - 1) * limit, safePage * limit),
    pagination: { page: safePage, limit, total, pages },
  }
}

const ORDERS_KEY = 'valerius.orders.v1'

function readOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]') as Order[]
  } catch {
    return []
  }
}

function writeOrders(orders: Order[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

function seedDemoOrders(): void {
  if (localStorage.getItem(ORDERS_KEY)) return
  interface DemoOrder {
    customer: Order['customer']
    items: OrderItem[]
    daysAgo: number
    orderStatus: OrderStatus
    paymentMethod: PaymentMethod
    paymentStatus: PaymentStatus
  }

  const demo: DemoOrder[] = [
    {
      customer: { name: 'Aisha Rahman', email: 'aisha.r@example.com', phone: '01712345678' },
      items: [{ productId: 'p-atlas-tee', productName: 'Atlas Oversized Tee', sku: 'VAL-ATL-INK-L', size: 'L', color: 'Ink', quantity: 2, unitPrice: 129000, total: 258000, seed: 'p-atlas-tee-ink' }],
      orderStatus: 'DELIVERED',
      paymentMethod: 'bkash',
      paymentStatus: 'PAID',
      daysAgo: 12,
    },
    {
      customer: { name: 'Tanvir Hasan', email: 'tanvir.h@example.com', phone: '01812345678' },
      items: [{ productId: 'p-cortina-shirt', productName: 'Cortina Linen Shirt', sku: 'VAL-COR-OLI-M', size: 'M', color: 'Olive', quantity: 1, unitPrice: 245000, total: 245000, seed: 'p-cortina-shirt-olive' }],
      orderStatus: 'SHIPPED',
      paymentMethod: 'cod',
      paymentStatus: 'PENDING',
      daysAgo: 4,
    },
    {
      customer: { name: 'Nabila Karim', email: 'nabila.k@example.com', phone: '01912345678' },
      items: [
        { productId: 'p-drift-trouser', productName: 'Drift Pleated Trouser', sku: 'VAL-DRF-INK-32', size: '32', color: 'Ink', quantity: 1, unitPrice: 289000, total: 289000, seed: 'p-drift-trouser-ink' },
        { productId: 'p-ember-hoodie', productName: 'Ember Heavy Hoodie', sku: 'VAL-EMB-CHA-M', size: 'M', color: 'Charcoal', quantity: 1, unitPrice: 345000, total: 345000, seed: 'p-ember-hoodie-charcoal' },
      ],
      orderStatus: 'PROCESSING',
      paymentMethod: 'card',
      paymentStatus: 'PAID',
      daysAgo: 2,
    },
    {
      customer: { name: 'Imran Chowdhury', email: 'imran.c@example.com', phone: '01612345678' },
      items: [{ productId: 'p-slate-zip', productName: 'Slate Zip Hoodie', sku: 'VAL-SLT-SLA-XL', size: 'XL', color: 'Slate', quantity: 1, unitPrice: 325000, total: 325000, seed: 'p-slate-zip-slate' }],
      orderStatus: 'CONFIRMED',
      paymentMethod: 'nagad',
      paymentStatus: 'PAID',
      daysAgo: 1,
    },
    {
      customer: { name: 'Sadia Noor', email: 'sadia.n@example.com', phone: '01512345678' },
      items: [{ productId: 'p-vale-oxford', productName: 'Vale Oxford Shirt', sku: 'VAL-VLE-CLO-S', size: 'S', color: 'Cloud', quantity: 1, unitPrice: 215000, total: 215000, seed: 'p-vale-oxford-cloud' }],
      orderStatus: 'CANCELLED',
      paymentMethod: 'cod',
      paymentStatus: 'REFUNDED',
      daysAgo: 6,
    },
  ]
  const shippingCost = 6000
  const orders: Order[] = demo.map((d, i) => {
    const subtotal = d.items.reduce((sum, item) => sum + item.total, 0)
    const createdAt = new Date(Date.now() - d.daysAgo * 86400000).toISOString()
    const flow: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']
    const reached: OrderStatus[] = d.orderStatus === 'CANCELLED' ? ['PENDING', 'CONFIRMED', 'CANCELLED'] : flow.slice(0, flow.indexOf(d.orderStatus) + 1)
    return {
      orderNumber: `VAL-2025-${String(1041 + i).padStart(4, '0')}`,
      createdAt,
      customer: d.customer,
      items: d.items,
      shippingAddress: { fullName: d.customer.name, phone: d.customer.phone, email: d.customer.email, line1: 'House 12, Road 5', city: 'Dhaka', postcode: '1213', country: 'Bangladesh' },
      shippingMethod: 'standard',
      shippingCost,
      subtotal,
      discount: 0,
      total: subtotal + shippingCost,
      currency: 'BDT',
      paymentMethod: d.paymentMethod,
      paymentStatus: d.paymentStatus,
      orderStatus: d.orderStatus,
      timeline: reached.map((status, j) => ({ status, at: new Date(Date.now() - (d.daysAgo - j * 0.4) * 86400000).toISOString() })),
      estimatedDelivery: new Date(Date.now() + 2 * 86400000).toISOString(),
    }
  })
  writeOrders(orders)
}

seedDemoOrders()

export const api = {
  products: {
    list(query: ProductQuery = {}): Promise<Paginated<Product>> {
      const filtered = sortProducts(products.filter((p) => matchesQuery(p, query)), query.sort)
      return delay(paginate(filtered, query.page, query.limit ?? 24))
    },
    bySlug(slug: string): Promise<Product | undefined> {
      return delay(products.find((p) => p.slug === slug && p.status === 'active'))
    },
    byIds(ids: string[]): Promise<Product[]> {
      return delay(products.filter((p) => ids.includes(p.id) && p.status === 'active'))
    },
    featured(): Promise<Product[]> {
      return delay(products.filter((p) => p.featured && p.status === 'active'))
    },
    newArrivals(): Promise<Product[]> {
      return delay(products.filter((p) => p.isNew && p.status === 'active'))
    },
    related(product: Product): Promise<Product[]> {
      return delay(
        products
          .filter((p) => p.id !== product.id && p.status === 'active')
          .sort((a, b) => {
            const score = (x: Product) =>
              (x.category === product.category ? 2 : 0) +
              x.collections.filter((c) => product.collections.includes(c)).length
            return score(b) - score(a)
          })
          .slice(0, 4),
      )
    },
    completeTheLook(product: Product): Promise<Product[]> {
      const counterpart: Record<string, string[]> = {
        't-shirts': ['pants', 'jackets'],
        shirts: ['pants', 't-shirts'],
        pants: ['t-shirts', 'shirts'],
        hoodies: ['pants', 'jackets'],
        jackets: ['t-shirts', 'pants'],
      }
      const wanted = counterpart[product.category] ?? []
      return delay(products.filter((p) => wanted.includes(p.category) && p.status === 'active').slice(0, 3))
    },
    all(): Product[] {
      return products.filter((p) => p.status === 'active')
    },
  },
  categories: {
    list(): Promise<Category[]> {
      return delay(categories)
    },
    bySlug(slug: string): Promise<Category | undefined> {
      return delay(categories.find((c) => c.slug === slug))
    },
  },
  collections: {
    list(): Promise<Collection[]> {
      return delay(collections)
    },
    bySlug(slug: string): Promise<Collection | undefined> {
      return delay(collections.find((c) => c.slug === slug))
    },
  },
  editorial: {
    list(): Promise<EditorialArticle[]> {
      return delay([...editorial].sort((a, b) => b.date.localeCompare(a.date)))
    },
    bySlug(slug: string): Promise<EditorialArticle | undefined> {
      return delay(editorial.find((a) => a.slug === slug))
    },
  },
  search: {
    suggest(q: string): Promise<{ products: Product[]; categories: Category[]; collections: Collection[] }> {
      const query = q.trim().toLowerCase()
      if (!query) return delay({ products: [], categories: [], collections: [] })
      return delay({
        products: products.filter((p) => matchesQuery(p, { q: query })).slice(0, 5),
        categories: categories.filter((c) => c.name.toLowerCase().includes(query)),
        collections: collections.filter((c) => c.name.toLowerCase().includes(query)),
      })
    },
  },
  coupons: {
    validate(code: string, subtotal: number): Promise<{ ok: boolean; coupon?: Coupon; discount?: number; message: string }> {
      const coupon = coupons.find((c) => c.code === code.trim().toUpperCase() && c.isActive)
      if (!coupon) return delay({ ok: false, message: 'This code is not valid.' })
      if (new Date(coupon.expiresAt) < new Date()) return delay({ ok: false, message: 'This code has expired.' })
      if (subtotal < coupon.minimumOrder) {
        return delay({ ok: false, message: `This code requires a minimum order.` })
      }
      let discount =
        coupon.type === 'percentage' ? Math.round((subtotal * coupon.value) / 100) : coupon.value
      if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount)
      discount = Math.min(discount, subtotal)
      return delay({ ok: true, coupon, discount, message: coupon.description })
    },
    list(): Coupon[] {
      return coupons
    },
  },
  orders: {
    create(order: Order): Promise<Order> {
      const orders = readOrders()
      orders.unshift(order)
      writeOrders(orders)
      return delay(order, 300)
    },
    list(): Promise<Order[]> {
      return delay(readOrders())
    },
    byNumber(orderNumber: string): Promise<Order | undefined> {
      return delay(readOrders().find((o) => o.orderNumber.toUpperCase() === orderNumber.trim().toUpperCase()))
    },
    update(orderNumber: string, patch: Partial<Order>): Promise<Order | undefined> {
      const orders = readOrders()
      const idx = orders.findIndex((o) => o.orderNumber === orderNumber)
      if (idx === -1) return delay(undefined)
      orders[idx] = { ...orders[idx], ...patch }
      writeOrders(orders)
      return delay(orders[idx])
    },
  },
  reviews: {
    add(slug: string, review: Omit<ProductReview, 'id' | 'date' | 'helpful'>): Promise<ProductReview> {
      const product = products.find((p) => p.slug === slug)
      if (product) {
        product.reviews.unshift({ ...review, id: `r-${Date.now()}`, date: new Date().toISOString().slice(0, 10), helpful: 0 })
        product.reviewCount += 1
        product.rating = Math.round(((product.rating * (product.reviewCount - 1) + review.rating) / product.reviewCount) * 10) / 10
      }
      return delay(product!.reviews[0], 200)
    },
  },
  admin: {
    productById(id: string): Product | undefined {
      return products.find((p) => p.id === id)
    },
    updateProduct(id: string, patch: ProductOverride): Product | undefined {
      const product = products.find((p) => p.id === id)
      if (!product) return undefined
      Object.assign(product, patch)
      persistProductOverride(id, patch)
      return product
    },
    updateCoupon(code: string, patch: Partial<Coupon>): Coupon | undefined {
      const coupon = coupons.find((c) => c.code === code)
      if (!coupon) return undefined
      Object.assign(coupon, patch)
      return coupon
    },
    allReviews(): { product: Product; review: ProductReview }[] {
      return products.flatMap((p) => p.reviews.map((review) => ({ product: p, review })))
    },
    hiddenReviewIds(): string[] {
      return readJson<string[]>(HIDDEN_REVIEWS_KEY, [])
    },
    setReviewHidden(id: string, hidden: boolean): void {
      const ids = readJson<string[]>(HIDDEN_REVIEWS_KEY, [])
      const next = hidden ? [...new Set([...ids, id])] : ids.filter((x) => x !== id)
      localStorage.setItem(HIDDEN_REVIEWS_KEY, JSON.stringify(next))
    },
    hero(): { eyebrow: string; headline: string; copy: string } | null {
      return readJson<{ eyebrow: string; headline: string; copy: string } | null>(HERO_KEY, null)
    },
    setHero(hero: { eyebrow: string; headline: string; copy: string }): void {
      localStorage.setItem(HERO_KEY, JSON.stringify(hero))
    },
  },
}
