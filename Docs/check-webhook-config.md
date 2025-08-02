# 🔧 Verificación de Configuración del Webhook

## 📋 Pasos para Verificar:

### **1. En Stripe Dashboard:**
1. Ve a [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Developers** → **Webhooks**
3. Busca el endpoint: `https://tnqtlltiwoocwajorglp.supabase.co/functions/v1/stripe-webhook`
4. Verifica que esté **ACTIVE**

### **2. Eventos Configurados:**
El webhook debe tener estos eventos:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### **3. Verificar Logs del Webhook:**
1. En Stripe Dashboard → **Webhooks** → **Tu endpoint** → **Events**
2. Busca eventos recientes
3. Verifica si hay errores (códigos 4xx o 5xx)

### **4. Verificar en Supabase:**
1. **Dashboard** → **Edge Functions** → **stripe-webhook** → **Logs**
2. Busca logs recientes
3. Verifica si hay errores

## 🔍 Posibles Problemas:

### **Problema 1: Webhook no configurado**
- **Síntoma:** No hay eventos en Stripe Dashboard
- **Solución:** Configurar el webhook con la URL correcta

### **Problema 2: Eventos no seleccionados**
- **Síntoma:** Webhook existe pero no procesa eventos
- **Solución:** Agregar los eventos necesarios

### **Problema 3: Error en la función**
- **Síntoma:** Eventos fallan (códigos 4xx/5xx)
- **Solución:** Revisar logs de Supabase

### **Problema 4: URL incorrecta**
- **Síntoma:** Webhook no recibe eventos
- **Solución:** Verificar que la URL sea exactamente:
  ```
  https://tnqtlltiwoocwajorglp.supabase.co/functions/v1/stripe-webhook
  ```

## 🚀 Próximos Pasos:

1. **Verifica la configuración** del webhook en Stripe
2. **Revisa los logs** en ambos lados
3. **Ejecuta las consultas SQL** para ver el estado actual
4. **Dime qué encuentras** para continuar el diagnóstico 