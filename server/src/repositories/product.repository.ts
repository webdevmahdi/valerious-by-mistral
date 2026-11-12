import type { FilterQuery } from 'mongoose'
import { Product, type ProductDocument } from '../models/Product'

export interface ProductFilter extends FilterQuery<ProductDocument> {}

export const productRepository = {
  async find(filter: ProductFilter, page: number, limit: number, sort: Record<string, 1 | -1> = { featured: -1, createdAt: -1 }): Promise<{ items: ProductDocument[]; total: number }> {
    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(filter),
    ])
    return { items, total }
  },

  async findOne(filter: ProductFilter): Promise<ProductDocument | null> {
    return Product.findOne(filter).lean()
  },

  async findById(id: string): Promise<ProductDocument | null> {
    return Product.findById(id).lean()
  },

  async featured(limit = 8): Promise<ProductDocument[]> {
    return Product.find({ status: 'active', featured: true }).limit(limit).lean()
  },

  async newArrivals(limit = 8): Promise<ProductDocument[]> {
    return Product.find({ status: 'active', isNew: true }).sort({ createdAt: -1 }).limit(limit).lean()
  },

  async create(data: Partial<ProductDocument>): Promise<ProductDocument> {
    return Product.create(data)
  },

  async updateById(id: string, patch: Partial<ProductDocument>): Promise<ProductDocument | null> {
    return Product.findByIdAndUpdate(id, patch, { new: true }).lean()
  },

  async incrementSold(id: unknown, quantity: number): Promise<void> {
    await Product.updateOne({ _id: id }, { $inc: { soldCount: quantity } })
  },

  async setStock(id: unknown, size: string, inStock: boolean): Promise<void> {
    await Product.updateOne({ _id: id, 'sizes.size': size }, { $set: { 'sizes.$.inStock': inStock } })
  },
}
