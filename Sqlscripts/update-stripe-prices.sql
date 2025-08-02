-- Script para actualizar los Price IDs de Stripe en la base de datos
-- Ejecuta esto en Supabase SQL Editor después de obtener los Price IDs

-- Actualizar plan mensual
UPDATE subscription_plans 
SET stripe_price_id = 'price_1RrR7YQnqQD67bKrYv3Yh5Qm'  -- Premium mensual
WHERE name = 'premium_monthly';

-- Actualizar plan anual  
UPDATE subscription_plans 
SET stripe_price_id = 'price_1RrR9BQnqQD67bKr0fLjj8UI'  -- Premium anual
WHERE name = 'premium_annual';

-- Verificar que se actualizaron correctamente
SELECT id, name, stripe_price_id, price 
FROM subscription_plans 
WHERE stripe_price_id IS NOT NULL;
