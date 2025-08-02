-- Verificación rápida del estado de suscripciones
-- Ejecutar en SQL Editor de Supabase

-- 1. ¿Existen planes?
SELECT COUNT(*) as total_planes FROM subscription_plans;

-- 2. ¿Qué planes hay?
SELECT name, display_name, price, stripe_price_id FROM subscription_plans LIMIT 5;

-- 3. ¿Hay suscripciones activas?
SELECT COUNT(*) as suscripciones_activas FROM user_subscriptions WHERE status = 'active'; 