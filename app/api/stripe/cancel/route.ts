import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!userData?.stripe_customer_id) {
      return Response.json({ error: 'No active subscription' }, { status: 400 })
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: userData.stripe_customer_id,
      status: 'active',
      limit: 1,
    })

    if (subscriptions.data.length === 0) {
      return Response.json({ error: 'No active subscription found' }, { status: 400 })
    }

    const sub = subscriptions.data[0] as Stripe.Subscription
    await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true })

    const periodEnd = sub.items?.data?.[0]?.current_period_end
    const endDate = periodEnd ? new Date(periodEnd * 1000).toISOString() : null
    if (endDate) {
      await supabase.from('users').update({ subscription_end_date: endDate }).eq('id', user.id)
    }

    return Response.json({ cancelled: true, end_date: endDate })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
