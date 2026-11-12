import type { Request, Response } from 'express'
import { reviewRepository } from '../repositories/review.repository'
import { productRepository } from '../repositories/product.repository'
import { ApiError } from '../utils/ApiError'
import type { JwtPayload } from '../types'

export const reviewController = {
  async listForProduct(req: Request, res: Response): Promise<void> {
    const product = await productRepository.findOne({ slug: req.params.slug })
    if (!product) throw ApiError.notFound('This piece could not be found.')
    const items = await reviewRepository.listForProduct(product._id)
    res.json({ success: true, data: items })
  },

  async create(req: Request, res: Response): Promise<void> {
    const product = await productRepository.findOne({ slug: req.params.slug })
    if (!product) throw ApiError.notFound('This piece could not be found.')
    const user = (req as Request & { user?: JwtPayload }).user
    const review = await reviewRepository.create({
      product: product._id,
      user: user?.sub,
      author: req.body.author ?? 'Customer',
      rating: req.body.rating,
      title: req.body.title,
      body: req.body.body,
      verified: Boolean(user),
    })
    await reviewRepository.recalculateRating(product._id)
    res.status(201).json({ success: true, data: review, message: 'Thank you for the review.' })
  },

  async moderate(req: Request, res: Response): Promise<void> {
    const review = await reviewRepository.updateStatus(req.params.id, req.body.status)
    if (!review) throw ApiError.notFound('Review not found.')
    await reviewRepository.recalculateRating(review.product)
    res.json({ success: true, data: review })
  },

  async all(_req: Request, res: Response): Promise<void> {
    const items = await reviewRepository.all()
    res.json({ success: true, data: items })
  },
}
