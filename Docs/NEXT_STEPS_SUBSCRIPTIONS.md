# 💳 Plan de Implementación: Sistema de Suscripciones con Stripe

## 🎯 Objetivo
Implementar un sistema completo de suscripciones con tres planes: Gratuito, Premium Mensual y Premium Anual.

## 📋 Fases de Implementación

### Fase 1: Configuración de Base de Datos (Supabase)
**Tiempo estimado: 1-2 días**

#### Tablas a crear:
```sql
-- Planes de suscripción
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL, -- 'free', 'premium_monthly', 'premium_annual'
  display_name VARCHAR NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  interval VARCHAR NOT NULL, -- 'month', 'year', 'one_time'
  stripe_price_id VARCHAR,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suscripciones de usuarios
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_plan_id UUID REFERENCES subscription_plans(id),
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR,
  status VARCHAR NOT NULL, -- 'active', 'canceled', 'past_due', 'trial'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historial de pagos
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  stripe_payment_intent_id VARCHAR,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Fase 2: Configuración de Stripe
**Tiempo estimado: 1 día**

#### Backend Setup:
1. Instalar Stripe SDK: `npm install stripe`
2. Configurar webhook endpoints
3. Crear productos y precios en Stripe Dashboard
4. Implementar endpoints de suscripción

#### Variables de entorno:
```env
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Fase 3: Definición de Planes y Features
**Tiempo estimado: 1 día**

#### Plan Gratuito:
- ✅ Búsqueda básica de música
- ✅ Reproductor básico (previews de 30s)
- ✅ 3 playlists máximo
- ✅ Ads cada 3 canciones (placeholder)
- ❌ Sin descargas
- ❌ Sin audio en alta calidad

#### Plan Premium Mensual ($9.99/mes):
- ✅ Todo lo del plan gratuito
- ✅ Playlists ilimitadas
- ✅ Sin anuncios
- ✅ Audio en alta calidad
- ✅ Descargas offline (simuladas)
- ✅ Recomendaciones avanzadas

#### Plan Premium Anual ($99.99/año):
- ✅ Todo lo del Premium Mensual
- ✅ 2 meses gratis (descuento)
- ✅ Acceso anticipado a features
- ✅ Soporte prioritario

### Fase 4: Implementación Frontend
**Tiempo estimado: 3-4 días**

#### Componentes a crear:
1. **PricingPage** - Mostrar planes y precios
2. **SubscriptionManager** - Gestionar suscripción actual
3. **PaymentForm** - Formulario de pago con Stripe
4. **BillingHistory** - Historial de pagos
5. **PlanUpgrade** - Prompts para upgrade

#### Hooks a crear:
1. **useSubscription** - Estado de suscripción del usuario
2. **useStripe** - Integración con Stripe
3. **usePlanLimits** - Validar límites según plan

### Fase 5: Middlewares y Protecciones
**Tiempo estimado: 2 días**

#### Protecciones por plan:
- Límite de playlists
- Bloqueo de features premium
- Validación de suscripción activa
- Manejo de suscripciones vencidas

#### Middleware de autorización:
```typescript
const requirePremium = (feature: string) => {
  // Validar si el usuario tiene acceso a la feature
}
```

### Fase 6: Testing y Pulido
**Tiempo estimado: 2 días**

#### Testing:
- Flujo completo de suscripción
- Webhooks de Stripe
- Renovaciones automáticas
- Cancelaciones
- Cambios de plan

## 🛠️ Archivos a Crear/Modificar

### Nuevos archivos:
```
src/
  components/
    subscription/
      PricingPage.tsx
      PaymentForm.tsx
      SubscriptionCard.tsx
      BillingHistory.tsx
      PlanUpgrade.tsx
  contexts/
    SubscriptionContext.tsx
  hooks/
    useSubscription.ts
    useStripe.ts
    usePlanLimits.ts
  pages/
    Pricing.tsx
    Billing.tsx
  types/
    subscription.ts
    payment.ts

backend/
  routes/
    stripe.js
    subscription.js
  middleware/
    subscription.js
  webhooks/
    stripe.js
```

### Archivos a modificar:
- `src/contexts/AuthContext.tsx` - Agregar datos de suscripción
- `src/components/Sidebar.tsx` - Mostrar plan actual
- `src/pages/Dashboard.tsx` - Prompts de upgrade
- `backend/routes/user.js` - Endpoints de suscripción

## 💰 Precios Sugeridos

| Plan | Precio | Características Clave |
|------|--------|----------------------|
| Gratuito | $0 | Básico con limitaciones |
| Premium Mensual | $9.99/mes | Sin límites, sin ads |
| Premium Anual | $99.99/año | 2 meses gratis |

## 🚀 Próximos Pasos Inmediatos

1. **Crear las tablas en Supabase**
2. **Configurar cuenta de Stripe**
3. **Implementar SubscriptionContext**
4. **Crear página de precios básica**
5. **Integrar formulario de pago**

## 📊 Métricas a Implementar

- Tasa de conversión free → premium
- Churn rate (cancelaciones)
- Revenue mensual/anual
- Features más usadas por plan

---

**¿Quieres que empecemos con la implementación?** 
Podemos comenzar por crear las tablas en Supabase y el contexto de suscripciones.
