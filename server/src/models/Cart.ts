import { Schema, model } from 'mongoose'

export interface CartDocument {
  _id: unknown
  user: unknown
  items: {
    product: unknown
    size: string
    color: string
    quantity: number
  }[]
  couponCode?: string
}

const cartSchema = new Schema<CartDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        size: { type: String, required: true },
        color: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1, max: 10 },
      },
    ],
    couponCode: String,
  },
  { timestamps: true },
)

export const Cart = model<CartDocument>('Cart', cartSchema)
