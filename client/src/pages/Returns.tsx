import { PolicyPage } from './PolicyPage'

export function Returns() {
  return (
    <PolicyPage
      title="Returns & Exchange Policy"
      description="Valerius returns and exchanges — 7-day window, conditions, and how to request one."
      path="/returns"
      intro="If a piece does not work, we make returning it straightforward. Requests are handled from your account or the order tracking page."
      sections={[
        {
          heading: 'The 7-day window',
          paragraphs: ['Unworn, unwashed pieces with original tags attached can be returned within 7 days of delivery for an exchange or a refund to the original payment method.'],
        },
        {
          heading: 'Size exchanges',
          paragraphs: ['The first size exchange per order is free inside Dhaka. Exchanges are subject to stock availability; if the requested size is unavailable, we will refund the item.'],
        },
        {
          heading: 'Non-returnable items',
          paragraphs: ['For hygiene and practicality, the following cannot be returned:'],
          list: ['Items worn, washed or altered', 'Items with tags removed', 'Sale items (exchange only)', 'Final-sale clearance items'],
        },
        {
          heading: 'How to request',
          paragraphs: [
            'Open Order Tracking, enter your order number and phone, and choose “Request return / exchange”, or write to us from your account’s order history. Include the reason and whether you prefer exchange or refund.',
          ],
        },
        {
          heading: 'Refund timing',
          paragraphs: ['Refunds are issued within 3–5 working days of the returned item passing inspection. bKash/Nagad refunds are instant once processed; card refunds depend on your bank.'],
        },
      ]}
    />
  )
}
