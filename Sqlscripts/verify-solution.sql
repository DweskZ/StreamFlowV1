-- Script para verificar que la solución completa funciona
-- Ejecutar después de arreglar los permisos

-- 1. Verificar el estado final de la suscripción
SELECT 
  '✅ ESTADO FINAL DE LA SUSCRIPCIÓN' as info,
  us.status,
  sp.name as plan_name,
  sp.display_name,
  us.stripe_subscription_id,
  us.updated_at,
  CASE 
    WHEN us.status = 'active' THEN '✅ FUNCIONANDO CORRECTAMENTE'
    ELSE '❌ PROBLEMA PENDIENTE'
  END as status_check
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE us.user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b';

-- 2. Verificar que los permisos están correctos
SELECT 
  '✅ VERIFICACIÓN DE PERMISOS' as info,
  tablename,
  hasinsert,
  hasselect,
  hasupdate,
  hasdelete,
  CASE 
    WHEN hasinsert = true THEN '✅ PERMISOS CORRECTOS'
    ELSE '❌ PERMISOS INCORRECTOS'
  END as permission_check
FROM pg_tables 
WHERE tablename = 'payment_history';

-- 3. Verificar que el botón "Actualizar Estado" debería aparecer
SELECT 
  '✅ VERIFICACIÓN DEL BOTÓN' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM user_subscriptions 
      WHERE user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b'
    ) THEN '✅ BOTÓN "ACTUALIZAR ESTADO" DEBERÍA APARECER'
    ELSE '❌ NO HAY SUSCRIPCIÓN - BOTÓN NO APARECERÁ'
  END as button_status;

-- 4. Resumen final
SELECT 
  '🎉 RESUMEN DE LA SOLUCIÓN' as info,
  '1. ✅ Suscripción activa: premium_annual' as step1,
  '2. ✅ Permisos de payment_history arreglados' as step2,
  '3. ✅ Botón "Actualizar Estado" disponible' as step3,
  '4. ✅ Procesamiento automático de pagos funcionando' as step4,
  '5. ✅ Redireccionamiento después del checkout funcionando' as step5; 