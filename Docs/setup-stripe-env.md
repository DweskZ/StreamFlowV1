# 🔧 Configuración de Variables de Entorno para Stripe

## Variables Necesarias

Para que las edge functions de Stripe funcionen correctamente, necesitas configurar las siguientes variables de entorno en tu proyecto de Supabase:

### 1. Variables de Stripe

```bash
# Clave secreta de Stripe (sk_test_... o sk_live_...)
STRIPE_SECRET_KEY=sk_test_...

# Clave pública de Stripe (pk_test_... o pk_live_...)
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Secreto del webhook de Stripe (whsec_...)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Variables de Supabase (ya configuradas)

```bash
# URL de tu proyecto Supabase
SUPABASE_URL=https://tnqtlltiwoocwajorglp.supabase.co

# Clave anónima de Supabase
SUPABASE_ANON_KEY=eyJ...

# Clave de servicio de Supabase (para webhooks)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 🔍 Cómo Configurar

### Opción 1: Dashboard de Supabase

1. Ve a tu [Dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Edge Functions**
4. En la sección **Environment Variables**, agrega:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`

### Opción 2: CLI de Supabase

```bash
# Configurar variables de entorno
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...
npx supabase secrets set STRIPE_PUBLISHABLE_KEY=pk_test_...
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🎯 Obtener las Claves de Stripe

### 1. Crear cuenta en Stripe
- Ve a [stripe.com](https://stripe.com)
- Crea una cuenta o inicia sesión

### 2. Obtener las claves
- Ve a **Developers** → **API keys**
- Copia la **Secret key** (empieza con `sk_test_` o `sk_live_`)
- Copia la **Publishable key** (empieza con `pk_test_` o `pk_live_`)

### 3. Configurar Webhook
- Ve a **Developers** → **Webhooks**
- Crea un nuevo endpoint con la URL:
  ```
  https://tnqtlltiwoocwajorglp.supabase.co/functions/v1/stripe-webhook
  ```
- Selecciona los eventos:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- Copia el **Signing secret** (empieza con `whsec_`)

## 🚀 Desplegar las Funciones

Una vez configuradas las variables de entorno:

```bash
# Desplegar todas las funciones
npx supabase functions deploy stripe-checkout
npx supabase functions deploy stripe-webhook
npx supabase functions deploy manage-subscription
```

## ✅ Verificar Configuración

Para verificar que todo está configurado correctamente:

1. Ve a **Edge Functions** en el dashboard de Supabase
2. Verifica que las funciones estén **ACTIVE**
3. Revisa los logs para asegurarte de que no hay errores
4. Prueba la función `test-stripe` si existe

## 🔒 Seguridad

- **NUNCA** compartas tu `STRIPE_SECRET_KEY`
- Usa claves de **test** para desarrollo
- Usa claves de **live** solo en producción
- Mantén las claves seguras y no las subas a Git

## 📝 Notas Importantes

- Las variables de entorno son específicas de cada proyecto
- Si cambias de proyecto, necesitas reconfigurar las variables
- Los webhooks deben apuntar a la URL correcta de tu proyecto
- Las claves de test y live son diferentes, asegúrate de usar las correctas 