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
      console.error('No stripe signature found')
      return new Response('No signature', { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
      console.log('Webhook event received:', event.type)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Invalid signature', { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('Processing checkout.session.completed')
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        console.log('Session data:', {
          userId,
          customerId,
          subscriptionId,
          paymentIntent: session.payment_intent
        })

        if (!userId) {
          console.error('No userId in session metadata')
          break
        }

        if (!subscriptionId) {
          console.error('No subscription ID in session')
          break
        }

        // Obtener detalles de la suscripción
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id

        console.log('Subscription details:', {
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
          console.error('Plan not found in database:', priceId, planError)
          break
        }

        console.log('Found plan:', plan.name)

        // Crear o actualizar la suscripción del usuario
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            subscription_plan_id: plan.id, // Corregido: usar subscription_plan_id
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            status: subscription.status, // Usar el status real de Stripe
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError)
        } else {
          console.log('Subscription updated successfully')
        }

        // Registrar el pago con subscription_id
        const paymentData: any = {
          user_id: userId,
          subscription_id: subscriptionId, // Agregar el subscription_id
          stripe_payment_intent_id: session.payment_intent as string,
          stripe_invoice_id: session.invoice as string,
          amount: session.amount_total ? session.amount_total / 100 : 0, // Convertir de centavos
          currency: session.currency,
          status: 'succeeded',
          created_at: new Date().toISOString()
        }

        // Solo agregar subscription_plan_id si la columna existe
        // (esto se manejará automáticamente por Supabase)
        try {
          const { error: paymentError } = await supabase
            .from('payment_history')
            .insert(paymentData)

          if (paymentError) {
            console.error('Error recording payment:', paymentError)
            // Intentar sin subscription_plan_id si falla
            delete paymentData.subscription_plan_id
            const { error: retryError } = await supabase
              .from('payment_history')
              .insert(paymentData)
            
            if (retryError) {
              console.error('Error recording payment (retry):', retryError)
            } else {
              console.log('Payment recorded successfully (without plan_id)')
            }
          } else {
            console.log('Payment recorded successfully')
          }
        } catch (error) {
          console.error('Error in payment recording:', error)
        }

        break
      }

      case 'customer.subscription.updated': {
        console.log('Processing customer.subscription.updated')
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
        } else {
          console.log('Subscription status updated to:', subscription.status)
        }

        break
      }

      case 'customer.subscription.deleted': {
        console.log('Processing customer.subscription.deleted')
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
        } else {
          console.log('Subscription cancelled successfully')
        }

        break
      }

      case 'invoice.payment_succeeded': {
        console.log('Processing invoice.payment_succeeded')
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string
        
        // Buscar la suscripción en nuestra base de datos
        const { data: userSub } = await supabase
          .from('user_subscriptions')
          .select('user_id, subscription_plan_id') // Corregido: usar subscription_plan_id
          .eq('stripe_subscription_id', subscriptionId)
          .single()

        if (userSub) {
          // Registrar el pago exitoso (sin subscription_plan_id si no existe)
          const paymentData: any = {
            user_id: userSub.user_id,
            stripe_payment_intent_id: invoice.payment_intent as string,
            stripe_invoice_id: invoice.id,
            amount: invoice.amount_paid ? invoice.amount_paid / 100 : 0, // Convertir de centavos
            currency: invoice.currency,
            status: 'succeeded',
            created_at: new Date().toISOString()
          }

          try {
            const { error } = await supabase
              .from('payment_history')
              .insert(paymentData)

            if (error) {
              console.error('Error recording payment:', error)
            } else {
              console.log('Invoice payment recorded successfully')
            }
          } catch (error) {
            console.error('Error in invoice payment recording:', error)
          }
        }

        break
      }

      case 'invoice.payment_failed': {
        console.log('Processing invoice.payment_failed')
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string
        
        // Buscar la suscripción en nuestra base de datos
        const { data: userSub } = await supabase
          .from('user_subscriptions')
          .select('user_id, subscription_plan_id') // Corregido: usar subscription_plan_id
          .eq('stripe_subscription_id', subscriptionId)
          .single()

        if (userSub) {
          // Registrar el pago fallido (sin subscription_plan_id si no existe)
          const paymentData: any = {
            user_id: userSub.user_id,
            stripe_payment_intent_id: invoice.payment_intent as string,
            stripe_invoice_id: invoice.id,
            amount: invoice.amount_due ? invoice.amount_due / 100 : 0, // Convertir de centavos
            currency: invoice.currency,
            status: 'failed',
            created_at: new Date().toISOString()
          }

          try {
            const { error } = await supabase
              .from('payment_history')
              .insert(paymentData)

            if (error) {
              console.error('Error recording failed payment:', error)
            } else {
              console.log('Failed payment recorded successfully')
            }
          } catch (error) {
            console.error('Error in failed payment recording:', error)
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
    --header 'Authorization: Bearer YOUR_ANON_KEY_HERE' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
