import { Schema, model } from 'mongoose'

export interface ReviewDocument {
  _id: unknown
  product: unknown
  user?: unknown
  author: string
  rating: number
  title: string
  body: string
  verified: boolean
  helpful: number
  status: 'published' | 'hidden'
}

const reviewSchema = new Schema<ReviewDocument>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    author: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '' },
    body: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
    status: { type: String, enum: ['published', 'hidden'], default: 'published', index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

export const Review = model<ReviewDocument>('Review', reviewSchema)
