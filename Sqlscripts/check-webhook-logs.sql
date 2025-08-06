-- Script para verificar los logs del webhook
-- Ejecutar después de hacer una prueba de suscripción

-- 1. Ver todos los logs recientes
SELECT 
  id,
  event_type,
  stripe_event_type,
  stripe_event_id,
  status,
  message,
  created_at
FROM webhook_logs
ORDER BY created_at DESC
LIMIT 20;

-- 2. Ver solo logs de error
SELECT 
  id,
  event_type,
  stripe_event_type,
  stripe_event_id,
  status,
  message,
  error_details,
  created_at
FROM webhook_logs
WHERE status = 'error'
ORDER BY created_at DESC
LIMIT 10;

-- 3. Ver logs de eventos específicos
SELECT 
  id,
  event_type,
  stripe_event_type,
  stripe_event_id,
  status,
  message,
  created_at
FROM webhook_logs
WHERE event_type IN ('request_received', 'event_verified', 'processing_checkout')
ORDER BY created_at DESC
LIMIT 10;

-- 4. Ver logs de suscripciones
SELECT 
  id,
  event_type,
  stripe_event_type,
  stripe_event_id,
  status,
  message,
  subscription_data,
  created_at
FROM webhook_logs
WHERE event_type LIKE '%subscription%'
ORDER BY created_at DESC
LIMIT 10;

-- 5. Ver logs de pagos
SELECT 
  id,
  event_type,
  stripe_event_type,
  stripe_event_id,
  status,
  message,
  created_at
FROM webhook_logs
WHERE event_type LIKE '%payment%'
ORDER BY created_at DESC
LIMIT 10; 