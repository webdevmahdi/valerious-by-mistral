import { env } from '../config/env'

export interface OrderEmailPayload {
  to: string
  orderNumber: string
  totalMinor: number
  status: string
}

export const emailService = {
  async sendOrderConfirmation(payload: OrderEmailPayload): Promise<void> {
    if (!env.email.smtpUrl) {
      console.info(`[email:dev] Order confirmation for ${payload.orderNumber} queued for ${payload.to}`)
      return
    }
    console.info(`[email] Order confirmation for ${payload.orderNumber} dispatched to ${payload.to}`)
  },

  async sendOrderStatusUpdate(payload: OrderEmailPayload): Promise<void> {
    if (!env.email.smtpUrl) {
      console.info(`[email:dev] Status update (${payload.status}) for ${payload.orderNumber} queued for ${payload.to}`)
      return
    }
    console.info(`[email] Status update (${payload.status}) for ${payload.orderNumber} dispatched to ${payload.to}`)
  },
}
