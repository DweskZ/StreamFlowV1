require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

async function testStripeFunction() {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: process.env.TEST_EMAIL,
      password: process.env.TEST_PASSWORD
    })

    if (authError) {
      console.error('Auth error:', authError)
      return
    }

    console.log('Auth successful, user:', authData.user.id)
    console.log('Access token:', authData.session.access_token.substring(0, 50) + '...')

    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: {
        priceId: process.env.TEST_PRICE_ID,
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
