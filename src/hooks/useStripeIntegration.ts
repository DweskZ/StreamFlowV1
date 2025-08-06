import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

interface StripeCheckoutOptions {
  priceId: string
  successUrl?: string
  cancelUrl?: string
}

interface SubscriptionData {
  id: string
  user_id: string
  subscription_plan_id: string
  status: string
  current_period_start: string
  current_period_end: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  created_at: string
  updated_at: string
  subscription_plans: {
    id: string
    name: string
    description: string
    price: number
    currency: string
    interval_type: string
    features: string[]
  }
}

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const createCheckoutSession = async ({ 
    priceId, 
    successUrl, 
    cancelUrl,
    planName 
  }: { 
    priceId: string; 
    successUrl?: string; 
    cancelUrl?: string; 
    planName?: string;
  }) => {
    try {
      // Guardar el plan que se está intentando comprar (específico por usuario)
      if (planName) {
        const { data: { user } } = await supabase.auth.getUser();
        const userEmail = user?.email || 'anonymous';
        const storageKey = `pending_checkout_plan_${userEmail}`;
        const timestampKey = `pending_checkout_timestamp_${userEmail}`;
        
        localStorage.setItem(storageKey, planName);
        localStorage.setItem(timestampKey, Date.now().toString());
        console.log('💾 Guardado plan pendiente para usuario:', userEmail, planName);
      }

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          priceId,
          successUrl,
          cancelUrl
        }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL received');

      // Abrir en nueva pestaña
      window.open(data.url, '_blank', 'noopener,noreferrer');
      
      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  };

  // Función temporal para procesar pagos directamente (mientras arreglamos el webhook)
  const processPaymentDirectly = async (sessionId: string) => {
    try {
      console.log('🔄 Procesando pago directamente...', sessionId);
      
      const { data, error } = await supabase.functions.invoke('process-payment-directly', {
        body: { sessionId }
      });

      if (error) {
        console.error('❌ Error procesando pago:', error);
        throw error;
      }

      console.log('✅ Pago procesado exitosamente:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en processPaymentDirectly:', error);
      throw error;
    }
  };

  // Función para procesar pagos pendientes automáticamente
    const processPendingPayments = async () => {
    try {
      console.log('🔄 Procesando pagos pendientes...');

      // Verificar si hay pagos recientes sin procesar
      const { data: recentPayments, error: paymentsError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('❌ Error obteniendo pagos recientes:', paymentsError);
        throw paymentsError;
      }

      console.log('📊 Pagos recientes encontrados:', recentPayments?.length || 0);

      // Verificar si la suscripción está actualizada
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('❌ Error obteniendo suscripción:', subError);
        throw subError;
      }

      // Si no hay suscripción o está incompleta, NO actualizar automáticamente
      if (!subscription || subscription.status === 'incomplete') {
        console.log('⚠️ Suscripción incompleta detectada, pero NO actualizando automáticamente');
        console.log('📝 Usa el botón "Actualizar Estado" manualmente para procesar');
        return { processed_count: 0, message: 'Suscripción incompleta - actualización manual requerida' };
      }

      console.log('✅ No hay pagos pendientes para procesar');
      return { processed_count: 0, message: 'No hay pagos pendientes' };
    } catch (error) {
      console.error('❌ Error en processPendingPayments:', error);
      throw error;
    }
  };

  // Función para obtener el plan pendiente de checkout
  const getPendingCheckoutPlan = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email || 'anonymous';
    const storageKey = `pending_checkout_plan_${userEmail}`;
    const timestampKey = `pending_checkout_timestamp_${userEmail}`;
    
    const planName = localStorage.getItem(storageKey);
    const timestamp = localStorage.getItem(timestampKey);
    
    if (!planName || !timestamp) {
      return null;
    }
    
    // Verificar que no haya pasado más de 1 hora
    const now = Date.now();
    const checkoutTime = parseInt(timestamp);
    const oneHour = 60 * 60 * 1000; // 1 hora en milisegundos
    
    if (now - checkoutTime > oneHour) {
      // Limpiar datos expirados
      localStorage.removeItem(storageKey);
      localStorage.removeItem(timestampKey);
      return null;
    }
    
    return planName;
  };

  // Función para limpiar el plan pendiente
  const clearPendingCheckoutPlan = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email || 'anonymous';
    const storageKey = `pending_checkout_plan_${userEmail}`;
    const timestampKey = `pending_checkout_timestamp_${userEmail}`;
    
    localStorage.removeItem(storageKey);
    localStorage.removeItem(timestampKey);
    console.log('🧹 Plan pendiente limpiado para usuario:', userEmail);
  };

  return {
    createCheckoutSession,
    processPaymentDirectly,
    processPendingPayments,
    getPendingCheckoutPlan,
    clearPendingCheckoutPlan,
    loading,
    error
  }
}

export const useSubscriptionManagement = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const getSubscription = async (): Promise<any | null> => {
    if (!user) {
      setError('User not authenticated')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      // Consulta simple sin join
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (subError) {
        throw subError
      }

      if (!subscription) {
        return null
      }

      // Obtener el plan por separado
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', subscription.subscription_plan_id)
        .maybeSingle()

      if (planError) {
        throw planError
      }

      // Combinar los datos
      return {
        ...subscription,
        subscription_plans: plan
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Get subscription error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const cancelSubscription = async () => {
    if (!user) {
      setError('User not authenticated')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: functionError } = await supabase.functions.invoke('manage-subscription?action=cancel-subscription', {
        body: {
          userId: user.id
        }
      })

      if (functionError) {
        throw new Error(functionError.message)
      }

      if (data.error) {
        throw new Error(data.error)
      }

      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Cancel subscription error:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateSubscription = async (newPriceId: string) => {
    if (!user) {
      setError('User not authenticated')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: functionError } = await supabase.functions.invoke('manage-subscription?action=update-subscription', {
        body: {
          userId: user.id,
          newPriceId
        }
      })

      if (functionError) {
        throw new Error(functionError.message)
      }

      if (data.error) {
        throw new Error(data.error)
      }

      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Update subscription error:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const openBillingPortal = async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: functionError } = await supabase.functions.invoke('manage-subscription?action=get-billing-portal', {
        body: {
          userId: user.id
        }
      })

      if (functionError) {
        throw new Error(functionError.message)
      }

      if (data.error) {
        throw new Error(data.error)
      }

      // Redirigir al portal de facturación
      if (data.url) {
        window.location.href = data.url
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Billing portal error:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    getSubscription,
    cancelSubscription,
    updateSubscription,
    openBillingPortal,
    loading,
    error
  }
}
