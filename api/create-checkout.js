const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    console.log('Stripe key exists:', !!process.env.STRIPE_SECRET_KEY)
    console.log('Price ID exists:', !!process.env.STRIPE_PRICE_ID)
    console.log('Request body:', req.body)

    const { userId, email } = req.body

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      }],
      customer_email: email,
      metadata: { userId },
      success_url: `https://recovery-log-gamma.vercel.app/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://recovery-log-gamma.vercel.app/?canceled=true`,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.log('Stripe error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
