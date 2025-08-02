// Test script para probar autenticación con Edge Functions desde la consola del navegador

async function testAuth() {
  try {
    // Obtener la instancia de Supabase desde el contexto global del frontend
    const supabase = window.supabase || window.__supabase;
    
    if (!supabase) {
      console.error('No se encontró la instancia de Supabase');
      return;
    }

    // Obtener la sesión actual
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.log('No hay sesión activa')
      return
    }

    console.log('Usuario autenticado:', session.user.id)
    console.log('Token JWT:', session.access_token.substring(0, 50) + '...')

    // Probar la función test-auth
    console.log('Probando función test-auth...')
    const { data, error } = await supabase.functions.invoke('test-auth', {
      body: {}
    })

    console.log('Resultado test-auth:', { data, error })

    // Si test-auth funciona, probar stripe-checkout
    if (!error) {
      console.log('Probando función stripe-checkout...')
      const { data: stripeData, error: stripeError } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          priceId: 'price_1RrR7YQnqQD67bKrYv3Yh5Qm',
          userId: session.user.id,
          successUrl: 'http://localhost:8080/profile?success=true',
          cancelUrl: 'http://localhost:8080/pricing?canceled=true'
        }
      })

      console.log('Resultado stripe-checkout:', { data: stripeData, error: stripeError })
    }

  } catch (err) {
    console.error('Error en test:', err)
  }
}

// Hacer la función disponible globalmente
window.testAuth = testAuth

console.log('Script cargado. Ejecuta testAuth() en la consola para probar.')
