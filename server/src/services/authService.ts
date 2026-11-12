import bcrypt from 'bcryptjs'
import { userRepository } from '../repositories/user.repository'
import { signTokens } from '../utils/jwt'
import { ApiError } from '../utils/ApiError'
import { env } from '../config/env'
import type { AuthTokens, UserRole } from '../types'

interface RegisterInput {
  name: string
  email: string
  password: string
  phone?: string
  marketingConsent?: boolean
}

function publicUser(user: { _id: unknown; name: string; email: string; phone?: string; role: UserRole; marketingConsent: boolean; createdAt: Date }) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    marketingConsent: user.marketingConsent,
    createdAt: user.createdAt,
  }
}

export const authService = {
  async register(input: RegisterInput): Promise<{ user: ReturnType<typeof publicUser>; tokens: AuthTokens }> {
    const existing = await userRepository.findByEmail(input.email)
    if (existing) throw ApiError.conflict('An account with this email already exists.')

    const passwordHash = await bcrypt.hash(input.password, 12)
    const isFirstUser = (await userRepository.countAdmins()) === 0
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone,
      role: isFirstUser ? 'ADMIN' : undefined,
      marketingConsent: input.marketingConsent ?? false,
    })

    return { user: publicUser(user), tokens: signTokens(String(user._id), user.role) }
  },

  async login(email: string, password: string): Promise<{ user: ReturnType<typeof publicUser>; tokens: AuthTokens }> {
    const user = await userRepository.findByEmail(email)
    if (!user || !(await user.comparePassword(password))) {
      throw ApiError.unauthorized('Incorrect email or password.')
    }
    return { user: publicUser(user), tokens: signTokens(String(user._id), user.role) }
  },

  async me(userId: string): Promise<ReturnType<typeof publicUser>> {
    const user = await userRepository.findById(userId)
    if (!user) throw ApiError.unauthorized('Session expired. Please sign in again.')
    return publicUser(user)
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const { verifyToken } = await import('../utils/jwt')
    const payload = verifyToken(refreshToken, 'refresh')
    const user = await userRepository.findById(payload.sub)
    if (!user) throw ApiError.unauthorized('Session expired. Please sign in again.')
    return signTokens(String(user._id), user.role)
  },

  async ensureAdminSeed(): Promise<void> {
    const existing = await userRepository.findByEmail(env.adminSeedEmail)
    if (existing) return
    const passwordHash = await bcrypt.hash(env.adminSeedPassword, 12)
    await userRepository.create({
      name: 'Store Administrator',
      email: env.adminSeedEmail,
      passwordHash,
      role: 'ADMIN',
    })
  },
}
