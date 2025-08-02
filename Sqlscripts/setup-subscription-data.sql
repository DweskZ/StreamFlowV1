-- Script para configurar los planes de suscripción en StreamFlow
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Insertar planes de suscripción
INSERT INTO subscription_plans (
  id,
  name,
  display_name,
  description,
  price,
  currency,
  interval_type,
  interval_count,
  stripe_price_id,
  stripe_product_id,
  features,
  max_playlists,
  max_downloads,
  has_ads,
  has_high_quality,
  is_active,
  sort_order
) VALUES 
-- Plan Gratuito
(
  gen_random_uuid(),
  'free',
  'Gratuito',
  'Acceso básico a StreamFlow con limitaciones',
  0.00,
  'USD',
  'one_time',
  1,
  NULL, -- No tiene precio en Stripe
  NULL, -- No tiene producto en Stripe
  ARRAY[
    'Búsqueda básica de música',
    'Reproductor básico (previews de 30s)',
    '3 playlists máximo',
    'Anuncios cada 3 canciones'
  ],
  3, -- max_playlists
  0, -- max_downloads
  true, -- has_ads
  false, -- has_high_quality
  true, -- is_active
  1 -- sort_order
),
-- Plan Premium Mensual
(
  gen_random_uuid(),
  'premium_monthly',
  'Premium Mensual',
  'Acceso completo sin anuncios y con todas las funciones',
  9.99,
  'USD',
  'month',
  1,
  'price_1OqX2X2X2X2X2X2X2X2X2X2X', -- Reemplazar con tu stripe_price_id real
  'prod_1OqX2X2X2X2X2X2X2X2X2X2X', -- Reemplazar con tu stripe_product_id real
  ARRAY[
    'Todo lo del plan gratuito',
    'Playlists ilimitadas',
    'Sin anuncios',
    'Audio en alta calidad',
    'Descargas offline',
    'Recomendaciones avanzadas'
  ],
  NULL, -- max_playlists (ilimitado)
  NULL, -- max_downloads (ilimitado)
  false, -- has_ads
  true, -- has_high_quality
  true, -- is_active
  2 -- sort_order
),
-- Plan Premium Anual
(
  gen_random_uuid(),
  'premium_annual',
  'Premium Anual',
  'Acceso completo anual con 2 meses gratis',
  99.99,
  'USD',
  'year',
  1,
  'price_1OqX2X2X2X2X2X2X2X2X2X2Y', -- Reemplazar con tu stripe_price_id real
  'prod_1OqX2X2X2X2X2X2X2X2X2X2Y', -- Reemplazar con tu stripe_product_id real
  ARRAY[
    'Todo lo del Premium Mensual',
    '2 meses gratis (descuento)',
    'Acceso anticipado a features',
    'Soporte prioritario'
  ],
  NULL, -- max_playlists (ilimitado)
  NULL, -- max_downloads (ilimitado)
  false, -- has_ads
  true, -- has_high_quality
  true, -- is_active
  3 -- sort_order
)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  interval_type = EXCLUDED.interval_type,
  interval_count = EXCLUDED.interval_count,
  stripe_price_id = EXCLUDED.stripe_price_id,
  stripe_product_id = EXCLUDED.stripe_product_id,
  features = EXCLUDED.features,
  max_playlists = EXCLUDED.max_playlists,
  max_downloads = EXCLUDED.max_downloads,
  has_ads = EXCLUDED.has_ads,
  has_high_quality = EXCLUDED.has_high_quality,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- 2. Verificar que los planes se insertaron correctamente
SELECT 
  id,
  name,
  display_name,
  price,
  currency,
  interval_type,
  is_active,
  sort_order
FROM subscription_plans 
ORDER BY sort_order;

-- 3. Crear índices para mejorar el rendimiento (si no existen)
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_sort ON subscription_plans(sort_order);

-- 4. Verificar la estructura de las tablas
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('subscription_plans', 'user_subscriptions', 'payment_history')
ORDER BY table_name, ordinal_position; 