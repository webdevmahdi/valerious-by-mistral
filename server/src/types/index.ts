
export type UserRole = 'CUSTOMER' | 'ADMIN'

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'card'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface JwtPayload {
  sub: string
  role: UserRole
  type: 'access' | 'refresh'
}

export interface AuthenticatedRequest extends Express.Request {
  user?: JwtPayload
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ApiSuccess<T> {
  success: true
  data: T
  message?: string
  pagination?: Pagination
}

export interface ApiFailure {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export interface OrderItemLine {
  product: unknown
  name: string
  sku: string
  size: string
  color: string
  unitPrice: number
  quantity: number
  total: number
}

export interface AddressInput {
  fullName: string
  phone: string
  email?: string
  line1: string
  line2?: string
  city: string
  postcode: string
  country: string
}

export interface CheckoutItemInput {
  productId: string
  size: string
  color: string
  quantity: number
}
