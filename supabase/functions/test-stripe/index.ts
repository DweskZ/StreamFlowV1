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

  try {
    console.log('Test Stripe function called');
    
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    console.log('Checking Stripe API key...');
    
    // Solo verificar que Stripe funciona - listar productos
    const products = await stripe.products.list({ limit: 1 })
    console.log('Stripe products:', products.data.length);

    // Verificar que el price ID existe
    const priceId = 'price_1RrR7YQnqQD67bKrYv3Yh5Qm'
    console.log('Checking price ID:', priceId);
    
    const price = await stripe.prices.retrieve(priceId)
    console.log('Price found:', price.id, price.unit_amount);

    // Ahora crear la sesión de checkout
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
      success_url: 'http://localhost:8080/profile?success=true',
      cancel_url: 'http://localhost:8080/pricing?canceled=true',
    })

    console.log('Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        url: session.url,
        session_id: session.id
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Stripe error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Stripe error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
