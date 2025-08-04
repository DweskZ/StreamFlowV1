# 🧪 Guía de Prueba del Sistema de Suscripciones

## 📋 Pasos para Probar

### **1. Ejecutar Scripts SQL (en Supabase SQL Editor)**

```sql
-- Primero ejecutar:
-- fix-rls-policies.sql

-- Luego verificar:
-- debug-subscription-issues.sql
```

### **2. Verificar que los datos estén correctos**

Los resultados deberían mostrar:
- ✅ 3 planes en `subscription_plans` (free, premium_monthly, premium_annual)
- ✅ `stripe_price_id` configurados para los planes premium
- ✅ Políticas RLS creadas correctamente

### **3. Probar en la Aplicación**

1. **Iniciar sesión** en la aplicación
2. **Ir a** `/app/pricing`
3. **Hacer clic** en "Actualizar a Premium" en cualquier plan premium
4. **Verificar** que redirija a Stripe Checkout

### **4. Verificar Logs**

Si hay errores, revisar los logs de la Edge Function en:
- Supabase Dashboard → Edge Functions → stripe-checkout → Logs

### **5. Página de Pruebas**

Ir a `/app/test-subscription` para ver el estado de la suscripción.

## 🔍 Posibles Errores y Soluciones

### **Error 406 en user_subscriptions**
- **Causa:** Políticas RLS no configuradas
- **Solución:** Ejecutar `fix-rls-policies.sql`

### **Error 400 en stripe-checkout**
- **Causa:** Plan no encontrado o stripe_price_id faltante
- **Solución:** Verificar que los planes tengan stripe_price_id configurados

### **Error de autenticación**
- **Causa:** Usuario no autenticado
- **Solución:** Asegurarse de estar logueado

## ✅ Criterios de Éxito

- ✅ Página de precios carga sin errores
- ✅ Botones de upgrade funcionan
- ✅ Redirección a Stripe Checkout exitosa
- ✅ Logs de Edge Function muestran información detallada
- ✅ Página de test muestra información correcta 