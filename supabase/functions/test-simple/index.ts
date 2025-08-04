import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"

Deno.serve(async (req) => {
  console.log('Test function called');
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
      },
    })
  }

  return new Response(
    JSON.stringify({ 
      message: 'Hello from test function!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url
    }),
    { 
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      } 
    }
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/test-simple' \
    --header 'Authorization: Bearer YOUR_ANON_KEY_HERE' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
