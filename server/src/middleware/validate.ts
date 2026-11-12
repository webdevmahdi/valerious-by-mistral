import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema } from 'zod'
import { ApiError } from '../utils/ApiError'

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req[source])
    if (!parsed.success) {
      next(ApiError.badRequest('Please check the highlighted fields.', parsed.error.flatten().fieldErrors))
      return
    }
    if (source === 'body') {
      ;(req as Request & { body: unknown }).body = parsed.data
    } else {
      Object.assign(req[source] as Record<string, unknown>, parsed.data)
    }
    next()
  }
}
