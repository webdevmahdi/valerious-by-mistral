import { ApiError } from '../utils/ApiError'
import { SHIPPING } from '../constants'

export const shippingService = {
  costFor(method: 'standard' | 'express', city: string, subtotal: number): number {
    if (subtotal >= SHIPPING.freeThreshold) return 0
    const insideDhaka = /dhaka/i.test(city)
    if (method === 'standard') {
      return insideDhaka ? SHIPPING.standard.insideDhaka : SHIPPING.standard.outsideDhaka
    }
    if (!insideDhaka) {
      throw ApiError.badRequest('Express delivery is currently available inside Dhaka only.')
    }
    return SHIPPING.express.insideDhaka
  },

  estimatedDelivery(method: 'standard' | 'express', city: string): Date {
    const insideDhaka = /dhaka/i.test(city)
    const days = method === 'express' ? 1 : insideDhaka ? 2 : 4
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date
  },
}
