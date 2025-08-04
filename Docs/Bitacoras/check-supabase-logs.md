# Verificar Logs de Supabase Edge Functions

## Pasos para verificar:

### 1. Ir a Supabase Dashboard
- Ve a [supabase.com/dashboard](https://supabase.com/dashboard)
- Selecciona tu proyecto: `tnqtlltiwoocwajorglp`

### 2. Navegar a Edge Functions
- Ve a **Edge Functions** en el menú lateral
- Busca la función `stripe-webhook`

### 3. Verificar Logs
- Haz clic en `stripe-webhook`
- Ve a la pestaña **Logs**
- Busca logs recientes

### 4. Qué buscar en los logs:
- ✅ `Webhook function called`
- ✅ `Webhook event constructed: checkout.session.completed`
- ✅ `Handling checkout.session.completed`
- ✅ `Subscription updated successfully`
- ✅ `Payment recorded successfully`

### 5. Si no hay logs:
- El webhook no está siendo llamado
- Verifica la configuración en Stripe Dashboard

### 6. Si hay errores:
- Busca mensajes de error
- Verifica las variables de entorno
- Revisa la configuración del webhook

## Variables de Entorno Necesarias:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` 