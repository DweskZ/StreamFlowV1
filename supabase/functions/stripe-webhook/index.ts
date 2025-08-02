import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14.21.0"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return new Response('No signature', { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Invalid signature', { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (!userId) {
          console.error('No userId in session metadata')
          break
        }

        // Obtener detalles de la suscripción
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const planId = subscription.items.data[0].price.id

        // Buscar el plan en nuestra base de datos
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('stripe_price_id', planId)
          .single()

        if (!plan) {
          console.error('Plan not found in database:', planId)
          break
        }

        // Crear o actualizar la suscripción del usuario
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            plan_id: plan.id,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            status: 'active',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError)
        }

        // Registrar el pago
        const { error: paymentError } = await supabase
          .from('payment_history')
          .insert({
            user_id: userId,
            plan_id: plan.id,
            stripe_payment_intent_id: session.payment_intent as string,
            amount: session.amount_total,
            currency: session.currency,
            status: 'completed',
            created_at: new Date().toISOString()
          })

        if (paymentError) {
          console.error('Error recording payment:', paymentError)
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Buscar la suscripción en nuestra base de datos
        const { data: userSub, error: findError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (findError || !userSub) {
          console.error('Subscription not found in database:', subscription.id)
          break
        }

        // Actualizar el estado de la suscripción
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('Error updating subscription status:', updateError)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Marcar la suscripción como cancelada
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error cancelling subscription:', error)
        }

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string
        
        // Buscar la suscripción en nuestra base de datos
        const { data: userSub } = await supabase
          .from('user_subscriptions')
          .select('user_id, plan_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single()

        if (userSub) {
          // Registrar el pago exitoso
          const { error } = await supabase
            .from('payment_history')
            .insert({
              user_id: userSub.user_id,
              plan_id: userSub.plan_id,
              stripe_payment_intent_id: invoice.payment_intent as string,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: 'completed',
              created_at: new Date().toISOString()
            })

          if (error) {
            console.error('Error recording payment:', error)
          }
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string
        
        // Buscar la suscripción en nuestra base de datos
        const { data: userSub } = await supabase
          .from('user_subscriptions')
          .select('user_id, plan_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single()

        if (userSub) {
          // Registrar el pago fallido
          const { error } = await supabase
            .from('payment_history')
            .insert({
              user_id: userSub.user_id,
              plan_id: userSub.plan_id,
              stripe_payment_intent_id: invoice.payment_intent as string,
              amount: invoice.amount_due,
              currency: invoice.currency,
              status: 'failed',
              created_at: new Date().toISOString()
            })

          if (error) {
            console.error('Error recording failed payment:', error)
          }
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stripe-webhook' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
