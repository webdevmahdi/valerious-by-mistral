import { Order, type OrderDocument } from '../models/Order'

export const orderRepository = {
  async create(data: Partial<OrderDocument>): Promise<OrderDocument> {
    return Order.create(data)
  },

  async findByOrderNumber(orderNumber: string): Promise<OrderDocument | null> {
    return Order.findOne({ orderNumber: orderNumber.toUpperCase() }).lean()
  },

  async findById(id: string): Promise<OrderDocument | null> {
    return Order.findById(id).lean()
  },

  async listForUser(userId: unknown): Promise<OrderDocument[]> {
    return Order.find({ user: userId }).sort({ createdAt: -1 }).lean()
  },

  async list(filter: Record<string, unknown> = {}, page = 1, limit = 20): Promise<{ items: OrderDocument[]; total: number }> {
    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Order.countDocuments(filter),
    ])
    return { items, total }
  },

  async updateByOrderNumber(orderNumber: string, patch: Partial<OrderDocument>): Promise<OrderDocument | null> {
    return Order.findOneAndUpdate({ orderNumber: orderNumber.toUpperCase() }, patch, { new: true }).lean()
  },

  async countByStatus(): Promise<Record<string, number>> {
    const counts = await Order.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ])
    return Object.fromEntries(counts.map((c) => [c._id, c.count]))
  },

  async revenue(): Promise<number> {
    const result = await Order.aggregate<{ total: number | null }>([
      { $match: { orderStatus: { $ne: 'CANCELLED' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ])
    return result[0]?.total ?? 0
  },
}
