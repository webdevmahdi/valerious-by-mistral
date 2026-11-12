import { Schema, model } from 'mongoose'

export interface CollectionDocument {
  _id: unknown
  slug: string
  name: string
  season: string
  description: string
  story: string
  isActive: boolean
}

const collectionSchema = new Schema<CollectionDocument>({
  slug: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  season: { type: String, default: '' },
  description: { type: String, default: '' },
  story: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
})

export const Collection = model<CollectionDocument>('Collection', collectionSchema)
