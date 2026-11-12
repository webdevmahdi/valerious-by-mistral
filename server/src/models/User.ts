import { Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'
import type { UserRole } from '../types'

export interface UserDocument {
  _id: unknown
  name: string
  email: string
  passwordHash: string
  phone?: string
  role: UserRole
  marketingConsent: boolean
  createdAt: Date
  comparePassword(candidate: string): Promise<boolean>
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, match: /^01[3-9]\d{8}$/ },
    role: { type: String, enum: ['CUSTOMER', 'ADMIN'], default: 'CUSTOMER' },
    marketingConsent: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

userSchema.methods.comparePassword = function comparePassword(candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash)
}

export const User = model<UserDocument>('User', userSchema)
