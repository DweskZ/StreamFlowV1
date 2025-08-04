import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14.21.0"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!

Deno.serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
        },
      })
    }

    const { method } = req
    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    
    if (method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey"
        }
      })
    }

    // Extraer el JWT del header Authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { 
          status: 401, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey"
          } 
        }
      )
    }
    
    // Crear cliente de Supabase con el JWT del usuario
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    })

    const { userId } = await req.json()

    if (!userId || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or action' }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey"
          } 
        }
      )
    }

    switch (action) {
      case 'get-subscription': {
        // Obtener la suscripción actual del usuario
        const { data: subscription, error } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            subscription_plans (
              id,
              name,
              description,
              price,
              currency,
              interval,
              features
            )
          `)
          .eq('user_id', userId)
          .eq('status', 'active')
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ subscription: null }),
            { 
              status: 200,
              headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey"
              }
            }
          )
        }

        return new Response(
          JSON.stringify({ subscription }),
          { 
            status: 200,
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey"
            }
          }
        )
      }

      case 'cancel-subscription': {
        // Buscar la suscripción activa del usuario
        const { data: userSub, error: findError } = await supabase
          .from('user_subscriptions')
          .select('stripe_subscription_id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single()

        if (findError || !userSub) {
          return new Response(
            JSON.stringify({ error: 'No active subscription found' }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          )
        }

        // Cancelar en Stripe
        const canceledSubscription = await stripe.subscriptions.cancel(
          userSub.stripe_subscription_id
        )

        // Actualizar en nuestra base de datos
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('stripe_subscription_id', userSub.stripe_subscription_id)

        if (updateError) {
          console.error('Error updating subscription status:', updateError)
          return new Response(
            JSON.stringify({ error: 'Failed to update subscription' }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          )
        }

        return new Response(
          JSON.stringify({ 
            message: 'Subscription cancelled successfully',
            subscription: canceledSubscription
          }),
          { 
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
      }

      case 'update-subscription': {
        const { newPriceId } = await req.json()
        
        if (!newPriceId) {
          return new Response(
            JSON.stringify({ error: 'Missing newPriceId' }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          )
        }

        // Buscar la suscripción activa del usuario
        const { data: userSub, error: findError } = await supabase
          .from('user_subscriptions')
          .select('stripe_subscription_id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single()

        if (findError || !userSub) {
          return new Response(
            JSON.stringify({ error: 'No active subscription found' }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          )
        }

        // Obtener la suscripción de Stripe
        const subscription = await stripe.subscriptions.retrieve(
          userSub.stripe_subscription_id
        )

        // Actualizar el precio en Stripe
        const updatedSubscription = await stripe.subscriptions.update(
          userSub.stripe_subscription_id,
          {
            items: [
              {
                id: subscription.items.data[0].id,
                price: newPriceId,
              },
            ],
          }
        )

        // Buscar el nuevo plan en nuestra base de datos
        const { data: newPlan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('stripe_price_id', newPriceId)
          .single()

        if (newPlan) {
          // Actualizar en nuestra base de datos
          const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({
              plan_id: newPlan.id,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('stripe_subscription_id', userSub.stripe_subscription_id)

          if (updateError) {
            console.error('Error updating subscription plan:', updateError)
          }
        }

        return new Response(
          JSON.stringify({ 
            message: 'Subscription updated successfully',
            subscription: updatedSubscription
          }),
          { 
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
      }

      case 'get-billing-portal': {
        // Buscar el customer ID del usuario
        const { data: userSub, error: findError } = await supabase
          .from('user_subscriptions')
          .select('stripe_customer_id')
          .eq('user_id', userId)
          .single()

        if (findError || !userSub?.stripe_customer_id) {
          return new Response(
            JSON.stringify({ error: 'No customer found' }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          )
        }

        // Crear sesión del portal de facturación
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: userSub.stripe_customer_id,
          return_url: `${req.headers.get('origin')}/profile`,
        })

        return new Response(
          JSON.stringify({ url: portalSession.url }),
          { 
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        )
    }

  } catch (error) {
    console.error('Subscription management error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/manage-subscription' \
    --header 'Authorization: Bearer YOUR_ANON_KEY_HERE' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
