import { Schema, model } from 'mongoose'

export interface CouponDocument {
  _id: unknown
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minimumOrder: number
  maximumDiscount?: number
  description: string
  expiresAt: Date
  usageLimit?: number
  usedCount: number
  isActive: boolean
}

const couponSchema = new Schema<CouponDocument>({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true, min: 1 },
  minimumOrder: { type: Number, default: 0 },
  maximumDiscount: Number,
  description: { type: String, default: '' },
  expiresAt: { type: Date, required: true },
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
})

export const Coupon = model<CouponDocument>('Coupon', couponSchema)
