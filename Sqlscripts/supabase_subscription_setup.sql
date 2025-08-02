-- ==========================================
-- SCRIPT SQL PARA SISTEMA DE SUSCRIPCIONES
-- StreamFlow - Ejecutar en Supabase SQL Editor
-- ==========================================

-- 1. TABLA: Planes de Suscripción
-- Ejecutar esta query primero
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE, -- 'free', 'premium_monthly', 'premium_annual'
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  interval_type VARCHAR(20) NOT NULL, -- 'month', 'year', 'one_time'
  interval_count INTEGER NOT NULL DEFAULT 1,
  stripe_price_id VARCHAR(100),
  stripe_product_id VARCHAR(100),
  features JSONB DEFAULT '[]'::jsonb,
  max_playlists INTEGER DEFAULT NULL, -- NULL = ilimitado
  max_downloads INTEGER DEFAULT NULL, -- NULL = ilimitado
  has_ads BOOLEAN DEFAULT TRUE,
  has_high_quality BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA: Suscripciones de Usuarios
-- Ejecutar esta query después de la anterior
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due', 'trial', 'incomplete'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_active_user_subscription UNIQUE(user_id) DEFERRABLE INITIALLY DEFERRED
);

-- 3. TABLA: Historial de Pagos
-- Ejecutar esta query tercera
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  stripe_payment_intent_id VARCHAR(100),
  stripe_invoice_id VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(20) NOT NULL, -- 'succeeded', 'pending', 'failed', 'canceled', 'refunded'
  payment_method VARCHAR(50), -- 'card', 'paypal', etc.
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ÍNDICES para mejorar rendimiento
-- Ejecutar estos índices después de las tablas
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);

-- 5. FUNCIÓN para actualizar updated_at automáticamente
-- Ejecutar esta función
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. TRIGGERS para updated_at
-- Ejecutar estos triggers
CREATE TRIGGER update_subscription_plans_updated_at 
    BEFORE UPDATE ON subscription_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. INSERTAR DATOS INICIALES - Planes Base
-- Ejecutar estos inserts para tener los planes iniciales
INSERT INTO subscription_plans (
  name, 
  display_name, 
  description,
  price, 
  currency, 
  interval_type, 
  interval_count,
  max_playlists,
  max_downloads,
  has_ads,
  has_high_quality,
  sort_order,
  features
) VALUES 
(
  'free',
  'Plan Gratuito',
  'Perfecto para comenzar a descubrir música',
  0.00,
  'USD',
  'month',
  1,
  3, -- máximo 3 playlists
  0, -- sin descargas
  true, -- con anuncios
  false, -- sin alta calidad
  1,
  '["Búsqueda básica", "Reproductor estándar", "3 playlists", "Previews de 30s"]'::jsonb
),
(
  'premium_monthly',
  'Premium Mensual',
  'Experiencia completa sin limitaciones',
  9.99,
  'USD',
  'month',
  1,
  NULL, -- playlists ilimitadas
  NULL, -- descargas ilimitadas
  false, -- sin anuncios
  true, -- alta calidad
  2,
  '["Todo del plan gratuito", "Playlists ilimitadas", "Sin anuncios", "Alta calidad", "Descargas offline", "Recomendaciones avanzadas"]'::jsonb
),
(
  'premium_annual',
  'Premium Anual',
  'El mejor valor - 2 meses gratis',
  99.99,
  'USD',
  'year',
  1,
  NULL, -- playlists ilimitadas
  NULL, -- descargas ilimitadas
  false, -- sin anuncios
  true, -- alta calidad
  3,
  '["Todo del Premium Mensual", "2 meses gratis", "Acceso anticipado", "Soporte prioritario"]'::jsonb
);

-- 8. VERIFICAR que todo se creó correctamente
-- Ejecutar esta query para verificar
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('subscription_plans', 'user_subscriptions', 'payment_history')
ORDER BY table_name, ordinal_position;

-- 9. VERIFICAR los planes creados
-- Ejecutar esta query para ver los planes
SELECT 
  name,
  display_name,
  price,
  interval_type,
  max_playlists,
  has_ads,
  has_high_quality
FROM subscription_plans 
ORDER BY sort_order;
