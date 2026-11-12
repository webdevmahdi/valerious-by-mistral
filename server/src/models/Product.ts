import { Schema, model } from 'mongoose'

export interface ProductDocument {
  _id: unknown
  slug: string
  name: string
  shortDescription: string
  description: string
  category: string
  collections: string[]
  price: number
  compareAtPrice?: number
  colors: { name: string; hex: string }[]
  sizes: { size: string; inStock: boolean }[]
  skuPrefix: string
  fabric: string
  composition: string
  weight: string
  fit: string
  construction: string
  origin: string
  care: string[]
  modelInfo: string
  images: { url: string; alt: string }[]
  rating: number
  reviewCount: number
  soldCount: number
  featured: boolean
  isNew: boolean
  status: 'active' | 'archived'
  seo: { title: string; description: string }
}

const productSchema = new Schema<ProductDocument>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: 'text' },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    collections: { type: [String], default: [] },
    price: { type: Number, required: true, min: 1, validate: Number.isInteger },
    compareAtPrice: { type: Number, min: 1, validate: Number.isInteger },
    colors: [{ name: String, hex: String }],
    sizes: [{ size: String, inStock: Boolean }],
    skuPrefix: { type: String, required: true },
    fabric: String,
    composition: String,
    weight: String,
    fit: String,
    construction: String,
    origin: String,
    care: [String],
    modelInfo: String,
    images: [{ url: String, alt: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'archived'], default: 'active', index: true },
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
    },
  },
  { timestamps: true },
)

productSchema.index({ name: 'text', shortDescription: 'text', description: 'text' })

export const Product = model<ProductDocument>('Product', productSchema)
