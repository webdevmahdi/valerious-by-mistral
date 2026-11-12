import { orderRepository } from '../repositories/order.repository'
import { productService } from './productService'
import { couponService } from './couponService'
import { shippingService } from './shippingService'
import { emailService } from '../integrations/email'
import { paymentProviderFor } from '../integrations/payments'
import { ApiError } from '../utils/ApiError'
import { CURRENCY, TRANSITIONS } from '../constants'
import type { AddressInput, CheckoutItemInput, OrderItemLine, OrderStatus } from '../types'
import type { OrderDocument } from '../models/Order'

export interface CheckoutInput {
  items: CheckoutItemInput[]
  shippingAddress: AddressInput
  shippingMethod: 'standard' | 'express'
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'card'
  couponCode?: string
  notes?: string
}

function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(1000 + Math.random() * 9000)
  return `VAL-${year}-${random}`
}

export const orderService = {
  async checkout(input: CheckoutInput, userId?: string): Promise<OrderDocument> {
    const lines: OrderItemLine[] = []
    for (const item of input.items) {
      const product = await productService.assertSizeInStock(item.productId, item.size)
      const unitPrice = product.price
      lines.push({
        product: product._id,
        name: product.name,
        sku: `${product.skuPrefix}-${item.color.slice(0, 3).toUpperCase()}-${item.size.toUpperCase()}`,
        size: item.size,
        color: item.color,
        unitPrice,
        quantity: item.quantity,
        total: unitPrice * item.quantity,
      })
    }

    const subtotal = lines.reduce((sum, line) => sum + line.total, 0)

    let discount = 0
    let couponCode: string | undefined
    if (input.couponCode) {
      const result = await couponService.validate(input.couponCode, subtotal)
      discount = result.discount
      couponCode = result.code
    }

    const shippingCost = shippingService.costFor(input.shippingMethod, input.shippingAddress.city, subtotal - discount)
    const total = subtotal - discount + shippingCost

    const provider = paymentProviderFor(input.paymentMethod)
    const payment = await provider.initiate(total, generateOrderNumber())

    const order = await orderRepository.create({
      orderNumber: payment.orderNumber,
      user: userId,
      customer: {
        name: input.shippingAddress.fullName,
        email: input.shippingAddress.email ?? '',
        phone: input.shippingAddress.phone,
      },
      items: lines,
      shippingAddress: input.shippingAddress,
      shippingMethod: input.shippingMethod,
      shippingCost,
      subtotal,
      discount,
      couponCode,
      total,
      currency: CURRENCY,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === 'cod' ? 'PENDING' : 'PENDING',
      paymentReference: payment.reference,
      orderStatus: 'PENDING',
      timeline: [{ status: 'PENDING', at: new Date(), note: 'Order placed' }],
      estimatedDelivery: shippingService.estimatedDelivery(input.shippingMethod, input.shippingAddress.city),
      notes: input.notes,
    })

    for (const line of lines) {
      await productService.decrementStock(String(line.product), line.size)
    }
    if (couponCode) {
      const { couponRepository } = await import('../repositories/coupon.repository')
      await couponRepository.incrementUsage(couponCode)
    }

    await emailService.sendOrderConfirmation({
      to: order.customer.email,
      orderNumber: order.orderNumber,
      totalMinor: order.total,
      status: order.orderStatus,
    })

    return order
  },

  async byOrderNumber(orderNumber: string, email?: string): Promise<OrderDocument> {
    const order = await orderRepository.findByOrderNumber(orderNumber)
    if (!order) throw ApiError.notFound('We could not find an order with that number.')
    if (email && order.customer.email && order.customer.email.toLowerCase() !== email.toLowerCase()) {
      throw ApiError.forbidden('This order belongs to a different account.')
    }
    return order
  },

  async listForUser(userId: string): Promise<OrderDocument[]> {
    return orderRepository.listForUser(userId)
  },

  async listAll(page: number, limit: number, status?: string): Promise<{ items: OrderDocument[]; total: number }> {
    const filter = status ? { orderStatus: status } : {}
    return orderRepository.list(filter, page, limit)
  },

  async updateStatus(orderNumber: string, next: OrderStatus, note?: string): Promise<OrderDocument> {
    const order = await orderRepository.findByOrderNumber(orderNumber)
    if (!order) throw ApiError.notFound('We could not find an order with that number.')

    const allowed = TRANSITIONS[order.orderStatus] ?? []
    if (!allowed.includes(next)) {
      throw ApiError.invalidTransition(`An order that is ${order.orderStatus.toLowerCase()} cannot move to ${next.toLowerCase()}.`)
    }

    const updated = await orderRepository.updateByOrderNumber(orderNumber, {
      orderStatus: next,
      timeline: [...order.timeline, { status: next, at: new Date(), note }],
      ...(next === 'CANCELLED'
        ? { paymentStatus: order.paymentStatus === 'PAID' ? 'REFUNDED' : order.paymentStatus }
        : {}),
    })

    if (next === 'CANCELLED') {
      for (const line of order.items) {
        await productService.restoreStock(String(line.product), line.size)
      }
    }

    if (updated) {
      await emailService.sendOrderStatusUpdate({
        to: updated.customer.email,
        orderNumber: updated.orderNumber,
        totalMinor: updated.total,
        status: next,
      })
    }

    return updated as OrderDocument
  },

  async setTracking(orderNumber: string, trackingNumber: string): Promise<OrderDocument> {
    const updated = await orderRepository.updateByOrderNumber(orderNumber, { trackingNumber })
    if (!updated) throw ApiError.notFound('We could not find an order with that number.')
    return updated
  },
}
