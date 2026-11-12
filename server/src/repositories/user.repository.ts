import { User, type UserDocument } from '../models/User'
import { Address, type AddressDocument } from '../models/Address'

export const userRepository = {
  async findByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email: email.toLowerCase() })
  },

  async findById(id: string): Promise<UserDocument | null> {
    return User.findById(id)
  },

  async create(data: { name: string; email: string; passwordHash: string; phone?: string; role?: string; marketingConsent?: boolean }): Promise<UserDocument> {
    return User.create(data)
  },

  async countAdmins(): Promise<number> {
    return User.countDocuments({ role: 'ADMIN' })
  },
}

export const addressRepository = {
  async listForUser(userId: unknown): Promise<AddressDocument[]> {
    return Address.find({ user: userId }).lean()
  },

  async create(userId: unknown, data: Partial<AddressDocument>): Promise<AddressDocument> {
    return Address.create({ ...data, user: userId })
  },

  async remove(userId: unknown, addressId: string): Promise<void> {
    await Address.deleteOne({ _id: addressId, user: userId })
  },
}
