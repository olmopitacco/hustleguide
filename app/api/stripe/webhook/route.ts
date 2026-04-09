import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return Response.json({ error: `Webhook error: ${(err as Error).message}` }, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id
      if (userId) {
        await supabase.from('users').update({
          subscription_status: 'pro',
          stripe_customer_id: session.customer as string,
        }).eq('id', userId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const { data: userData } = await supabase
        .from('users').select('id').eq('stripe_customer_id', customerId).single()
      if (userData) {
        const status = sub.status === 'active' ? 'pro' : 'free'
        const periodEnd = sub.items?.data?.[0]?.current_period_end
        const endDate = periodEnd ? new Date(periodEnd * 1000).toISOString() : null
        await supabase.from('users').update({
          subscription_status: status,
          subscription_end_date: endDate,
        }).eq('id', userData.id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const { data: userData } = await supabase
        .from('users').select('id').eq('stripe_customer_id', customerId).single()
      if (userData) {
        await supabase.from('users').update({
          subscription_status: 'free',
          subscription_end_date: null,
        }).eq('id', userData.id)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const { data: userData } = await supabase
        .from('users').select('id').eq('stripe_customer_id', customerId).single()
      if (userData) {
        await supabase.from('users').update({ subscription_status: 'past_due' }).eq('id', userData.id)
      }
      break
    }
  }

  return Response.json({ received: true })
}
