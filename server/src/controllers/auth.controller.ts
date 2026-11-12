import type { Request, Response } from 'express'
import { authService } from '../services/authService'
import { addressRepository } from '../repositories/user.repository'
import type { JwtPayload } from '../types'

function currentUser(req: Request): JwtPayload {
  return (req as Request & { user: JwtPayload }).user
}

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const result = await authService.register(req.body)
    res.status(201).json({ success: true, data: result, message: 'Welcome to VALERIUS.' })
  },

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body.email, req.body.password)
    res.json({ success: true, data: result, message: 'Signed in.' })
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const tokens = await authService.refresh(req.body.refreshToken)
    res.json({ success: true, data: tokens })
  },

  async me(req: Request, res: Response): Promise<void> {
    const user = await authService.me(currentUser(req).sub)
    res.json({ success: true, data: user })
  },

  async addresses(req: Request, res: Response): Promise<void> {
    const list = await addressRepository.listForUser(currentUser(req).sub)
    res.json({ success: true, data: list })
  },

  async createAddress(req: Request, res: Response): Promise<void> {
    const address = await addressRepository.create(currentUser(req).sub, req.body)
    res.status(201).json({ success: true, data: address })
  },

  async removeAddress(req: Request, res: Response): Promise<void> {
    await addressRepository.remove(currentUser(req).sub, req.params.id)
    res.json({ success: true, data: null, message: 'Address removed.' })
  },
}
