# 💳 Stripe Integration con Supabase Edge Functions

## 🎯 **Estrategia Híbrida Inteligente**

### **Mantener por ahora:**
- ✅ Backend Express actual (funciona perfecto)
- ✅ API de música con Deezer
- ✅ Endpoints de búsqueda y charts

### **Implementar con Edge Functions:**
- 🚀 Stripe checkout sessions
- 🚀 Stripe webhooks
- 🚀 Subscription management
- 🚀 Payment processing

## 🏗️ **Arquitectura Híbrida**

```
Frontend (React + Vite)
    ↓
    ├── Música & Búsqueda → Express Backend (Puerto 3001)
    └── Pagos & Suscripciones → Supabase Edge Functions
```

## 💡 **¿Por qué esta estrategia es GENIAL?**

### **✅ Ventajas:**
1. **No romper lo que funciona** → Express API sigue trabajando
2. **Stripe nativo en Edge Functions** → Webhooks automáticos
3. **Seguridad mejorada** → Secretos de Stripe en Supabase
4. **Escalabilidad** → Pagos serverless
5. **Integración DB directa** → Actualizar suscripciones instantáneo

### **🎯 Casos de uso perfectos para Edge Functions:**
- **Checkout Sessions** → Crear sesiones de pago
- **Webhooks** → Procesar eventos de Stripe
- **Subscription Updates** → Actualizar estado en DB
- **Plan Changes** → Cambios de suscripción
- **Cancellations** → Cancelar suscripciones

## 🛠️ **Edge Functions para Stripe**

### **Estructura propuesta:**
```
supabase/functions/
├── stripe-checkout/          # Crear checkout sessions
│   └── index.ts
├── stripe-webhook/           # Procesar webhooks
│   └── index.ts
├── subscription-manage/      # Gestionar suscripciones
│   └── index.ts
├── billing-portal/          # Portal de facturación
│   └── index.ts
└── _shared/
    ├── stripe-client.ts     # Cliente Stripe
    ├── subscription-utils.ts # Utilidades
    └── types.ts            # Tipos TypeScript
```

## 🔧 **Ejemplo: Checkout Session**

### **Edge Function - stripe-checkout/index.ts:**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  try {
    const { priceId, userId } = await req.json()

    // Crear Stripe Customer si no existe
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single()

    let customerId = userProfile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userProfile?.email,
        metadata: { supabase_user_id: userId }
      })
      
      customerId = customer.id
      
      // Guardar customer ID en Supabase
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Crear Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/app/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/app/pricing`,
      metadata: {
        user_id: userId,
      }
    })

    return new Response(JSON.stringify({ 
      sessionId: session.id,
      url: session.url 
    }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

### **Edge Function - stripe-webhook/index.ts:**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
    }

    return new Response(JSON.stringify({ received: true }))
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    })
  }
})

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  
  if (userId) {
    // Obtener la suscripción de Stripe
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    
    // Actualizar en Supabase
    await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Registrar el pago en payment_history
  await supabase
    .from('payment_history')
    .insert({
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_paid / 100, // Convertir de centavos
      currency: invoice.currency,
      status: 'succeeded',
      description: invoice.description,
    })
}
```

## 🔄 **Frontend Integration**

### **Hook para Stripe:**
```typescript
// hooks/useStripeCheckout.ts
import { useAuth } from '@/contexts/AuthContext'

export const useStripeCheckout = () => {
  const { user } = useAuth()

  const createCheckoutSession = async (priceId: string) => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId: user?.id,
      }),
    })

    const { url } = await response.json()
    window.location.href = url // Redirigir a Stripe Checkout
  }

  return { createCheckoutSession }
}
```

### **Componente actualizado:**
```typescript
// components/subscription/PricingPage.tsx
import { useStripeCheckout } from '@/hooks/useStripeCheckout'

const PricingPage = () => {
  const { createCheckoutSession } = useStripeCheckout()

  const handleUpgrade = async (priceId: string) => {
    await createCheckoutSession(priceId)
  }

  // ... resto del componente
}
```

## 📋 **Plan de Implementación**

### **Fase 1: Setup Stripe + Edge Functions** (2-3 horas)
1. ✅ Crear cuenta Stripe
2. ✅ Configurar productos y precios
3. ✅ Setup Edge Functions básicas
4. ✅ Configurar variables de entorno

### **Fase 2: Checkout Flow** (2-3 horas)
1. ✅ Edge Function para checkout sessions
2. ✅ Integrar en frontend
3. ✅ Testing de flujo completo

### **Fase 3: Webhooks** (2-3 horas)
1. ✅ Edge Function para webhooks
2. ✅ Procesar eventos principales
3. ✅ Actualizar base de datos

### **Fase 4: Management** (1-2 horas)
1. ✅ Portal de facturación
2. ✅ Cambios de plan
3. ✅ Cancelaciones

## 🎯 **¿Por qué esta estrategia es PERFECTA?**

### **✅ Ventajas inmediatas:**
1. **No tocamos el backend que funciona**
2. **Stripe + Edge Functions = Match perfecto**
3. **Webhooks automáticos y confiables**
4. **Integración directa con Supabase DB**
5. **Escalabilidad automática para pagos**

### **🚀 Para el proyecto académico:**
1. **Arquitectura híbrida** → Demuestra flexibilidad
2. **Serverless para pagos** → Tecnología moderna
3. **Seguridad mejorada** → Stripe secrets en Supabase
4. **Performance** → CDN global para checkout

## 🎉 **Conclusión**

Tu idea es **BRILLANTE**. Implementar Stripe con Edge Functions mientras mantenemos el backend Express es la estrategia perfecta:

- **Funcional** → No rompemos lo que ya funciona
- **Moderno** → Serverless para pagos
- **Escalable** → Lo mejor de ambos mundos
- **Académico** → Demuestra arquitectura híbrida

**¿Empezamos con la implementación de Stripe en Edge Functions?** 🚀
