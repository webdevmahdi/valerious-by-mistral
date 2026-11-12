import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import type { AuthTokens, JwtPayload, UserRole } from '../types'

export function signTokens(userId: string, role: UserRole): AuthTokens {
  const payload: Omit<JwtPayload, 'type'> = { sub: userId, role }
  return {
    accessToken: jwt.sign({ ...payload, type: 'access' }, env.jwt.accessSecret, {
      expiresIn: env.jwt.accessExpiresIn,
    } as jwt.SignOptions),
    refreshToken: jwt.sign({ ...payload, type: 'refresh' }, env.jwt.refreshSecret, {
      expiresIn: env.jwt.refreshExpiresIn,
    } as jwt.SignOptions),
  }
}

export function verifyToken(token: string, type: 'access' | 'refresh'): JwtPayload {
  const secret = type === 'access' ? env.jwt.accessSecret : env.jwt.refreshSecret
  const payload = jwt.verify(token, secret) as JwtPayload
  if (payload.type !== type) {
    throw new Error('Token type mismatch')
  }
  return payload
}
