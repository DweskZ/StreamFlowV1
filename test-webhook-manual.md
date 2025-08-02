# Probar Webhook Manualmente

## Pasos para probar:

### 1. Ir a Stripe Dashboard
- Ve a [dashboard.stripe.com](https://dashboard.stripe.com)
- **Developers** → **Webhooks**

### 2. Seleccionar el Webhook
- Haz clic en tu webhook: `https://tnqtlltiwoocwajorglp.supabase.co/functions/v1/stripe-webhook`

### 3. Enviar Evento de Prueba
- Haz clic en **Send test webhook**
- Selecciona `checkout.session.completed`
- Haz clic en **Send test webhook**

### 4. Verificar en Supabase
- Ve a Supabase Dashboard → **Edge Functions** → **stripe-webhook** → **Logs**
- Busca logs recientes que digan:
  - `Webhook function called`
  - `Webhook event constructed: checkout.session.completed`

### 5. Si no hay logs en Supabase:
- El webhook no está llegando a Supabase
- Verifica la URL del endpoint
- Verifica las variables de entorno

### 6. Si hay logs pero con errores:
- Revisa los mensajes de error
- Verifica las variables de entorno 