import { couponRepository } from '../repositories/coupon.repository'
import { ApiError } from '../utils/ApiError'
import type { CouponDocument } from '../models/Coupon'

export interface CouponResult {
  code: string
  discount: number
  coupon: CouponDocument
}

export const couponService = {
  async validate(code: string, subtotal: number): Promise<CouponResult> {
    const coupon = await couponRepository.findByCode(code)
    if (!coupon || !coupon.isActive) throw ApiError.couponInvalid('This code is not valid.')
    if (coupon.expiresAt < new Date()) throw ApiError.couponInvalid('This code has expired.')
    if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
      throw ApiError.couponInvalid('This code has reached its usage limit.')
    }
    if (subtotal < coupon.minimumOrder) {
      throw ApiError.couponInvalid('Your order does not meet the minimum for this code.')
    }

    let discount =
      coupon.type === 'percentage' ? Math.round((subtotal * coupon.value) / 100) : coupon.value
    if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount)
    discount = Math.min(discount, subtotal)

    return { code: coupon.code, discount, coupon }
  },
}
