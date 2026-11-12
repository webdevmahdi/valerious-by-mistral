import { ApiError } from '../../utils/ApiError'
import { env } from '../../config/env'
import type { PaymentMethod } from '../../types'

export interface PaymentInitiation {
  method: PaymentMethod
  amountMinor: number
  orderNumber: string
  reference: string
  redirectUrl?: string
  instructions?: string
}

export interface PaymentProvider {
  readonly method: PaymentMethod
  initiate(amountMinor: number, orderNumber: string): Promise<PaymentInitiation>
}

const codProvider: PaymentProvider = {
  method: 'cod',
  async initiate(amountMinor, orderNumber) {
    return {
      method: 'cod',
      amountMinor,
      orderNumber,
      reference: `COD-${orderNumber}`,
      instructions: 'Pay in cash when your order arrives. Please keep the exact amount ready.',
    }
  },
}

const bkashProvider: PaymentProvider = {
  method: 'bkash',
  async initiate(amountMinor, orderNumber) {
    if (!env.payments.bkashAppKey) {
      return {
        method: 'bkash',
        amountMinor,
        orderNumber,
        reference: `BKASH-MANUAL-${orderNumber}`,
        instructions: 'Send the total via bKash (Send Money) to 01700-000000 and keep the transaction ID.',
      }
    }
    return {
      method: 'bkash',
      amountMinor,
      orderNumber,
      reference: `BKASH-${orderNumber}`,
      redirectUrl: `/payment/bkash/checkout?order=${orderNumber}`,
    }
  },
}

const nagadProvider: PaymentProvider = {
  method: 'nagad',
  async initiate(amountMinor, orderNumber) {
    if (!env.payments.nagadPublicKey) {
      return {
        method: 'nagad',
        amountMinor,
        orderNumber,
        reference: `NAGAD-MANUAL-${orderNumber}`,
        instructions: 'Send the total via Nagad (Send Money) to 01700-000000 and keep the transaction ID.',
      }
    }
    return {
      method: 'nagad',
      amountMinor,
      orderNumber,
      reference: `NAGAD-${orderNumber}`,
      redirectUrl: `/payment/nagad/checkout?order=${orderNumber}`,
    }
  },
}

const cardProvider: PaymentProvider = {
  method: 'card',
  async initiate(amountMinor, orderNumber) {
    if (!env.payments.sslCommerzStoreId) {
      throw ApiError.paymentFailed('Card payments are not configured yet. Please choose bKash, Nagad, or cash on delivery.')
    }
    const gateway = env.payments.sslCommerzSandbox ? 'https://sandbox.sslcommerz.com' : 'https://securepay.sslcommerz.com'
    return {
      method: 'card',
      amountMinor,
      orderNumber,
      reference: `SSLCZ-${orderNumber}`,
      redirectUrl: `${gateway}/gwprocess/v4/api.php?order=${orderNumber}`,
    }
  },
}

const providers: Record<PaymentMethod, PaymentProvider> = {
  cod: codProvider,
  bkash: bkashProvider,
  nagad: nagadProvider,
  card: cardProvider,
}

export function paymentProviderFor(method: PaymentMethod): PaymentProvider {
  const provider = providers[method]
  if (!provider) throw ApiError.badRequest('Unsupported payment method.')
  return provider
}
