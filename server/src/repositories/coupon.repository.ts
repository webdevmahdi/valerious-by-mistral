import { Coupon, type CouponDocument } from '../models/Coupon'

export const couponRepository = {
  async findByCode(code: string): Promise<CouponDocument | null> {
    return Coupon.findOne({ code: code.toUpperCase() })
  },

  async list(): Promise<CouponDocument[]> {
    return Coupon.find().sort({ code: 1 }).lean()
  },

  async create(data: Partial<CouponDocument>): Promise<CouponDocument> {
    return Coupon.create(data)
  },

  async updateByCode(code: string, patch: Partial<CouponDocument>): Promise<CouponDocument | null> {
    return Coupon.findOneAndUpdate({ code: code.toUpperCase() }, patch, { new: true }).lean()
  },

  async incrementUsage(code: string): Promise<void> {
    await Coupon.updateOne({ code: code.toUpperCase() }, { $inc: { usedCount: 1 } })
  },
}
