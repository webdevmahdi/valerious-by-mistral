import { PolicyPage } from './PolicyPage'

export function Terms() {
  return (
    <PolicyPage
      title="Terms & Conditions"
      description="The terms that govern purchases from Valerius."
      path="/terms"
      intro="By using this website and placing an order, you agree to the terms below. They are written to be read, not to hide anything."
      sections={[
        {
          heading: 'Orders',
          paragraphs: ['An order is accepted when its status becomes CONFIRMED. We may decline or cancel an order if stock is unavailable, the payment cannot be verified, or the delivery address is outside our service area. In that case any paid amount is refunded in full.'],
        },
        {
          heading: 'Pricing',
          paragraphs: ['All prices are in Bangladeshi Taka (BDT) and include VAT where applicable. The total shown at checkout — including delivery and any discount — is the amount you pay. Online prices may differ from in-store prices.'],
        },
        {
          heading: 'Payment',
          paragraphs: ['Cash on Delivery, bKash, Nagad and cards via SSLCommerz are accepted. Orders are dispatched after payment is confirmed; COD orders may require a confirmation call.'],
        },
        {
          heading: 'Product presentation',
          paragraphs: ['We photograph and describe products as accurately as possible. Colours may vary slightly between screens. Minor variations in fabric and stitching are characteristics of garment production, not defects.'],
        },
        {
          heading: 'Liability',
          paragraphs: ['Our liability for any order is limited to the value of that order. Nothing in these terms limits your statutory consumer rights.'],
        },
        {
          heading: 'Governing law',
          paragraphs: ['These terms are governed by the laws of Bangladesh, and disputes fall under the jurisdiction of the courts of Dhaka.'],
        },
      ]}
    />
  )
}
