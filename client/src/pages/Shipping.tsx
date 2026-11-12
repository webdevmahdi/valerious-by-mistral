import { PolicyPage } from './PolicyPage'
import { shippingTiers } from '../data/content'

export function Shipping() {
  return (
    <PolicyPage
      title="Shipping Information"
      description="Valerius shipping — delivery times, costs and coverage inside and outside Dhaka."
      path="/shipping"
      intro="We ship across Bangladesh with tracked couriers. Every order receives tracking updates at each stage, from packing to delivery."
      sections={[
        {
          heading: 'Rates & times',
          paragraphs: ['Delivery charges are based on destination and service level:'],
          list: shippingTiers.map((t) => `${t.zone}: ${t.standard} standard, ${t.express !== '—' ? `${t.express} express` : 'no express'} — ${t.time}`),
        },
        {
          heading: 'Free delivery',
          paragraphs: ['Orders over ৳5,000 ship free to any destination in Bangladesh, using standard service.'],
        },
        {
          heading: 'Dispatch',
          paragraphs: [
            'Orders placed before 15:00 on a working day are dispatched the same day where stock allows. You will receive SMS and email updates when your order is confirmed, packed, shipped and out for delivery.',
          ],
        },
        {
          heading: 'International',
          paragraphs: [
            'International shipping is not yet available at launch. Join the newsletter to be notified when it opens.',
          ],
        },
      ]}
    />
  )
}
