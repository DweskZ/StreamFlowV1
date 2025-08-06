// Script completo para diagnosticar el flujo de Stripe
// Ejecutar en la consola del navegador

async function diagnoseStripeFlow() {
  try {
    console.log('🔍 DIAGNÓSTICO COMPLETO DEL FLUJO DE STRIPE');
    console.log('==========================================');
    
    // Obtener el cliente de Supabase del contexto global
    const supabase = window.supabase;
    if (!supabase) {
      console.error('❌ No se encontró el cliente de Supabase');
      return;
    }

    // 1. Verificar autenticación
    console.log('\n1️⃣ Verificando autenticación...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ Usuario no autenticado');
      console.log('💡 Inicia sesión primero');
      return;
    }
    console.log('✅ Usuario autenticado:', user.id);

    // 2. Verificar planes de suscripción
    console.log('\n2️⃣ Verificando planes de suscripción...');
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('sort_order');

    if (plansError) {
      console.error('❌ Error al consultar planes:', plansError);
      return;
    }

    console.log('📋 Planes encontrados:');
    plans.forEach(plan => {
      console.log(`   ${plan.display_name}: ${plan.stripe_price_id || '❌ NO CONFIGURADO'}`);
    });

    // 3. Verificar suscripción actual
    console.log('\n3️⃣ Verificando suscripción actual...');
    const { data: currentSubscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (subError && subError.code !== 'PGRST116') {
      console.error('❌ Error al consultar suscripción:', subError);
    } else if (currentSubscription) {
      console.log('✅ Suscripción activa:', currentSubscription.subscription_plans.display_name);
    } else {
      console.log('ℹ️ No hay suscripción activa');
    }

    // 4. Probar función stripe-checkout
    console.log('\n4️⃣ Probando función stripe-checkout...');
    
    // Buscar un plan premium válido
    const premiumPlan = plans.find(p => p.name === 'premium_monthly' && p.stripe_price_id);
    
    if (!premiumPlan) {
      console.error('❌ No se encontró un plan premium con price ID válido');
      console.log('💡 Actualiza los price IDs en la base de datos');
      return;
    }

    console.log('🔄 Llamando a función stripe-checkout con price ID:', premiumPlan.stripe_price_id);
    
    const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('stripe-checkout', {
      body: {
        priceId: premiumPlan.stripe_price_id,
        userId: user.id,
        successUrl: `${window.location.origin}/profile?success=true`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`
      }
    });

    console.log('📤 Respuesta de stripe-checkout:');
    console.log('   Data:', checkoutData);
    console.log('   Error:', checkoutError);

    if (checkoutError) {
      console.error('❌ Error en stripe-checkout:', checkoutError);
    } else if (checkoutData?.url) {
      console.log('✅ URL de checkout recibida:', checkoutData.url);
      console.log('🔄 ¿Quieres abrir el checkout de Stripe? (ejecuta: window.open(checkoutData.url, "_blank"))');
    } else {
      console.error('❌ No se recibió URL de checkout');
    }

    // 5. Resumen del diagnóstico
    console.log('\n📊 RESUMEN DEL DIAGNÓSTICO');
    console.log('==========================');
    console.log('✅ Usuario autenticado');
    console.log(`✅ ${plans.length} planes configurados`);
    console.log(`✅ ${plans.filter(p => p.stripe_price_id).length} planes con price ID`);
    console.log(checkoutError ? '❌ Error en stripe-checkout' : '✅ stripe-checkout funcionando');

    return {
      user,
      plans,
      currentSubscription,
      checkoutData,
      checkoutError
    };

  } catch (err) {
    console.error('❌ Error en el diagnóstico:', err);
  }
}

// Hacer la función disponible globalmente
window.diagnoseStripeFlow = diagnoseStripeFlow;

console.log('✅ Script de diagnóstico cargado. Ejecuta diagnoseStripeFlow() en la consola para diagnosticar todo el flujo.'); 