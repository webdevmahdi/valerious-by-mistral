import type { Request, Response } from 'express'
import { productService } from '../services/productService'
import { Category } from '../models/Category'
import { Collection } from '../models/Collection'
import { productRepository } from '../repositories/product.repository'
import { ApiError } from '../utils/ApiError'

export const catalogController = {
  async listProducts(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as Parameters<typeof productService.list>[0]
    const { items, total } = await productService.list(query)
    const { page, limit } = query
    res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    })
  },

  async getProduct(req: Request, res: Response): Promise<void> {
    const product = await productService.bySlug(req.params.slug)
    res.json({ success: true, data: product })
  },

  async getRelated(req: Request, res: Response): Promise<void> {
    const items = await productService.related(req.params.slug)
    res.json({ success: true, data: items })
  },

  async getFeatured(_req: Request, res: Response): Promise<void> {
    const items = await productRepository.featured(8)
    res.json({ success: true, data: items })
  },

  async getNewArrivals(_req: Request, res: Response): Promise<void> {
    const items = await productRepository.newArrivals(8)
    res.json({ success: true, data: items })
  },

  async listCategories(_req: Request, res: Response): Promise<void> {
    const items = await Category.find({ isActive: true }).sort({ order: 1 }).lean()
    res.json({ success: true, data: items })
  },

  async listCollections(_req: Request, res: Response): Promise<void> {
    const items = await Collection.find({ isActive: true }).lean()
    res.json({ success: true, data: items })
  },

  async getCollection(req: Request, res: Response): Promise<void> {
    const collection = await Collection.findOne({ slug: req.params.slug, isActive: true }).lean()
    if (!collection) throw ApiError.notFound('This collection could not be found.')
    res.json({ success: true, data: collection })
  },
}
