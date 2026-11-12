import type { Request, Response } from 'express'
import { editorialRepository } from '../repositories/editorial.repository'
import { ApiError } from '../utils/ApiError'

export const editorialController = {
  async list(_req: Request, res: Response): Promise<void> {
    const items = await editorialRepository.listPublished()
    res.json({ success: true, data: items })
  },

  async bySlug(req: Request, res: Response): Promise<void> {
    const article = await editorialRepository.findBySlug(req.params.slug)
    if (!article || article.status !== 'published') throw ApiError.notFound('This story could not be found.')
    res.json({ success: true, data: article })
  },

  async listAll(_req: Request, res: Response): Promise<void> {
    const items = await editorialRepository.listAll()
    res.json({ success: true, data: items })
  },

  async create(req: Request, res: Response): Promise<void> {
    const article = await editorialRepository.create({
      ...req.body,
      publishedAt: req.body.status === 'published' ? new Date() : undefined,
    })
    res.status(201).json({ success: true, data: article })
  },

  async update(req: Request, res: Response): Promise<void> {
    const article = await editorialRepository.updateById(req.params.id, req.body)
    if (!article) throw ApiError.notFound('Article not found.')
    res.json({ success: true, data: article })
  },
}
