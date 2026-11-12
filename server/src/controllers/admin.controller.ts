import type { Request, Response } from 'express'
import { productRepository } from '../repositories/product.repository'
import { orderRepository } from '../repositories/order.repository'
import { ApiError } from '../utils/ApiError'
import type { ProductDocument } from '../models/Product'

export const adminController = {
  async dashboard(_req: Request, res: Response): Promise<void> {
    const [revenue, counts, { items: recentOrders }] = await Promise.all([
      orderRepository.revenue(),
      orderRepository.countByStatus(),
      orderRepository.list({}, 1, 10),
    ])
    const orderCount = Object.values(counts).reduce((sum, n) => sum + n, 0)
    const cancelled = counts['CANCELLED'] ?? 0
    res.json({
      success: true,
      data: {
        revenue,
        orderCount,
        aov: orderCount - cancelled > 0 ? Math.round(revenue / (orderCount - cancelled)) : 0,
        ordersByStatus: counts,
        recentOrders,
      },
    })
  },

  async createProduct(req: Request, res: Response): Promise<void> {
    const product = await productRepository.create(req.body as Partial<ProductDocument>)
    res.status(201).json({ success: true, data: product })
  },

  async updateProduct(req: Request, res: Response): Promise<void> {
    const product = await productRepository.updateById(req.params.id, req.body as Partial<ProductDocument>)
    if (!product) throw ApiError.notFound('Product not found.')
    res.json({ success: true, data: product })
  },

  async setStock(req: Request, res: Response): Promise<void> {
    const { size, inStock } = req.body as { size: string; inStock: boolean }
    await productRepository.setStock(req.params.id, size, inStock)
    const product = await productRepository.findById(req.params.id)
    if (!product) throw ApiError.notFound('Product not found.')
    res.json({ success: true, data: product })
  },
}
