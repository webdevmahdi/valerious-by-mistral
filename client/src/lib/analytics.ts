type AnalyticsPayload = Record<string, string | number | boolean | undefined>

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined
const TIKTOK_PIXEL_ID = import.meta.env.VITE_TIKTOK_PIXEL_ID as string | undefined

type EventName =
  | 'page_view'
  | 'search'
  | 'product_view'
  | 'select_product'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'view_cart'
  | 'begin_checkout'
  | 'add_payment_info'
  | 'purchase'
  | 'wishlist_add'
  | 'coupon_apply'
  | 'review_submit'
  | 'filter_use'

interface Provider {
  name: string
  send: (event: string, payload: AnalyticsPayload) => void
}

const consoleProvider: Provider = {
  name: 'console',
  send: (event, payload) => {
    if (import.meta.env.DEV) {
      console.info(`[analytics] ${event}`, payload)
    }
  },
}

const gaProvider: Provider = {
  name: 'ga4',
  send: (event, payload) => {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void }
    if (GA_ID && w.gtag) w.gtag('event', event, payload)
  },
}

const metaProvider: Provider = {
  name: 'meta',
  send: (event, payload) => {
    const w = window as unknown as { fbq?: (...args: unknown[]) => void }
    if (META_PIXEL_ID && w.fbq) w.fbq('trackCustom', event, payload)
  },
}

const tiktokProvider: Provider = {
  name: 'tiktok',
  send: (event, payload) => {
    const w = window as unknown as { ttq?: { track: (...args: unknown[]) => void } }
    if (TIKTOK_PIXEL_ID && w.ttq) w.ttq.track(event, payload)
  },
}

const providers: Provider[] = [consoleProvider, gaProvider, metaProvider, tiktokProvider]

export const analytics = {
  track(event: EventName, payload: AnalyticsPayload = {}): void {
    for (const provider of providers) {
      try {
        provider.send(event, payload)
      } catch {
        /* analytics must never break the shopping experience */
      }
    }
  },
}
