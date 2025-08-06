import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14.21.0"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Usar el secret del webhook temporal para testing
// Reemplaza esto con el secret del webhook temporal que crees
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    console.log('🎉 WEBHOOK TEST: Request received')
    console.log('🎉 WEBHOOK TEST: Method:', req.method)
    console.log('🎉 WEBHOOK TEST: Has signature:', !!signature)
    console.log('🎉 WEBHOOK TEST: Body length:', body.length)

    if (!signature) {
      console.error('❌ WEBHOOK TEST: No stripe signature found')
      return new Response('No signature', { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
      console.log('🎉 WEBHOOK TEST: Event received:', event.type)
      console.log('🎉 WEBHOOK TEST: Event ID:', event.id)
    } catch (err) {
      console.error('❌ WEBHOOK TEST: Signature verification failed:', err)
      console.error('❌ WEBHOOK TEST: Error details:', JSON.stringify(err, null, 2))
      return new Response('Invalid signature', { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Log del evento completo para debugging
    console.log('🎉 WEBHOOK TEST: Full event data:', JSON.stringify(event, null, 2))

    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('🎉 WEBHOOK TEST: Processing checkout.session.completed')
        const session = event.data.object as Stripe.Checkout.Session
        
        console.log('🎉 WEBHOOK TEST: Session data:', {
          id: session.id,
          customer_email: session.customer_email,
          customer: session.customer,
          subscription: session.subscription,
          payment_intent: session.payment_intent,
          metadata: session.metadata
        })

        const userId = session.metadata?.userId
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (!userId) {
          console.error('❌ WEBHOOK TEST: No userId in session metadata')
          break
        }

        if (!subscriptionId) {
          console.error('❌ WEBHOOK TEST: No subscription ID in session')
          break
        }

        console.log('🎉 WEBHOOK TEST: User ID:', userId)
        console.log('🎉 WEBHOOK TEST: Subscription ID:', subscriptionId)

        // Obtener detalles de la suscripción
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id

        console.log('🎉 WEBHOOK TEST: Subscription details:', {
          priceId,
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end
        })

        // Buscar el plan en nuestra base de datos
        const { data: plan, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('stripe_price_id', priceId)
          .single()

        if (planError || !plan) {
          console.error('❌ WEBHOOK TEST: Plan not found in database:', priceId, planError)
          break
        }

        console.log('🎉 WEBHOOK TEST: Found plan:', plan.name)

        // Crear o actualizar la suscripción del usuario
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            subscription_plan_id: plan.id,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })

        if (subscriptionError) {
          console.error('❌ WEBHOOK TEST: Error updating subscription:', subscriptionError)
        } else {
          console.log('✅ WEBHOOK TEST: Subscription updated successfully')
        }

        // Registrar el pago
        const paymentData = {
          user_id: userId,
          stripe_payment_intent_id: session.payment_intent as string,
          stripe_invoice_id: session.invoice as string,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency,
          status: 'succeeded',
          created_at: new Date().toISOString()
        }

        const { error: paymentError } = await supabase
          .from('payment_history')
          .insert(paymentData)

        if (paymentError) {
          console.error('❌ WEBHOOK TEST: Error recording payment:', paymentError)
        } else {
          console.log('✅ WEBHOOK TEST: Payment recorded successfully')
        }

        break
      }

      default:
        console.log(`🎉 WEBHOOK TEST: Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error('❌ WEBHOOK TEST: Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
}) 