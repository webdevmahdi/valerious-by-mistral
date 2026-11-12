import { Schema, model } from 'mongoose'

export interface EditorialDocument {
  _id: unknown
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  readingTime: number
  body: { heading?: string; paragraphs: string[]; pullQuote?: string }[]
  status: 'draft' | 'published'
  publishedAt?: Date
}

const editorialSchema = new Schema<EditorialDocument>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    category: { type: String, default: 'Journal' },
    author: { type: String, required: true },
    readingTime: { type: Number, default: 4 },
    body: [{ heading: String, paragraphs: [String], pullQuote: String }],
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    publishedAt: Date,
  },
  { timestamps: true },
)

export const Editorial = model<EditorialDocument>('Editorial', editorialSchema)
