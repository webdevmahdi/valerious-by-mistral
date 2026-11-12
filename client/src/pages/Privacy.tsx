import { PolicyPage } from './PolicyPage'

export function Privacy() {
  return (
    <PolicyPage
      title="Privacy Policy"
      description="How Valerius collects, uses and protects your personal information."
      path="/privacy"
      intro="We collect the minimum information required to run a clothing store well — and none of the rest. This policy explains exactly what that means."
      sections={[
        {
          heading: 'What we collect',
          paragraphs: ['Only what is necessary to fulfil orders and, with your consent, to tell you about new work:'],
          list: [
            'Name, phone, email — for orders, tracking and support',
            'Delivery address — to ship your order',
            'Order history — for returns, exchanges and warranty',
            'Marketing consent and preferences — only if you opt in',
            'Anonymous usage analytics — to improve the store',
          ],
        },
        {
          heading: 'What we never do',
          paragraphs: ['We never see or store your full card details; online payments are handled entirely by licensed providers (SSLCommerz, bKash, Nagad). We do not sell or rent personal data to anyone.'],
        },
        {
          heading: 'Cookies',
          paragraphs: ['Essential cookies keep your cart and session working. Analytics and marketing cookies load only after consent where required, and you can withdraw consent at any time from your browser.'],
        },
        {
          heading: 'Your rights',
          paragraphs: ['You can request a copy of your data, correct it, or ask us to delete your account by writing to us. Order records needed for legal and warranty purposes may be retained as required by law.'],
        },
      ]}
    />
  )
}
