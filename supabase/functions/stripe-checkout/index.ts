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
    console.log('Function called with method:', req.method);

    // Handle CORS
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      return new Response('ok', { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
      console.log('Method not allowed:', req.method);
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing POST request...');

    const bodyText = await req.text();
    console.log('Raw request body:', bodyText);
    
    let requestData;
    try {
      requestData = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { priceId, userId, successUrl, cancelUrl } = requestData;
    console.log('Received request:', { priceId, userId, successUrl, cancelUrl });

    if (!priceId || !userId) {
      console.log('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing priceId or userId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

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
      success_url: successUrl || 'http://localhost:8080/profile?success=true',
      cancel_url: cancelUrl || 'http://localhost:8080/pricing?canceled=true',
    })

    console.log('Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  try {
    console.log('Function called with method:', req.method);
    console.log('Function called with URL:', req.url);

    // Handle CORS
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      return new Response('ok', { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
      console.log('Method not allowed:', req.method);
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }), 
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing POST request...');

    const bodyText = await req.text();
    console.log('Raw request body:', bodyText);
    
    let requestData;
    try {
      requestData = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { priceId, userId, successUrl, cancelUrl } = requestData;
    console.log('Received request:', { priceId, userId, successUrl, cancelUrl });

    if (!priceId || !userId) {
      console.log('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing priceId or userId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Usar service role key para consultas de base de datos
    // const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('Skipping user lookup for debugging...');
    // Simular un usuario válido para debugging
    const user = {
      id: userId,
      email: 'test@example.com' // Email por defecto para testing
    };

    console.log('Creating Stripe checkout session...');
    
    // Verificar que Stripe esté configurado
    if (!Deno.env.get('STRIPE_SECRET_KEY')) {
      console.error('STRIPE_SECRET_KEY not found');
      return new Response(
        JSON.stringify({ error: 'Stripe not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    console.log('Stripe key exists, creating session...');
    
    // Simplificar la sesión de Stripe al mínimo
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || 'http://localhost:8080/profile?success=true',
      cancel_url: cancelUrl || 'http://localhost:8080/pricing?canceled=true',
    })

    console.log('Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
