-- Script para diagnosticar problemas con el registro de pagos
-- Ejecutar para entender por qué no se registran pagos en payment_history

-- 1. Verificar la estructura de la tabla payment_history
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'payment_history'
ORDER BY ordinal_position;

-- 2. Verificar si hay algún pago registrado (aunque sea antiguo)
SELECT 
  COUNT(*) as total_payments,
  COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as successful_payments,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
  MIN(created_at) as oldest_payment,
  MAX(created_at) as newest_payment
FROM payment_history 
WHERE user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b';

-- 3. Verificar la suscripción actual
SELECT 
  'SUSCRIPCIÓN ACTUAL' as info,
  us.id,
  us.user_id,
  us.status,
  us.stripe_subscription_id,
  us.stripe_customer_id,
  sp.name as plan_name,
  us.updated_at,
  CASE 
    WHEN us.stripe_subscription_id IS NOT NULL THEN '✅ CON STRIPE ID'
    ELSE '❌ SIN STRIPE ID'
  END as stripe_status
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE us.user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b';

-- 4. Verificar si hay problemas con la función process-pending-payments
SELECT 
  'VERIFICAR LOGS DE LA FUNCIÓN' as instruction,
  'Revisar los logs de process-pending-payments en Supabase Dashboard' as action,
  'Buscar errores relacionados con payment_history.insert' as focus;

-- 5. Verificar permisos de la tabla payment_history
SELECT 
  'VERIFICAR PERMISOS' as instruction,
  'Asegurarse de que la función tiene permisos para INSERT en payment_history' as action; 