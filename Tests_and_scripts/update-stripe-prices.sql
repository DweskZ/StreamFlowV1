-- Script para actualizar los price IDs de Stripe con valores reales
-- Ejecutar en SQL Editor de Supabase

-- IMPORTANTE: Reemplaza los price IDs de ejemplo con los reales de tu cuenta de Stripe
-- Puedes encontrar estos IDs en tu dashboard de Stripe: https://dashboard.stripe.com/products

-- 1. Actualizar plan Premium Mensual
UPDATE subscription_plans 
SET 
  stripe_price_id = 'price_1RrR7YQnqQD67bKrYv3Yh5Qm', -- Reemplazar con tu price ID real
  stripe_product_id = 'prod_1RrR7YQnqQD67bKrYv3Yh5Qm', -- Reemplazar con tu product ID real
  updated_at = NOW()
WHERE name = 'premium_monthly';

-- 2. Actualizar plan Premium Anual
UPDATE subscription_plans 
SET 
  stripe_price_id = 'price_1RrR7YQnqQD67bKrYv3Yh5Qm', -- Reemplazar con tu price ID real
  stripe_product_id = 'prod_1RrR7YQnqQD67bKrYv3Yh5Qm', -- Reemplazar con tu product ID real
  updated_at = NOW()
WHERE name = 'premium_annual';

-- 3. Verificar que se actualizaron correctamente
SELECT 
  id,
  name,
  display_name,
  price,
  stripe_price_id,
  stripe_product_id,
  is_active
FROM subscription_plans 
WHERE name IN ('premium_monthly', 'premium_annual')
ORDER BY sort_order;

-- 4. Verificar todos los planes
SELECT 
  id,
  name,
  display_name,
  price,
  stripe_price_id,
  is_active,
  sort_order
FROM subscription_plans 
ORDER BY sort_order; 