import { z } from 'zod'

export const phoneSchema = z
  .string()
  .regex(/^01[3-9]\d{8}$/, 'Enter a valid Bangladeshi mobile number (e.g. 01712345678).')

export const registerSchema = z.object({
  name: z.string().min(2, 'Tell us your name.').max(80),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(72),
  phone: phoneSchema.optional(),
  marketingConsent: z.boolean().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
})

export const addressSchema = z.object({
  label: z.string().max(40).optional(),
  fullName: z.string().min(2).max(80),
  phone: phoneSchema,
  email: z.string().email().optional(),
  line1: z.string().min(4).max(160),
  line2: z.string().max(160).optional(),
  city: z.string().min(2).max(60),
  postcode: z.string().min(4).max(10),
  country: z.string().default('Bangladesh'),
  isDefault: z.boolean().optional(),
})

export const productQuerySchema = z.object({
  category: z.string().optional(),
  collection: z.string().optional(),
  sizes: z.string().optional(),
  colors: z.string().optional(),
  priceMin: z.coerce.number().int().min(0).optional(),
  priceMax: z.coerce.number().int().min(0).optional(),
  availability: z.coerce.boolean().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  q: z.string().max(120).optional(),
  sort: z.enum(['featured', 'newest', 'price_asc', 'price_desc', 'best_selling', 'rating']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(24),
})

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        size: z.string().min(1),
        color: z.string().min(1),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1, 'Your cart is empty.'),
  shippingAddress: addressSchema,
  shippingMethod: z.enum(['standard', 'express']),
  paymentMethod: z.enum(['cod', 'bkash', 'nagad', 'card']),
  couponCode: z.string().max(40).optional(),
  notes: z.string().max(500).optional(),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'RETURN_REQUESTED',
    'RETURNED',
  ]),
  note: z.string().max(300).optional(),
})

export const trackingSchema = z.object({
  trackingNumber: z.string().min(4).max(60),
})

export const couponSchema = z.object({
  code: z.string().min(3).max(40).transform((v) => v.toUpperCase()),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().int().min(1),
  minimumOrder: z.number().int().min(0).default(0),
  maximumDiscount: z.number().int().min(1).optional(),
  description: z.string().max(200).default(''),
  expiresAt: z.coerce.date(),
  usageLimit: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
})

export const validateCouponSchema = z.object({
  code: z.string().min(1).max(40),
  subtotal: z.number().int().min(0),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(4).max(2000),
})

export const productUpsertSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140).regex(/^[a-z0-9-]+$/),
  shortDescription: z.string().max(200),
  description: z.string().max(4000),
  category: z.string(),
  collections: z.array(z.string()).default([]),
  price: z.number().int().min(1),
  compareAtPrice: z.number().int().min(1).optional(),
  colors: z.array(z.object({ name: z.string(), hex: z.string() })).default([]),
  sizes: z.array(z.object({ size: z.string(), inStock: z.boolean() })).default([]),
  skuPrefix: z.string().min(2).max(12),
  featured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  status: z.enum(['active', 'archived']).optional(),
  seo: z.object({ title: z.string().max(120), description: z.string().max(200) }).optional(),
})

export const productPatchSchema = productUpsertSchema.partial()
