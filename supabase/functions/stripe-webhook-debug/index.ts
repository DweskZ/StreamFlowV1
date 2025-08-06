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
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    if (req.method !== 'POST') {
      // Guardar log de método no permitido
      await supabase.from('webhook_logs').insert({
        event_type: 'method_not_allowed',
        method: req.method,
        status: 'error',
        message: 'Method not allowed',
        created_at: new Date().toISOString()
      })
      return new Response('Method not allowed', { status: 405 })
    }

    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    // Guardar log de request recibido
    await supabase.from('webhook_logs').insert({
      event_type: 'request_received',
      method: req.method,
      has_signature: !!signature,
      body_length: body.length,
      status: 'info',
      message: 'Request received',
      created_at: new Date().toISOString()
    })

    if (!signature) {
      await supabase.from('webhook_logs').insert({
        event_type: 'no_signature',
        status: 'error',
        message: 'No stripe signature found',
        created_at: new Date().toISOString()
      })
      return new Response('No signature', { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
      
      // Guardar log de evento verificado
      await supabase.from('webhook_logs').insert({
        event_type: 'event_verified',
        stripe_event_type: event.type,
        stripe_event_id: event.id,
        status: 'success',
        message: 'Event verified successfully',
        created_at: new Date().toISOString()
      })
      
    } catch (err) {
      await supabase.from('webhook_logs').insert({
        event_type: 'signature_verification_failed',
        status: 'error',
        message: 'Signature verification failed',
        error_details: JSON.stringify(err),
        created_at: new Date().toISOString()
      })
      return new Response('Invalid signature', { status: 400 })
    }

    // Guardar el evento completo para debugging
    await supabase.from('webhook_logs').insert({
      event_type: 'event_data',
      stripe_event_type: event.type,
      stripe_event_id: event.id,
      status: 'info',
      message: 'Event data received',
      event_data: JSON.stringify(event),
      created_at: new Date().toISOString()
    })

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Guardar log de procesamiento
        await supabase.from('webhook_logs').insert({
          event_type: 'processing_checkout',
          stripe_event_type: event.type,
          stripe_event_id: event.id,
          status: 'info',
          message: 'Processing checkout.session.completed',
          session_data: JSON.stringify({
            id: session.id,
            customer_email: session.customer_email,
            customer: session.customer,
            subscription: session.subscription,
            payment_intent: session.payment_intent,
            metadata: session.metadata
          }),
          created_at: new Date().toISOString()
        })

        const userId = session.metadata?.userId
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (!userId) {
          await supabase.from('webhook_logs').insert({
            event_type: 'no_user_id',
            stripe_event_id: event.id,
            status: 'error',
            message: 'No userId in session metadata',
            created_at: new Date().toISOString()
          })
          break
        }

        if (!subscriptionId) {
          await supabase.from('webhook_logs').insert({
            event_type: 'no_subscription_id',
            stripe_event_id: event.id,
            status: 'error',
            message: 'No subscription ID in session',
            created_at: new Date().toISOString()
          })
          break
        }

        // Obtener detalles de la suscripción
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const priceId = subscription.items.data[0].price.id

          await supabase.from('webhook_logs').insert({
            event_type: 'subscription_retrieved',
            stripe_event_id: event.id,
            status: 'info',
            message: 'Subscription retrieved from Stripe',
            subscription_data: JSON.stringify({
              priceId,
              status: subscription.status,
              currentPeriodStart: subscription.current_period_start,
              currentPeriodEnd: subscription.current_period_end
            }),
            created_at: new Date().toISOString()
          })

          // Buscar el plan en nuestra base de datos
          const { data: plan, error: planError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('stripe_price_id', priceId)
            .single()

          if (planError || !plan) {
            await supabase.from('webhook_logs').insert({
              event_type: 'plan_not_found',
              stripe_event_id: event.id,
              status: 'error',
              message: 'Plan not found in database',
              price_id: priceId,
              error_details: JSON.stringify(planError),
              created_at: new Date().toISOString()
            })
            break
          }

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
            await supabase.from('webhook_logs').insert({
              event_type: 'subscription_update_error',
              stripe_event_id: event.id,
              status: 'error',
              message: 'Error updating subscription',
              error_details: JSON.stringify(subscriptionError),
              created_at: new Date().toISOString()
            })
          } else {
            await supabase.from('webhook_logs').insert({
              event_type: 'subscription_updated',
              stripe_event_id: event.id,
              status: 'success',
              message: 'Subscription updated successfully',
              created_at: new Date().toISOString()
            })
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
            await supabase.from('webhook_logs').insert({
              event_type: 'payment_record_error',
              stripe_event_id: event.id,
              status: 'error',
              message: 'Error recording payment',
              error_details: JSON.stringify(paymentError),
              created_at: new Date().toISOString()
            })
          } else {
            await supabase.from('webhook_logs').insert({
              event_type: 'payment_recorded',
              stripe_event_id: event.id,
              status: 'success',
              message: 'Payment recorded successfully',
              created_at: new Date().toISOString()
            })
          }

        } catch (stripeError) {
          await supabase.from('webhook_logs').insert({
            event_type: 'stripe_api_error',
            stripe_event_id: event.id,
            status: 'error',
            message: 'Error calling Stripe API',
            error_details: JSON.stringify(stripeError),
            created_at: new Date().toISOString()
          })
        }

        break
      }

      default:
        await supabase.from('webhook_logs').insert({
          event_type: 'unhandled_event',
          stripe_event_type: event.type,
          stripe_event_id: event.id,
          status: 'info',
          message: `Unhandled event type: ${event.type}`,
          created_at: new Date().toISOString()
        })
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (error) {
    await supabase.from('webhook_logs').insert({
      event_type: 'webhook_error',
      status: 'error',
      message: 'Webhook error',
      error_details: JSON.stringify(error),
      created_at: new Date().toISOString()
    })
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
}) 