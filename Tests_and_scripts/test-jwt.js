// Script para obtener el JWT del usuario y probar la función
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://tnqtlltiwoocwajorglp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRucXRsbHRpd29vY3dham9yZ2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTE0NDQsImV4cCI6MjA2ODg4NzQ0NH0.41ZEEl9xpd6wvpr88wkbjKvmqtfRVMZt7bl8zCzL6os'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testStripeFunction() {
  try {
    // Simular login con email y password (usar credenciales reales)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com', // Cambia por un email real
      password: 'password123' // Cambia por una password real
    })

    if (authError) {
      console.error('Auth error:', authError)
      return
    }

    console.log('Auth successful, user:', authData.user.id)
    console.log('Access token:', authData.session.access_token.substring(0, 50) + '...')

    // Ahora probar la función stripe-checkout
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: {
        priceId: 'price_1RrR7YQnqQD67bKrYv3Yh5Qm',
        userId: authData.user.id,
        successUrl: 'http://localhost:8080/profile?success=true',
        cancelUrl: 'http://localhost:8080/pricing?canceled=true'
      }
    })

    console.log('Function response:', { data, error })

  } catch (err) {
    console.error('Error:', err)
  }
}

testStripeFunction()
