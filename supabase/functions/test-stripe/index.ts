import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"
import Stripe from "https://esm.sh/stripe@14.21.0"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
})

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Test Stripe function called');

    // Verificar que Stripe esté configurado
    if (!Deno.env.get('STRIPE_SECRET_KEY')) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    // Verificar que el price ID existe
    const priceId = 'price_1RrR7YQnqQD67bKrYv3Yh5Qm'
    console.log('Checking price ID:', priceId);
    
    const price = await stripe.prices.retrieve(priceId)
    console.log('Price found:', price.id, price.unit_amount);

    // Crear la sesión de checkout
    console.log('Creating checkout session...');
    const session = await stripe.checkout.sessions.create({
      customer_email: 'test@example.com',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin') || 'http://localhost:3000'}/profile?success=true`,
      cancel_url: `${req.headers.get('origin') || 'http://localhost:3000'}/pricing?canceled=true`,
    })

    console.log('Checkout session created:', session.id);

    const response = {
      success: true,
      url: session.url,
      session_id: session.id,
      message: 'Test function working correctly'
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Test Stripe function error:', error);
    
    const errorResponse = {
      success: false,
      error: 'Test function failed',
      details: error.message,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
