import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env'
import { ApiError } from '../utils/ApiError'
import type { ApiFailure } from '../types'

export function notFoundHandler(_req: Request, res: Response): void {
  const body: ApiFailure = {
    success: false,
    error: { code: 'NOT_FOUND', message: 'The requested endpoint does not exist.' },
  }
  res.status(404).json(body)
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    const body: ApiFailure = {
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    }
    res.status(err.statusCode).json(body)
    return
  }

  if (env.nodeEnv !== 'test') {
    console.error(err)
  }

  const body: ApiFailure = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.nodeEnv === 'production' ? 'Something went wrong on our side.' : String(err),
    },
  }
  res.status(500).json(body)
}
