import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

serve(async (req) => {
  console.log('Webhook function called') // Added logging
  
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    console.error('No signature provided') // Added logging
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    console.log('Webhook body received, length:', body.length) // Added logging
    
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    console.log('Webhook event constructed:', event.type) // Added logging

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Processing event type:', event.type) // Added logging

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Handling checkout.session.completed') // Added logging
        await handleCheckoutSessionCompleted(event.data.object, supabaseClient)
        break
      
      case 'customer.subscription.created':
        console.log('Handling customer.subscription.created') // Added logging
        await handleSubscriptionUpdated(event.data.object, supabaseClient)
        break
        
      case 'customer.subscription.updated':
        console.log('Handling customer.subscription.updated') // Added logging
        await handleSubscriptionUpdated(event.data.object, supabaseClient)
        break
      
      case 'customer.subscription.deleted':
        console.log('Handling customer.subscription.deleted') // Added logging
        await handleSubscriptionDeleted(event.data.object, supabaseClient)
        break
      
      case 'invoice.payment_succeeded':
        console.log('Handling invoice.payment_succeeded') // Added logging
        await handlePaymentSucceeded(event.data.object, supabaseClient)
        break
      
      case 'invoice.payment_failed':
        console.log('Handling invoice.payment_failed') // Added logging
        await handlePaymentFailed(event.data.object, supabaseClient)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    console.log('Webhook processed successfully') // Added logging
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response(
      `Webhook Error: ${err.message}`,
      { status: 400 }
    )
  }
})

async function handleCheckoutSessionCompleted(session: any, supabaseClient: any) {
  console.log('handleCheckoutSessionCompleted called') // Added logging
  console.log('Session metadata:', session.metadata) // Added logging
  
  const { user_id, plan_id } = session.metadata
  
  console.log('Extracted user_id:', user_id) // Added logging
  console.log('Extracted plan_id:', plan_id) // Added logging
  
  // Update subscription status
  const { data: updateData, error: updateError } = await supabaseClient
    .from('user_subscriptions')
    .update({
      status: 'active',
      current_period_start: new Date(session.subscription?.current_period_start * 1000),
      current_period_end: new Date(session.subscription?.current_period_end * 1000),
      stripe_subscription_id: session.subscription?.id,
    })
    .eq('user_id', user_id)
    .eq('subscription_plan_id', plan_id)

  if (updateError) {
    console.error('Error updating subscription:', updateError) // Added logging
  } else {
    console.log('Subscription updated successfully:', updateData) // Added logging
  }

  // Record payment
  const { data: paymentData, error: paymentError } = await supabaseClient
    .from('payment_history')
    .insert({
      user_id,
      subscription_id: session.subscription?.id,
      stripe_payment_intent_id: session.payment_intent,
      amount: session.amount_total / 100, // Convert from cents
      currency: session.currency,
      status: 'succeeded',
      payment_method: 'card',
      description: `Payment for plan ${plan_id}`,
    })

  if (paymentError) {
    console.error('Error recording payment:', paymentError) // Added logging
  } else {
    console.log('Payment recorded successfully:', paymentData) // Added logging
  }
}

async function handleSubscriptionUpdated(subscription: any, supabaseClient: any) {
  const { user_id, plan_id } = subscription.metadata
  
  await supabaseClient
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
    })
    .eq('user_id', user_id)
    .eq('subscription_plan_id', plan_id)
}

async function handleSubscriptionDeleted(subscription: any, supabaseClient: any) {
  const { user_id, plan_id } = subscription.metadata
  
  await supabaseClient
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date(),
    })
    .eq('user_id', user_id)
    .eq('subscription_plan_id', plan_id)
}

async function handlePaymentSucceeded(invoice: any, supabaseClient: any) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
  const { user_id, plan_id } = subscription.metadata
  
  // Record successful payment
  await supabaseClient
    .from('payment_history')
    .insert({
      user_id,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: 'succeeded',
      payment_method: 'card',
      description: `Recurring payment for plan ${plan_id}`,
    })
}

async function handlePaymentFailed(invoice: any, supabaseClient: any) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
  const { user_id, plan_id } = subscription.metadata
  
  // Record failed payment
  await supabaseClient
    .from('payment_history')
    .insert({
      user_id,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_due / 100,
      currency: invoice.currency,
      status: 'failed',
      payment_method: 'card',
      description: `Failed payment for plan ${plan_id}`,
    })
} 