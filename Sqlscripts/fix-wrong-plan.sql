-- Script para corregir la suscripción al plan correcto
-- Ejecutar en SQL Editor de Supabase

-- 1. Actualizar la suscripción al plan anual correcto
UPDATE user_subscriptions 
SET 
  subscription_plan_id = '03c65846-b324-4df9-8d3a-4771d350f508',  -- premium_annual
  updated_at = NOW()
WHERE user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b';

-- 2. Actualizar el registro de pago para reflejar el plan correcto
UPDATE payment_history 
SET 
  description = 'Payment for Premium Annual plan - Corrected',
  updated_at = NOW()
WHERE user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b'
  AND description LIKE '%Webhook Simulation%';

-- 3. Verificar el resultado
SELECT 
  us.id,
  us.user_id,
  us.subscription_plan_id,
  us.status,
  sp.name as plan_name,
  sp.display_name,
  sp.price
FROM user_subscriptions us
JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
WHERE us.user_id = 'e9e38985-3479-4b6c-9d24-013e6f0e9f5b'; 