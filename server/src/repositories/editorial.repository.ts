import { Editorial, type EditorialDocument } from '../models/Editorial'

export const editorialRepository = {
  async listPublished(): Promise<EditorialDocument[]> {
    return Editorial.find({ status: 'published' }).sort({ publishedAt: -1 }).lean()
  },

  async listAll(): Promise<EditorialDocument[]> {
    return Editorial.find().sort({ createdAt: -1 }).lean()
  },

  async findBySlug(slug: string): Promise<EditorialDocument | null> {
    return Editorial.findOne({ slug }).lean()
  },

  async create(data: Partial<EditorialDocument>): Promise<EditorialDocument> {
    return Editorial.create(data)
  },

  async updateById(id: string, patch: Partial<EditorialDocument>): Promise<EditorialDocument | null> {
    return Editorial.findByIdAndUpdate(id, patch, { new: true }).lean()
  },
}
