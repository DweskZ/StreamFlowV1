-- Script para forzar la actualización del estado de la suscripción
-- Ejecutar si la suscripción no se actualiza automáticamente

-- 1. Verificar el estado actual ANTES de la actualización
SELECT 
  'ESTADO ACTUAL ANTES DE LA ACTUALIZACIÓN' as info,
  us.status,
  sp.name as plan_name,
  us.updated_at
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE us.user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b';

-- 2. Forzar la actualización del estado a 'active' si hay pagos exitosos
UPDATE user_subscriptions 
SET 
  status = 'active',
  updated_at = NOW()
WHERE user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b'
  AND status = 'incomplete'
  AND EXISTS (
    SELECT 1 
    FROM payment_history ph 
    WHERE ph.user_id = user_subscriptions.user_id 
      AND ph.status = 'succeeded'
      AND ph.created_at > NOW() - INTERVAL '24 hours'
  );

-- 3. Verificar el estado DESPUÉS de la actualización
SELECT 
  'ESTADO DESPUÉS DE LA ACTUALIZACIÓN' as info,
  us.status,
  sp.name as plan_name,
  us.updated_at,
  CASE 
    WHEN us.status = 'active' THEN '✅ ACTUALIZADO CORRECTAMENTE'
    WHEN us.status = 'incomplete' THEN '⚠️ SIGUE INCOMPLETO - VERIFICAR PAGOS'
    ELSE '❓ ESTADO DESCONOCIDO'
  END as result
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE us.user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b';

-- 4. Verificar que hay pagos exitosos recientes
SELECT 
  'VERIFICACIÓN DE PAGOS RECIENTES' as info,
  COUNT(*) as total_payments,
  COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as successful_payments,
  MAX(created_at) as last_payment_date
FROM payment_history 
WHERE user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b'
  AND created_at > NOW() - INTERVAL '24 hours'; 