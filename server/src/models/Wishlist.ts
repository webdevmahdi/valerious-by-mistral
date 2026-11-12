import { Schema, model } from 'mongoose'

export interface WishlistDocument {
  _id: unknown
  user: unknown
  products: unknown[]
}

const wishlistSchema = new Schema<WishlistDocument>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
})

export const Wishlist = model<WishlistDocument>('Wishlist', wishlistSchema)
