import { brand } from '../../data/content'

export function WhatsAppDock() {
  return (
    <a
      href={`https://wa.me/${brand.whatsapp}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Valerius on WhatsApp"
      className="fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center border border-line bg-paper text-ink shadow-lg"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M12 3a9 9 0 00-7.8 13.5L3 21l4.7-1.2A9 9 0 1012 3z" />
        <path d="M8.8 9.2c0 3 3 6 6 6l1.4-1.4-2-1.3-1 .7c-.8-.4-1.7-1.3-2.1-2.1l.7-1-1.3-2-1.7 1.1z" strokeWidth="1.2" />
      </svg>
    </a>
  )
}
