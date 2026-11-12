import { Review, type ReviewDocument } from '../models/Review'
import { Product } from '../models/Product'

export const reviewRepository = {
  async listForProduct(productId: unknown, includeHidden = false): Promise<ReviewDocument[]> {
    const filter: Record<string, unknown> = { product: productId }
    if (!includeHidden) filter.status = 'published'
    return Review.find(filter).sort({ createdAt: -1 }).lean()
  },

  async create(data: Partial<ReviewDocument>): Promise<ReviewDocument> {
    return Review.create(data)
  },

  async updateStatus(id: string, status: 'published' | 'hidden'): Promise<ReviewDocument | null> {
    return Review.findByIdAndUpdate(id, { status }, { new: true }).lean()
  },

  async all(): Promise<(ReviewDocument & { productSlug?: string })[]> {
    return Review.find().populate('product', 'slug name').sort({ createdAt: -1 }).lean() as Promise<
      (ReviewDocument & { productSlug?: string })[]
    >
  },

  async recalculateRating(productId: unknown): Promise<void> {
    const result = await Review.aggregate<{ avg: number | null; count: number }>([
      { $match: { product: productId, status: 'published' } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ])
    const avg = result[0]?.avg ?? 0
    await Product.updateOne(
      { _id: productId },
      { rating: Math.round(avg * 10) / 10, reviewCount: result[0]?.count ?? 0 },
    )
  },
}
