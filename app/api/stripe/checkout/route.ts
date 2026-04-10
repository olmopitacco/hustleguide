import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_PRICE_ID, STRIPE_ANNUAL_PRICE_ID, APP_URL } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const plan: 'monthly' | 'annual' = body.plan === 'annual' ? 'annual' : 'monthly'
    const priceId = plan === 'annual' ? STRIPE_ANNUAL_PRICE_ID : STRIPE_PRICE_ID

    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    let customerId = userData?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData?.email ?? user.email ?? '',
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/dashboard?upgraded=1`,
      cancel_url: `${APP_URL}/pricing`,
      metadata: { supabase_user_id: user.id },
    })

    return Response.json({ url: session.url })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
