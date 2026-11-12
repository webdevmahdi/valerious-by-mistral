import { Schema, model } from 'mongoose'
import type { OrderItemLine, OrderStatus, PaymentMethod, PaymentStatus } from '../types'

export interface OrderDocument {
  _id: unknown
  orderNumber: string
  user?: unknown
  customer: { name: string; email: string; phone: string }
  items: OrderItemLine[]
  shippingAddress: {
    fullName: string
    phone: string
    email?: string
    line1: string
    line2?: string
    city: string
    postcode: string
    country: string
  }
  shippingMethod: 'standard' | 'express'
  shippingCost: number
  subtotal: number
  discount: number
  couponCode?: string
  total: number
  currency: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentReference?: string
  orderStatus: OrderStatus
  timeline: { status: OrderStatus; at: Date; note?: string }[]
  trackingNumber?: string
  estimatedDelivery: Date
  notes?: string
}

const orderSchema = new Schema<OrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        sku: String,
        size: String,
        color: String,
        unitPrice: Number,
        quantity: Number,
        total: Number,
      },
    ],
    shippingAddress: {
      fullName: String,
      phone: String,
      email: String,
      line1: String,
      line2: String,
      city: String,
      postcode: String,
      country: String,
    },
    shippingMethod: { type: String, enum: ['standard', 'express'], default: 'standard' },
    shippingCost: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: String,
    total: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    paymentMethod: { type: String, enum: ['cod', 'bkash', 'nagad', 'card'], required: true },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' },
    paymentReference: String,
    orderStatus: { type: String, required: true, index: true },
    timeline: [{ status: String, at: Date, note: String }],
    trackingNumber: String,
    estimatedDelivery: Date,
    notes: String,
  },
  { timestamps: true },
)

export const Order = model<OrderDocument>('Order', orderSchema)
