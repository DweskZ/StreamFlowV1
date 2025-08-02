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
      throw new Error('User not authenticated')
    }

    const { action, subscriptionId, planId } = await req.json()

    if (!action) {
      throw new Error('Action is required')
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await supabaseClient
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
      throw new Error('No subscription found')
    }

    switch (action) {
      case 'cancel':
        return await handleCancelSubscription(subscription, supabaseClient)
      
      case 'resume':
        return await handleResumeSubscription(subscription, supabaseClient)
      
      case 'change_plan':
        if (!planId) {
          throw new Error('Plan ID is required for plan change')
        }
        return await handleChangePlan(subscription, planId, supabaseClient)
      
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function handleCancelSubscription(subscription: any, supabaseClient: any) {
  if (!subscription.stripe_subscription_id) {
    throw new Error('No Stripe subscription found')
  }

  // Cancel at period end
  const stripeSubscription = await stripe.subscriptions.update(
    subscription.stripe_subscription_id,
    { cancel_at_period_end: true }
  )

  // Update database
  await supabaseClient
    .from('user_subscriptions')
    .update({
      cancel_at_period_end: true,
      updated_at: new Date(),
    })
    .eq('id', subscription.id)

  return new Response(
    JSON.stringify({ 
      message: 'Subscription will be canceled at the end of the current period',
      subscription: stripeSubscription 
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

async function handleResumeSubscription(subscription: any, supabaseClient: any) {
  if (!subscription.stripe_subscription_id) {
    throw new Error('No Stripe subscription found')
  }

  // Resume subscription
  const stripeSubscription = await stripe.subscriptions.update(
    subscription.stripe_subscription_id,
    { cancel_at_period_end: false }
  )

  // Update database
  await supabaseClient
    .from('user_subscriptions')
    .update({
      cancel_at_period_end: false,
      updated_at: new Date(),
    })
    .eq('id', subscription.id)

  return new Response(
    JSON.stringify({ 
      message: 'Subscription resumed successfully',
      subscription: stripeSubscription 
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

async function handleChangePlan(subscription: any, newPlanId: string, supabaseClient: any) {
  if (!subscription.stripe_subscription_id) {
    throw new Error('No Stripe subscription found')
  }

  // Get new plan details
  const { data: newPlan, error: planError } = await supabaseClient
    .from('subscription_plans')
    .select('*')
    .eq('id', newPlanId)
    .single()

  if (planError || !newPlan) {
    throw new Error('New plan not found')
  }

  // Get current subscription from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscription.stripe_subscription_id
  )

  // Update subscription with new price
  const updatedSubscription = await stripe.subscriptions.update(
    subscription.stripe_subscription_id,
    {
      items: [{
        id: stripeSubscription.items.data[0].id,
        price: newPlan.stripe_price_id,
      }],
      metadata: {
        user_id: subscription.user_id,
        plan_id: newPlanId,
      },
    }
  )

  // Update database
  await supabaseClient
    .from('user_subscriptions')
    .update({
      subscription_plan_id: newPlanId,
      updated_at: new Date(),
    })
    .eq('id', subscription.id)

  return new Response(
    JSON.stringify({ 
      message: 'Plan changed successfully',
      subscription: updatedSubscription 
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
} 