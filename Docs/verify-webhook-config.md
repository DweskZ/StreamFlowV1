# Verificar Configuración del Webhook en Stripe

## Pasos para verificar:

### 1. Ir a Stripe Dashboard
- Ve a [dashboard.stripe.com](https://dashboard.stripe.com)
- Inicia sesión con tu cuenta

### 2. Navegar a Webhooks
- Ve a **Developers** → **Webhooks**
- Busca el endpoint: `https://tnqtlltiwoocwajorglp.supabase.co/functions/v1/stripe-webhook`

### 3. Verificar Estado del Webhook
- ✅ **Status:** Debe estar **ACTIVE**
- ✅ **Endpoint URL:** Debe ser exactamente: `https://tnqtlltiwoocwajorglp.supabase.co/functions/v1/stripe-webhook`

### 4. Verificar Eventos Configurados
El webhook debe tener estos eventos:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### 5. Verificar Eventos Fallidos
- Haz clic en el webhook
- Ve a la pestaña **Events**
- Busca eventos con estado **Failed**
- Si hay fallos, revisa los logs de error

### 6. Probar el Webhook
- Haz clic en **Send test webhook**
- Selecciona `checkout.session.completed`
- Envía el evento de prueba
- Verifica que llegue a Supabase

## Si el webhook no existe:
1. Haz clic en **Add endpoint**
2. URL: `https://tnqtlltiwoocwajorglp.supabase.co/functions/v1/stripe-webhook`
3. Selecciona todos los eventos mencionados arriba
4. Haz clic en **Add endpoint** 