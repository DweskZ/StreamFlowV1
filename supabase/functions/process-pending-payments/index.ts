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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
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

    // Obtener el token de autorización
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    })

    // Obtener el usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    console.log('👤 Procesando pagos pendientes para usuario:', user.email)

    // Buscar pagos recientes del usuario (últimas 24 horas)
    const { data: recentPayments, error: paymentsError } = await supabase
      .from('payment_history')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    if (paymentsError) {
      console.error('❌ Error obteniendo pagos recientes:', paymentsError)
      return new Response(JSON.stringify({ error: 'Failed to get recent payments' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    console.log('📊 Pagos recientes encontrados:', recentPayments?.length || 0)

    // Buscar sesiones de Stripe recientes para este usuario
    const sessions = await stripe.checkout.sessions.list({
      limit: 10,
      created: {
        gte: Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000)
      }
    })

    console.log('🔍 Sesiones de Stripe encontradas:', sessions.data.length)

    let processedCount = 0
    const results = []

    // Procesar cada sesión que coincida con el email del usuario
    for (const session of sessions.data) {
      if (session.customer_details?.email === user.email && session.status === 'complete') {
        console.log('🔄 Procesando sesión:', session.id)
        
        try {
          // Verificar si ya procesamos esta sesión
          const existingPayment = recentPayments?.find(p => 
            p.stripe_payment_intent_id === session.payment_intent
          )

          if (existingPayment) {
            console.log('⏭️ Sesión ya procesada:', session.id)
            continue
          }

          // Obtener información de la suscripción
          const subscription = session.subscription as Stripe.Subscription
          if (!subscription) {
            console.log('⚠️ No hay suscripción en la sesión:', session.id)
            continue
          }

          // Obtener el plan basado en el price_id
          const lineItems = session.line_items?.data
          if (!lineItems || lineItems.length === 0) {
            console.log('⚠️ No hay line items en la sesión:', session.id)
            continue
          }

          const priceId = lineItems[0].price?.id
          if (!priceId) {
            console.log('⚠️ No hay price ID en la sesión:', session.id)
            continue
          }

          // Buscar el plan por stripe_price_id
          const { data: plan, error: planError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('stripe_price_id', priceId)
            .single()

          if (planError || !plan) {
            console.error('❌ Plan no encontrado para price_id:', priceId)
            continue
          }

          // Actualizar o crear la suscripción del usuario
          const { error: subscriptionError } = await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: user.id,
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
            continue
          }

          // Registrar el pago
          const paymentData = {
            user_id: user.id,
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
          }

          processedCount++
          results.push({
            session_id: session.id,
            plan_name: plan.name,
            amount: paymentData.amount,
            status: 'processed'
          })

          console.log('✅ Sesión procesada exitosamente:', session.id)

        } catch (error) {
          console.error('❌ Error procesando sesión:', session.id, error)
          results.push({
            session_id: session.id,
            error: error.message,
            status: 'failed'
          })
        }
      }
    }

    console.log('✅ Procesamiento completado. Sesiones procesadas:', processedCount)

    return new Response(JSON.stringify({
      success: true,
      message: 'Pending payments processed',
      processed_count: processedCount,
      results
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('❌ Error procesando pagos pendientes:', error)
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