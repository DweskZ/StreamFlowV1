-- Script para verificar el estado de los datos de suscripción
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar si existen planes de suscripción
SELECT 
  'PLANES DE SUSCRIPCIÓN' as tabla,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN is_active = true THEN 1 END) as planes_activos
FROM subscription_plans;

-- 2. Mostrar los planes existentes
SELECT 
  id,
  name,
  display_name,
  price,
  currency,
  interval_type,
  stripe_price_id,
  stripe_product_id,
  is_active,
  sort_order
FROM subscription_plans 
ORDER BY sort_order;

-- 3. Verificar si hay suscripciones de usuarios
SELECT 
  'SUSCRIPCIONES DE USUARIOS' as tabla,
  COUNT(*) as total_suscripciones,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as suscripciones_activas
FROM user_subscriptions;

-- 4. Verificar si hay historial de pagos
SELECT 
  'HISTORIAL DE PAGOS' as tabla,
  COUNT(*) as total_pagos,
  COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as pagos_exitosos
FROM payment_history;

-- 5. Verificar la estructura de las tablas
SELECT 
  table_name,
  COUNT(*) as columnas
FROM information_schema.columns 
WHERE table_name IN ('subscription_plans', 'user_subscriptions', 'payment_history')
GROUP BY table_name
ORDER BY table_name; 