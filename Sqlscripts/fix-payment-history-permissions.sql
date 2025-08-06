-- Script para arreglar los permisos de la tabla payment_history
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar los permisos actuales
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasinsert,
  hasselect,
  hasupdate,
  hasdelete
FROM pg_tables 
WHERE tablename = 'payment_history';

-- 2. Otorgar permisos completos a la función de Supabase
GRANT ALL PRIVILEGES ON TABLE payment_history TO authenticated;
GRANT ALL PRIVILEGES ON TABLE payment_history TO anon;
GRANT ALL PRIVILEGES ON TABLE payment_history TO service_role;

-- 3. Otorgar permisos específicos para INSERT
GRANT INSERT ON TABLE payment_history TO authenticated;
GRANT INSERT ON TABLE payment_history TO anon;
GRANT INSERT ON TABLE payment_history TO service_role;

-- 4. Verificar que la secuencia también tenga permisos
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 5. Verificar los permisos después de la corrección
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasinsert,
  hasselect,
  hasupdate,
  hasdelete
FROM pg_tables 
WHERE tablename = 'payment_history';

-- 6. Probar un INSERT manual para verificar permisos
INSERT INTO payment_history (
  user_id,
  subscription_plan_id,
  stripe_payment_intent_id,
  stripe_invoice_id,
  amount,
  currency,
  status,
  created_at
) VALUES (
  'e9e38985-3479-4b6c-9d24-013e6f0e9f5b',
  (SELECT id FROM subscription_plans WHERE name = 'premium_annual' LIMIT 1),
  'pi_test_permission',
  'in_test_permission',
  99.99,
  'USD',
  'succeeded',
  NOW()
);

-- 7. Verificar que se insertó correctamente
SELECT 
  'PAGO DE PRUEBA INSERTADO' as info,
  id,
  user_id,
  amount,
  status,
  created_at
FROM payment_history 
WHERE stripe_payment_intent_id = 'pi_test_permission';

-- 8. Limpiar el pago de prueba
DELETE FROM payment_history WHERE stripe_payment_intent_id = 'pi_test_permission'; 