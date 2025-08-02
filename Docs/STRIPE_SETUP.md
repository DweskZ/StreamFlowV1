# Configuración de Stripe para StreamFlow

# Variables de entorno necesarias para Supabase Edge Functions
# Agrega estas al archivo .env.local en tu proyecto Supabase

# 1. Variables de Stripe (obtenlas desde https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...  # Tu clave secreta de Stripe (testing)
STRIPE_WEBHOOK_SECRET=whsec_...  # Secret del webhook de Stripe

# 2. Variables de Supabase (ya las tienes)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJ...  # Tu clave anónima de Supabase
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Tu clave de servicio de Supabase

# Instrucciones para configurar Stripe:

# 1. Crear cuenta en Stripe
# - Ve a https://stripe.com y crea una cuenta
# - Activa el modo de testing

# 2. Crear productos y precios
# - Ve a Products en el dashboard de Stripe
# - Crea producto "StreamFlow Premium"
# - Crea precios:
#   * Mensual: $9.99/mes
#   * Anual: $99.99/año (con descuento)

# 3. Configurar webhook
# - Ve a Webhooks en el dashboard
# - Agrega endpoint: https://tu-proyecto.supabase.co/functions/v1/stripe-webhook
# - Eventos a escuchar:
#   * checkout.session.completed
#   * customer.subscription.updated
#   * customer.subscription.deleted
#   * invoice.payment_succeeded
#   * invoice.payment_failed

# 4. Actualizar base de datos con price IDs
# Ejecutar estos comandos SQL en Supabase SQL Editor:

UPDATE subscription_plans 
SET stripe_price_id = 'price_XXXXXXXXX'  -- ID del precio mensual de Stripe
WHERE name = 'premium_monthly';

UPDATE subscription_plans 
SET stripe_price_id = 'price_YYYYYYYYY'  -- ID del precio anual de Stripe
WHERE name = 'premium_annual';
