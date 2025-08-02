# Crear Webhook en Stripe Dashboard

## Si el webhook no existe, sigue estos pasos:

### 1. Ir a Stripe Dashboard
- Ve a [dashboard.stripe.com](https://dashboard.stripe.com)
- Inicia sesión

### 2. Navegar a Webhooks
- Ve a **Developers** → **Webhooks**
- Haz clic en **Add endpoint**

### 3. Configurar el Endpoint
- **Endpoint URL:** `https://tnqtlltiwoocwajorglp.supabase.co/functions/v1/stripe-webhook`
- Haz clic en **Select events**

### 4. Seleccionar Eventos
Marca estos eventos:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### 5. Crear el Webhook
- Haz clic en **Add endpoint**
- Copia el **Signing secret** (lo necesitaremos)

### 6. Configurar el Signing Secret en Supabase
- Ve a Supabase Dashboard → **Settings** → **Edge Functions**
- Busca la variable `STRIPE_WEBHOOK_SECRET`
- Pega el signing secret que copiaste

### 7. Probar el Webhook
- Regresa a Stripe Dashboard → **Webhooks**
- Haz clic en tu webhook
- Ve a **Send test webhook**
- Selecciona `checkout.session.completed`
- Haz clic en **Send test webhook** 