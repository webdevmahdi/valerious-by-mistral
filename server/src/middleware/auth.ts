import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../utils/jwt'
import { ApiError } from '../utils/ApiError'
import type { JwtPayload } from '../types'

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    next(ApiError.unauthorized())
    return
  }
  try {
    const payload = verifyToken(header.slice(7), 'access')
    ;(req as Request & { user: JwtPayload }).user = payload
    next()
  } catch {
    next(ApiError.unauthorized('Session expired. Please sign in again.'))
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as Request & { user?: JwtPayload }).user
    if (!user) {
      next(ApiError.unauthorized())
      return
    }
    if (!roles.includes(user.role)) {
      next(ApiError.forbidden())
      return
    }
    next()
  }
}
