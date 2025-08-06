// Script para verificar los price IDs de Stripe en la base de datos
// Ejecutar en la consola del navegador

async function checkStripePrices() {
  try {
    console.log('🔍 Verificando price IDs de Stripe en la base de datos...');
    
    // Obtener el cliente de Supabase del contexto global
    const supabase = window.supabase;
    if (!supabase) {
      console.error('❌ No se encontró el cliente de Supabase');
      return;
    }

    // Consultar los planes de suscripción
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('sort_order');

    if (error) {
      console.error('❌ Error al consultar planes:', error);
      return;
    }

    console.log('📋 Planes encontrados:');
    plans.forEach(plan => {
      console.log(`\n📦 Plan: ${plan.display_name}`);
      console.log(`   ID: ${plan.id}`);
      console.log(`   Nombre: ${plan.name}`);
      console.log(`   Precio: $${plan.price} ${plan.currency}`);
      console.log(`   Intervalo: ${plan.interval_type}`);
      console.log(`   Stripe Price ID: ${plan.stripe_price_id || '❌ NO CONFIGURADO'}`);
      console.log(`   Stripe Product ID: ${plan.stripe_product_id || '❌ NO CONFIGURADO'}`);
      console.log(`   Activo: ${plan.is_active ? '✅' : '❌'}`);
    });

    // Verificar si hay price IDs válidos
    const validPlans = plans.filter(plan => plan.stripe_price_id && plan.stripe_price_id !== 'price_1OqX2X2X2X2X2X2X2X2X2X2X');
    
    if (validPlans.length === 0) {
      console.error('\n❌ PROBLEMA: No hay price IDs válidos configurados');
      console.log('💡 Necesitas actualizar los price IDs en la base de datos con los IDs reales de Stripe');
    } else {
      console.log(`\n✅ ${validPlans.length} planes tienen price IDs válidos`);
    }

    return plans;

  } catch (err) {
    console.error('❌ Error en la verificación:', err);
  }
}

// Hacer la función disponible globalmente
window.checkStripePrices = checkStripePrices;

console.log('✅ Script de verificación cargado. Ejecuta checkStripePrices() en la consola para verificar los price IDs.'); 