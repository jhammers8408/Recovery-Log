const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const config = {
  api: {
    bodyParser: false,
  },
}

async function buffer(readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method !== 'POST') return res.status(405).end()

  const sig = req.headers['stripe-signature']
  const buf = await buffer(req)
  let event

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.log('Webhook error:', err.message)
    return res.status(400).json({ error: err.message })
  }

  console.log('Webhook event type:', event.type)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata.userId
    console.log('Checkout completed for user:', userId)

    const { error } = await supabase.from('subscriptions').upsert({
      user_id: userId,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      status: 'active',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    if (error) console.log('Supabase error:', error)
    else console.log('Subscription activated!')
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    await supabase.from('subscriptions')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('stripe_subscription_id', subscription.id)
  }

  return res.status(200).json({ received: true })
}
