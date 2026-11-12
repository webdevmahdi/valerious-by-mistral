import type { Request, Response } from 'express'
import { orderService } from '../services/orderService'
import type { JwtPayload } from '../types'

function currentUser(req: Request): JwtPayload {
  return (req as Request & { user: JwtPayload }).user
}

export const orderController = {
  async checkout(req: Request, res: Response): Promise<void> {
    const user = (req as Request & { user?: JwtPayload }).user
    const order = await orderService.checkout(req.body, user?.sub)
    res.status(201).json({ success: true, data: order, message: `Order ${order.orderNumber} is confirmed.` })
  },

  async track(req: Request, res: Response): Promise<void> {
    const order = await orderService.byOrderNumber(req.params.orderNumber, req.query.email as string | undefined)
    res.json({ success: true, data: order })
  },

  async myOrders(req: Request, res: Response): Promise<void> {
    const orders = await orderService.listForUser(currentUser(req).sub)
    res.json({ success: true, data: orders })
  },

  async listAll(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page ?? 1)
    const limit = Number(req.query.limit ?? 20)
    const status = req.query.status as string | undefined
    const { items, total } = await orderService.listAll(page, limit, status)
    res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    })
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    const order = await orderService.updateStatus(req.params.orderNumber, req.body.status, req.body.note)
    res.json({ success: true, data: order, message: `Order moved to ${req.body.status}.` })
  },

  async setTracking(req: Request, res: Response): Promise<void> {
    const order = await orderService.setTracking(req.params.orderNumber, req.body.trackingNumber)
    res.json({ success: true, data: order, message: 'Tracking number saved.' })
  },
}
