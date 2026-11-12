import type { Request, Response } from 'express'
import { couponService } from '../services/couponService'
import { couponRepository } from '../repositories/coupon.repository'
import { validateCouponSchema } from '../validators'

export const couponController = {
  async validate(req: Request, res: Response): Promise<void> {
    const { code, subtotal } = validateCouponSchema.parse(req.body)
    const result = await couponService.validate(code, subtotal)
    res.json({
      success: true,
      data: { code: result.code, discount: result.discount },
      message: 'Coupon applied.',
    })
  },

  async list(_req: Request, res: Response): Promise<void> {
    const items = await couponRepository.list()
    res.json({ success: true, data: items })
  },

  async create(req: Request, res: Response): Promise<void> {
    const coupon = await couponRepository.create(req.body)
    res.status(201).json({ success: true, data: coupon })
  },

  async update(req: Request, res: Response): Promise<void> {
    const coupon = await couponRepository.updateByCode(req.params.code, req.body)
    res.json({ success: true, data: coupon })
  },
}
