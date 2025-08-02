import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRucXRsbHRpd29vY3dham9yZ2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTE0NDQsImV4cCI6MjA2ODg4NzQ0NH0.41ZEEl9xpd6wvpr88wkbjKvmqtfRVMZt7bl8zCzL6os';

interface StripeCheckoutOptions {
  priceId: string
  successUrl?: string
  cancelUrl?: string
}

interface SubscriptionData {
  id: string
  plan_id: string
  status: string
  current_period_start: string
  current_period_end: string
  subscription_plans: {
    id: string
    name: string
    description: string
    price: number
    currency: string
    interval: string
    features: string[]
  }
}

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const createCheckoutSession = async (options: StripeCheckoutOptions) => {
    console.log('useStripeCheckout: createCheckoutSession called with:', options);
    
    if (!user) {
      setError('User not authenticated')
      console.error('No user authenticated');
      return null
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Calling supabase function with userId:', user.id);
      
      // Crear un timeout de 30 segundos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Function call timeout after 30 seconds')), 30000)
      })
      
      const functionPromise = supabase.functions.invoke('stripe-checkout', {
        body: {
          priceId: options.priceId,
          userId: user.id,
          successUrl: options.successUrl,
          cancelUrl: options.cancelUrl
        }
      })
      
      console.log('⏳ Waiting for function response...');
      const { data, error: functionError } = await Promise.race([functionPromise, timeoutPromise]) as any

      console.log('✅ Function call completed');
      console.log('Supabase function response:', { data, error: functionError });

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message)
      }

      if (data?.error) {
        console.error('Data error:', data.error);
        throw new Error(data.error)
      }

      console.log('Function response data:', data);
      console.log('Type of data:', typeof data);
      console.log('Data URL:', data?.url);

      // Redirigir al checkout de Stripe
      if (data?.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        window.location.href = data.url
        return data
      } else {
        console.error('No URL returned from checkout session. Full response:', data);
        throw new Error('No URL returned from checkout session')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Checkout error:', err)
      console.error('Error type:', typeof err)
      console.error('Error details:', JSON.stringify(err, null, 2))
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    createCheckoutSession,
    loading,
    error
  }
}

export const useSubscriptionManagement = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const getSubscription = async (): Promise<SubscriptionData | null> => {
    if (!user) {
      setError('User not authenticated')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: functionError } = await supabase.functions.invoke('manage-subscription?action=get-subscription', {
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

      return data.subscription

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
      // Obtener el token de sesión del usuario autenticado
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token
      
      if (!accessToken) {
        throw new Error('No access token found')
      }
      
      const { data, error: functionError } = await supabase.functions.invoke('manage-subscription?action=cancel-subscription', {
        body: {
          userId: user.id
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': SUPABASE_ANON_KEY
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
      // Obtener el token de sesión del usuario autenticado
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token
      
      if (!accessToken) {
        throw new Error('No access token found')
      }
      
      const { data, error: functionError } = await supabase.functions.invoke('manage-subscription?action=update-subscription', {
        body: {
          userId: user.id,
          newPriceId
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': SUPABASE_ANON_KEY
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
      // Obtener el token de sesión del usuario autenticado
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token
      
      if (!accessToken) {
        throw new Error('No access token found')
      }
      
      const { data, error: functionError } = await supabase.functions.invoke('manage-subscription?action=get-billing-portal', {
        body: {
          userId: user.id
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': SUPABASE_ANON_KEY
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
