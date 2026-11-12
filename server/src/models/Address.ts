import { Schema, model } from 'mongoose'
import type { AddressInput } from '../types'

export interface AddressDocument extends AddressInput {
  _id: unknown
  user: unknown
  label: string
  isDefault: boolean
}

const addressSchema = new Schema<AddressDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, default: 'Home', maxlength: 40 },
    fullName: { type: String, required: true },
    phone: { type: String, required: true, match: /^01[3-9]\d{8}$/ },
    email: String,
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    postcode: { type: String, required: true },
    country: { type: String, default: 'Bangladesh' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export const Address = model<AddressDocument>('Address', addressSchema)
