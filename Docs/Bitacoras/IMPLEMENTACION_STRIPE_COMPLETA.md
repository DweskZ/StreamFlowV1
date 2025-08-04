# 🚀 Guía Completa de Implementación: Stripe + Supabase Edge Functions

## ✅ Estado Actual

Hemos completado la implementación híbrida de StreamFlow:
- ✅ Backend Express.js (APIs de música) - **Mantener**
- ✅ Frontend React con autenticación - **Listo**
- ✅ Base de datos Supabase completa - **Lista**
- ✅ Edge Functions para Stripe - **Implementadas**
- ✅ Hooks de integración - **Listos**
- ✅ UI actualizada - **Lista**

## 📋 Pasos para Implementar

### 1. Configurar Stripe (15 minutos)

#### a) Crear cuenta en Stripe
```bash
# 1. Ve a https://stripe.com
# 2. Crea cuenta y activa modo testing
# 3. Ve a Dashboard > API Keys
```

#### b) Crear productos en Stripe
```bash
# En Stripe Dashboard > Products:
# 1. Producto: "StreamFlow Premium"
# 2. Precios:
#    - Mensual: $9.99/mes (price_XXXXXX)
#    - Anual: $99.99/año (price_YYYYYY)
```

#### c) Configurar Webhook
```bash
# En Stripe Dashboard > Webhooks:
# 1. Endpoint URL: https://TU-PROYECTO.supabase.co/functions/v1/stripe-webhook
# 2. Eventos:
#    ✅ checkout.session.completed
#    ✅ customer.subscription.updated
#    ✅ customer.subscription.deleted
#    ✅ invoice.payment_succeeded
#    ✅ invoice.payment_failed
```

### 2. Configurar Variables de Entorno

```bash
# En Supabase CLI:
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_TU_CLAVE_AQUI
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET_AQUI
```

### 3. Actualizar Base de Datos

```sql
-- En Supabase SQL Editor:
UPDATE subscription_plans 
SET stripe_price_id = 'price_XXXXXX'  -- Tu price ID mensual
WHERE name = 'premium_monthly';

UPDATE subscription_plans 
SET stripe_price_id = 'price_YYYYYY'  -- Tu price ID anual
WHERE name = 'premium_annual';
```

### 4. Desplegar Edge Functions

```bash
# Ejecutar script de despliegue:
.\deploy-stripe-functions.ps1

# O manual:
npx supabase functions deploy stripe-checkout
npx supabase functions deploy stripe-webhook  
npx supabase functions deploy manage-subscription
```

### 5. Probar Integración

#### a) Flujo de Checkout
1. Ve a `/pricing`
2. Selecciona plan premium
3. Debería redirigir a Stripe Checkout
4. Completa pago de prueba
5. Verifica redirección a `/profile?success=true`

#### b) Datos de Prueba de Stripe
```bash
# Tarjeta de prueba que FUNCIONA:
4242 4242 4242 4242
MM/YY: cualquier fecha futura
CVC: cualquier 3 dígitos
```

## 🏗️ Arquitectura Final

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Express Backend │    │ Supabase        │
│                 │    │                  │    │                 │
│ • Auth UI       │◄──►│ • Deezer API     │    │ • Auth          │
│ • Pricing       │    │ • Music Search   │    │ • Database      │
│ • Profile       │    │ • Charts         │    │ • Edge Functions│
│ • Player        │    │ • Albums/Artists │    │   - Stripe      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                               │
         └───────────── Stripe Payments ─────────────────┘
```

## 🔧 Archivos Creados/Modificados

### Edge Functions
- ✅ `supabase/functions/stripe-checkout/index.ts`
- ✅ `supabase/functions/stripe-webhook/index.ts`
- ✅ `supabase/functions/manage-subscription/index.ts`

### Frontend
- ✅ `src/hooks/useStripeIntegration.ts`
- ✅ `src/pages/PricingPage.tsx` (actualizada)
- ✅ `src/pages/Profile.tsx` (actualizada)

### Scripts
- ✅ `deploy-stripe-functions.ps1`
- ✅ `STRIPE_SETUP.md`

## 🚦 Flujos Implementados

### 1. Compra de Suscripción
```
Usuario click "Suscribirse" → stripe-checkout Function → Stripe Checkout → Pago → Webhook → DB actualizada
```

### 2. Cancelación
```
Usuario click "Cancelar" → manage-subscription Function → Stripe API → DB actualizada
```

### 3. Portal de Facturación
```
Usuario click "Gestionar" → manage-subscription Function → Stripe Billing Portal
```

## 🎯 Funcionalidades Listas

- ✅ **Checkout de Stripe** - Crear sesiones de pago
- ✅ **Webhooks** - Actualizar suscripciones automáticamente
- ✅ **Gestión de suscripciones** - Cancelar, actualizar, portal
- ✅ **UI completa** - Pricing page y perfil con info de suscripción
- ✅ **Híbrido** - Express para música + Edge Functions para pagos

## 🔧 Comandos Útiles

```bash
# Ver logs de Edge Functions
npx supabase functions logs stripe-checkout

# Probar función localmente
npx supabase functions serve

# Ver secretos configurados
npx supabase secrets list

# Reiniciar proyecto Supabase
npx supabase db reset
```

## 🐛 Troubleshooting

### Error: "Function not found"
```bash
# Verificar que las funciones están desplegadas
npx supabase functions list
```

### Error: "Missing environment variables"
```bash
# Verificar secrets
npx supabase secrets list
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```

### Error en webhook
```bash
# Verificar endpoint en Stripe Dashboard
# URL: https://TU-PROYECTO.supabase.co/functions/v1/stripe-webhook
```

## 🎉 ¡Listo para Producción!

Una vez que pruebes en testing:

1. **Cambia a claves de producción de Stripe**
2. **Actualiza variables de entorno con claves reales**
3. **Configura precios reales en Stripe**
4. **¡Lanza tu app con pagos funcionales!**

---

**Resultado:** Sistema híbrido completo con Express backend para música y Stripe + Edge Functions para pagos. Lo mejor de ambos mundos! 🚀
