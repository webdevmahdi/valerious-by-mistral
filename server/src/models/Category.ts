import { Schema, model } from 'mongoose'

export interface CategoryDocument {
  _id: unknown
  slug: string
  name: string
  tagline: string
  description: string
  order: number
  isActive: boolean
}

const categorySchema = new Schema<CategoryDocument>({
  slug: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  tagline: { type: String, default: '' },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
})

export const Category = model<CategoryDocument>('Category', categorySchema)
