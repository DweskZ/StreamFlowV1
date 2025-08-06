-- Script para verificar la estructura de payment_history
-- Ejecutar para ver qué columnas tiene la tabla

-- 1. Ver la estructura de payment_history
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'payment_history'
ORDER BY ordinal_position;

-- 2. Ver algunos registros de payment_history
SELECT 
  id,
  user_id,
  amount,
  currency,
  status,
  stripe_payment_intent_id,
  stripe_invoice_id,
  created_at
FROM payment_history
ORDER BY created_at DESC
LIMIT 5;

-- 3. Verificar si hay alguna columna relacionada con planes
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'payment_history' 
  AND column_name LIKE '%plan%'
ORDER BY ordinal_position; 