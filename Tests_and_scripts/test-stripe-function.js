// Script para probar la función stripe-checkout directamente
// Ejecutar en la consola del navegador

async function testStripeFunction() {
  try {
    console.log('🔄 Iniciando prueba de función stripe-checkout...');
    
    // Obtener el cliente de Supabase del contexto global
    const supabase = window.supabase;
    if (!supabase) {
      console.error('❌ No se encontró el cliente de Supabase');
      return;
    }

    // Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ Usuario no autenticado');
      return;
    }

    console.log('✅ Usuario autenticado:', user.id);

    // Llamar a la función
    console.log('🔄 Llamando a función stripe-checkout...');
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: {
        priceId: 'price_1RrR7YQnqQD67bKrYv3Yh5Qm', // Plan mensual
        userId: user.id,
        successUrl: 'http://localhost:8080/profile?success=true',
        cancelUrl: 'http://localhost:8080/pricing?canceled=true'
      }
    });

    console.log('✅ Respuesta recibida:');
    console.log('Data:', data);
    console.log('Error:', error);

    if (error) {
      console.error('❌ Error en la función:', error);
    } else if (data?.url) {
      console.log('✅ URL de Stripe checkout recibida:', data.url);
      console.log('🔄 Redirigiendo...');
      window.open(data.url, '_blank');
    } else {
      console.error('❌ No se recibió URL de checkout:', data);
    }

  } catch (err) {
    console.error('❌ Error en la prueba:', err);
  }
}

// Hacer la función disponible globalmente
window.testStripeFunction = testStripeFunction;

console.log('✅ Script de prueba cargado. Ejecuta testStripeFunction() en la consola para probar.'); 