import { productRepository } from '../repositories/product.repository'
import { ApiError } from '../utils/ApiError'
import type { ProductDocument } from '../models/Product'
import type { ProductFilter } from '../repositories/product.repository'

export interface CatalogQuery {
  category?: string
  collection?: string
  sizes?: string
  colors?: string
  priceMin?: number
  priceMax?: number
  availability?: boolean
  rating?: number
  q?: string
  sort?: 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'best_selling' | 'rating'
  page: number
  limit: number
}

const SORTS: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  best_selling: { soldCount: -1 },
  rating: { rating: -1 },
  featured: { featured: -1, createdAt: -1 },
}

function buildFilter(query: CatalogQuery): ProductFilter {
  const filter: Record<string, unknown> = { status: 'active' }
  if (query.category) filter.category = query.category
  if (query.collection) filter.collections = query.collection
  if (query.sizes) filter['sizes.size'] = { $all: query.sizes.split(',') }
  if (query.colors) filter['colors.name'] = { $in: query.colors.split(',') }
  if (query.priceMin !== undefined || query.priceMax !== undefined) {
    filter.price = {
      ...(query.priceMin !== undefined ? { $gte: query.priceMin } : {}),
      ...(query.priceMax !== undefined ? { $lte: query.priceMax } : {}),
    }
  }
  if (query.rating) filter.rating = { $gte: query.rating }
  if (query.q) filter.$text = { $search: query.q }
  if (query.availability) filter['sizes.inStock'] = true
  return filter as ProductFilter
}

export const productService = {
  async list(query: CatalogQuery): Promise<{ items: ProductDocument[]; total: number }> {
    const filter = buildFilter(query)
    const sort = SORTS[query.sort ?? 'featured'] ?? SORTS.featured
    return productRepository.find(filter, query.page, query.limit, sort)
  },

  async bySlug(slug: string): Promise<ProductDocument> {
    const product = await productRepository.findOne({ slug, status: 'active' })
    if (!product) throw ApiError.notFound('This piece could not be found.')
    return product
  },

  async related(slug: string): Promise<ProductDocument[]> {
    const product = await productRepository.findOne({ slug })
    if (!product) return []
    const { items } = await productRepository.find(
      { status: 'active', category: product.category, slug: { $ne: slug } } as ProductFilter,
      1,
      4,
    )
    return items
  },

  async priceFor(productId: string): Promise<number> {
    const product = await productRepository.findById(productId)
    if (!product || product.status !== 'active') throw ApiError.notFound('One of the items in your cart is no longer available.')
    return product.price
  },

  async assertSizeInStock(productId: string, size: string): Promise<ProductDocument> {
    const product = await productRepository.findById(productId)
    if (!product || product.status !== 'active') throw ApiError.notFound('One of the items in your cart is no longer available.')
    const sizeOption = product.sizes.find((s) => s.size === size)
    if (!sizeOption || !sizeOption.inStock) {
      throw ApiError.outOfStock(`${product.name} in size ${size} has just sold out.`)
    }
    return product
  },

  async decrementStock(productId: string, size: string): Promise<void> {
    const product = await productRepository.findById(productId)
    if (!product) return
    const sizeOption = product.sizes.find((s) => s.size === size)
    if (!sizeOption) return
    await productRepository.setStock(productId, size, false)
  },

  async restoreStock(productId: string, size: string): Promise<void> {
    await productRepository.setStock(productId, size, true)
  },
}
