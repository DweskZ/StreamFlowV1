import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14.21.0"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  // Configurar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }

  try {
    // Verificar método
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // Obtener datos del request
    const { sessionId } = await req.json()
    
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID is required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    console.log('🔄 Procesando sesión:', sessionId)

    // Obtener la sesión de Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer', 'line_items']
    })

    console.log('📋 Sesión obtenida:', {
      id: session.id,
      status: session.status,
      customer_email: session.customer_details?.email,
      subscription_id: session.subscription as string
    })

    if (session.status !== 'complete') {
      return new Response(JSON.stringify({ 
        error: 'Session not complete',
        status: session.status 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // Obtener el usuario por email
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const customerEmail = session.customer_details?.email
    if (!customerEmail) {
      return new Response(JSON.stringify({ error: 'No customer email found' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // Buscar usuario por email usando la API de auth
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    
    const user = users?.find(u => u.email === customerEmail)
    
    if (userError || !user) {
      console.error('❌ Usuario no encontrado:', customerEmail)
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    const userId = user.id
    console.log('👤 Usuario encontrado:', { id: userId, email: customerEmail })

    // Obtener información de la suscripción
    const subscription = session.subscription as Stripe.Subscription
    if (!subscription) {
      return new Response(JSON.stringify({ error: 'No subscription found' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // Obtener el plan basado en el price_id
    const lineItems = session.line_items?.data
    if (!lineItems || lineItems.length === 0) {
      return new Response(JSON.stringify({ error: 'No line items found' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    const priceId = lineItems[0].price?.id
    if (!priceId) {
      return new Response(JSON.stringify({ error: 'No price ID found' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // Buscar el plan por stripe_price_id
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('stripe_price_id', priceId)
      .single()

    if (planError || !plan) {
      console.error('❌ Plan no encontrado para price_id:', priceId)
      return new Response(JSON.stringify({ error: 'Plan not found' }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    console.log('📦 Plan encontrado:', { id: plan.id, name: plan.name })

    // Actualizar o crear la suscripción del usuario
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        subscription_plan_id: plan.id,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })

    if (subscriptionError) {
      console.error('❌ Error actualizando suscripción:', subscriptionError)
      return new Response(JSON.stringify({ error: 'Failed to update subscription' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // Registrar el pago
    const paymentData = {
      user_id: userId,
      subscription_plan_id: plan.id,
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
      console.error('❌ Error registrando pago:', paymentError)
      // No fallamos aquí, solo loggeamos el error
    }

    console.log('✅ Pago procesado exitosamente')

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment processed successfully',
      subscription_id: subscription.id,
      user_id: userId,
      plan_name: plan.name
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('❌ Error procesando pago:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}) 