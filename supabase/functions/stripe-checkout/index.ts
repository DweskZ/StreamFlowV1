import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Stripe checkout function called')
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the request
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('User authentication error:', userError)
      throw new Error('User not authenticated')
    }

    console.log('User authenticated:', user.id)

    const { planId, successUrl, cancelUrl } = await req.json()
    console.log('Request data:', { planId, successUrl, cancelUrl })

    if (!planId) {
      throw new Error('Plan ID is required')
    }

    // Get plan details from database
    console.log('Fetching plan with ID:', planId)
    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError) {
      console.error('Plan fetch error:', planError)
      throw new Error(`Plan fetch error: ${planError.message}`)
    }

    if (!plan) {
      console.error('Plan not found for ID:', planId)
      throw new Error('Plan not found')
    }

    console.log('Plan found:', { id: plan.id, name: plan.name, price: plan.price })

    if (!plan.stripe_price_id) {
      throw new Error('Plan does not have a Stripe price ID configured')
    }

    // Get or create Stripe customer
    console.log('Checking existing subscription for user:', user.id)
    let { data: subscription, error: subError } = await supabaseClient
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (subError && subError.code !== 'PGRST116') {
      console.error('Subscription fetch error:', subError)
    }

    let customerId = subscription?.stripe_customer_id

    if (!customerId) {
      console.log('Creating new Stripe customer for user:', user.id)
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id
      console.log('Stripe customer created:', customerId)

      // Save customer ID to database
      const { error: upsertError } = await supabaseClient
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          subscription_plan_id: planId,
          stripe_customer_id: customerId,
          status: 'incomplete',
        })

      if (upsertError) {
        console.error('Error saving customer ID:', upsertError)
      }
    } else {
      console.log('Using existing customer:', customerId)
    }

    // Create checkout session
    console.log('Creating Stripe checkout session')
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: plan.interval_type === 'one_time' ? 'payment' : 'subscription',
      success_url: successUrl || `${req.headers.get('origin')}/app/payment-success?success=true`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/app/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
      subscription_data: plan.interval_type !== 'one_time' ? {
        metadata: {
          user_id: user.id,
          plan_id: planId,
        },
      } : undefined,
    })

    console.log('Checkout session created:', session.id)

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in stripe-checkout function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 