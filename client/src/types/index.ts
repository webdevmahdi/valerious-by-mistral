export type CategorySlug = 't-shirts' | 'shirts' | 'pants' | 'hoodies' | 'jackets'

export interface Category {
  slug: CategorySlug
  name: string
  tagline: string
  description: string
}

export interface Collection {
  slug: string
  name: string
  season: string
  description: string
  story: string
}

export interface ProductColor {
  name: string
  hex: string
}

export interface SizeOption {
  size: string
  inStock: boolean
}

export interface ProductReview {
  id: string
  author: string
  rating: number
  title: string
  body: string
  date: string
  verified: boolean
  helpful: number
}

export interface Product {
  id: string
  slug: string
  name: string
  shortDescription: string
  description: string
  category: CategorySlug
  collections: string[]
  price: number
  compareAtPrice?: number
  colors: ProductColor[]
  sizes: SizeOption[]
  skuPrefix: string
  fabric: string
  composition: string
  weight: string
  fit: string
  construction: string
  origin: string
  care: string[]
  modelInfo: string
  rating: number
  reviewCount: number
  soldCount: number
  featured: boolean
  isNew: boolean
  status: 'active' | 'archived'
  seo: { title: string; description: string }
  reviews: ProductReview[]
}

export interface EditorialArticle {
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  date: string
  readingTime: number
  body: { heading?: string; paragraphs: string[]; pullQuote?: string }[]
}

export interface Coupon {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minimumOrder: number
  maximumDiscount?: number
  description: string
  expiresAt: string
  isActive: boolean
}

export interface CartItem {
  productId: string
  slug: string
  name: string
  size: string
  color: string
  price: number
  compareAtPrice?: number
  quantity: number
  sku: string
  seed: string
  category: CategorySlug
}

export interface Address {
  id: string
  label: string
  fullName: string
  phone: string
  email?: string
  line1: string
  line2?: string
  city: string
  postcode: string
  country: string
  isDefault?: boolean
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'card'

export interface OrderItem {
  productId: string
  productName: string
  sku: string
  size: string
  color: string
  quantity: number
  unitPrice: number
  total: number
  seed: string
}

export interface OrderEvent {
  status: OrderStatus
  at: string
  note?: string
}

export interface Order {
  orderNumber: string
  createdAt: string
  customer: { name: string; email: string; phone: string }
  items: OrderItem[]
  shippingAddress: Omit<Address, 'id' | 'label'>
  shippingMethod: 'standard' | 'express'
  shippingCost: number
  subtotal: number
  discount: number
  couponCode?: string
  total: number
  currency: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  timeline: OrderEvent[]
  trackingNumber?: string
  estimatedDelivery: string
  notes?: string
}

export interface UserAccount {
  id: string
  name: string
  email: string
  phone?: string
  role: 'CUSTOMER' | 'ADMIN'
  addresses: Address[]
  marketingConsent: boolean
  createdAt: string
}

export interface FaqItem {
  question: string
  answer: string
  group: string
}
