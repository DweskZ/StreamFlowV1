-- Script para crear la tabla webhook_logs
-- Ejecutar para poder ver los logs del webhook

-- Crear la tabla webhook_logs
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  stripe_event_type VARCHAR(100),
  stripe_event_id VARCHAR(100),
  method VARCHAR(10),
  has_signature BOOLEAN,
  body_length INTEGER,
  status VARCHAR(20) NOT NULL,
  message TEXT,
  error_details TEXT,
  event_data TEXT,
  session_data TEXT,
  subscription_data TEXT,
  price_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_stripe_event_id ON webhook_logs(stripe_event_id);

-- Verificar que la tabla se creó correctamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'webhook_logs'
ORDER BY ordinal_position; 