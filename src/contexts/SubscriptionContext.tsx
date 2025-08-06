import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { 
  SubscriptionPlan, 
  UserSubscription, 
  PlanLimits, 
  SubscriptionContextValue,
  PlanType 
} from '@/types/subscription';
import { PLAN_LIMITS } from '@/types/subscription';

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Estado
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar planes disponibles
  const loadAvailablePlans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      const plans: SubscriptionPlan[] = data.map(plan => ({
        ...plan,
        name: plan.name as 'free' | 'premium_monthly' | 'premium_annual',
        interval_type: plan.interval_type as 'month' | 'year' | 'one_time',
        features: Array.isArray(plan.features) ? plan.features.map(f => String(f)) : []
      }));

      setAvailablePlans(plans);
    } catch (err) {
      console.error('Error loading plans:', err);
      setError('Error al cargar los planes de suscripción');
    }
  }, []);

  // Cargar suscripción del usuario
  const loadUserSubscription = useCallback(async () => {
    console.log('🔄 loadUserSubscription iniciado para usuario:', user?.email);
    console.log('📊 availablePlans length:', availablePlans.length);
    
    if (!user) {
      console.log('❌ No hay usuario, estableciendo valores por defecto');
      setCurrentPlan(null);
      setUserSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 Estableciendo loading = true');
      setIsLoading(true);
      
      // Comentado temporalmente para evitar errores de CORS
      // Procesar pagos pendientes automáticamente
      // try {
      //   const { data: pendingData, error: pendingError } = await supabase.functions.invoke('process-pending-payments');
      //   if (pendingData?.processed_count > 0) {
      //     console.log('✅ Pagos pendientes procesados:', pendingData.processed_count);
      //   }
      // } catch (pendingError) {
      //   console.log('⚠️ No se pudieron procesar pagos pendientes:', pendingError);
      // }
      
      console.log('🔄 Consultando user_subscriptions...');
      // Consulta simple sin join
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('📊 Resultado de user_subscriptions:', subscription);
      console.log('❌ Error de user_subscriptions:', subError);

      if (subError) {
        throw subError;
      }

      if (subscription) {
        // Obtener el plan por separado
        const { data: plan, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', subscription.subscription_plan_id)
          .maybeSingle();

        if (planError) {
          throw planError;
        }

        if (plan) {
          const subscriptionData: UserSubscription = {
            ...subscription,
            status: subscription.status as 'active' | 'canceled' | 'past_due' | 'trial' | 'incomplete',
            plan: {
              ...plan,
              name: plan.name as 'free' | 'premium_monthly' | 'premium_annual',
              interval_type: plan.interval_type as 'month' | 'year' | 'one_time',
              features: Array.isArray(plan.features) 
                ? plan.features.map(f => String(f))
                : []
            }
          };
          
          setUserSubscription(subscriptionData);
          setCurrentPlan(subscriptionData.plan);
        } else {
          // Plan no encontrado
          const freePlan = availablePlans.find(p => p.name === 'free');
          setCurrentPlan(freePlan || null);
          setUserSubscription(null);
        }
      } else {
        // Usuario sin suscripción - crear suscripción gratuita automáticamente
        console.log('📝 Usuario sin suscripción, creando suscripción gratuita...');
        
        const freePlan = availablePlans.find(p => p.name === 'free');
        if (freePlan) {
          try {
            // Crear suscripción gratuita con fechas de período
            const now = new Date();
            const endDate = new Date(now);
            endDate.setDate(endDate.getDate() + 30); // 30 días para plan gratuito
            
            const { data: newSubscription, error: createError } = await supabase
              .from('user_subscriptions')
              .insert({
                user_id: user.id,
                subscription_plan_id: freePlan.id,
                status: 'active',
                created_at: now.toISOString(),
                updated_at: now.toISOString(),
                current_period_start: now.toISOString(),
                current_period_end: endDate.toISOString()
              })
              .select()
              .single();

            if (createError) {
              console.error('❌ Error creando suscripción gratuita:', createError);
              throw createError;
            }

            console.log('✅ Suscripción gratuita creada:', newSubscription);
            
            const subscriptionData: UserSubscription = {
              ...newSubscription,
              status: 'active',
              plan: {
                ...freePlan,
                name: freePlan.name as 'free' | 'premium_monthly' | 'premium_annual',
                interval_type: freePlan.interval_type as 'month' | 'year' | 'one_time',
                features: Array.isArray(freePlan.features) 
                  ? freePlan.features.map(f => String(f))
                  : []
              }
            };
            
            setUserSubscription(subscriptionData);
            setCurrentPlan(freePlan);
          } catch (createErr) {
            console.error('❌ Error creando suscripción gratuita:', createErr);
            // Fallback al plan gratuito sin suscripción en BD
            setCurrentPlan(freePlan);
            setUserSubscription(null);
          }
        } else {
          setCurrentPlan(null);
          setUserSubscription(null);
        }
      }
    } catch (err) {
      console.error('Error loading user subscription:', err);
      setError('Error al cargar tu suscripción');
      
      // Fallback al plan gratuito
      const freePlan = availablePlans.find(p => p.name === 'free');
      setCurrentPlan(freePlan || null);
      setUserSubscription(null);
    } finally {
      console.log('🔄 Estableciendo loading = false');
      setIsLoading(false);
    }
  }, [user, availablePlans]);

  // Cargar datos iniciales
  useEffect(() => {
    loadAvailablePlans();
  }, [loadAvailablePlans]);

  useEffect(() => {
    if (availablePlans.length > 0) {
      loadUserSubscription();
    }
  }, [loadUserSubscription, availablePlans]);

  // Límites del plan actual
  const planLimits = useMemo((): PlanLimits => {
    if (!currentPlan) {
      return PLAN_LIMITS.free;
    }

    const planType = currentPlan.name as PlanType;
    return PLAN_LIMITS[planType] || PLAN_LIMITS.free;
  }, [currentPlan]);

  // Estados derivados
  const isPremium = useMemo(() => {
    return currentPlan?.name !== 'free' && userSubscription?.status === 'active';
  }, [currentPlan, userSubscription]);

  const isFreePlan = useMemo(() => {
    return currentPlan?.name === 'free' || !userSubscription;
  }, [currentPlan, userSubscription]);

  const isTrialActive = useMemo(() => {
    if (!userSubscription?.trial_end) return false;
    
    const trialEnd = new Date(userSubscription.trial_end);
    return trialEnd > new Date();
  }, [userSubscription]);

  const trialDaysRemaining = useMemo(() => {
    if (!isTrialActive || !userSubscription?.trial_end) return null;
    
    const trialEnd = new Date(userSubscription.trial_end);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }, [isTrialActive, userSubscription]);

  // Validaciones
  const canCreatePlaylist = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    
    if (planLimits.maxPlaylists === null) return true; // unlimited
    
    // Contar playlists actuales del usuario
    const { count, error } = await supabase
      .from('user_playlists')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error counting playlists:', error);
      return false;
    }

    return (count || 0) < planLimits.maxPlaylists;
  }, [user, planLimits]);

  const canAddToPlaylist = useCallback(async (playlistId: string): Promise<boolean> => {
    if (!user) return false;
    
    if (planLimits.maxPlaylistTracks === null) return true; // unlimited
    
    // Contar tracks en la playlist
    const { count, error } = await supabase
      .from('playlist_tracks')
      .select('id', { count: 'exact' })
      .eq('playlist_id', playlistId);

    if (error) {
      console.error('Error counting playlist tracks:', error);
      return false;
    }

    return (count || 0) < planLimits.maxPlaylistTracks;
  }, [user, planLimits]);

  const canAccessFeature = useCallback((feature: string): boolean => {
    if (isPremium) return true;
    
    // Features disponibles en plan gratuito
    const freeFeatures = [
      'basic_search',
      'basic_player',
      'limited_playlists',
      'preview_audio'
    ];
    
    return freeFeatures.includes(feature);
  }, [isPremium]);

  const getRemainingPlaylists = useCallback(async (): Promise<number | null> => {
    if (!user) return 0;
    if (planLimits.maxPlaylists === null) return null; // unlimited
    
    const { count, error } = await supabase
      .from('user_playlists')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error counting playlists:', error);
      return 0;
    }

    return Math.max(0, planLimits.maxPlaylists - (count || 0));
  }, [user, planLimits]);

  // Acciones con Stripe
  const upgradeToPlan = useCallback(async (planId: string): Promise<void> => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para actualizar tu plan.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Buscar el plan para obtener el stripe_price_id
      const plan = availablePlans.find(p => p.id === planId);
      if (!plan || !plan.stripe_price_id) {
        toast({
          title: 'Error',
          description: 'Plan no disponible para actualización.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          priceId: plan.stripe_price_id,
          userId: user.id,
          successUrl: `${window.location.origin}/profile?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        },
      });

      if (error) throw error;

      // Abrir Stripe checkout en nueva ventana
      if (data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      toast({
        title: 'Error',
        description: 'No se pudo crear la sesión de pago. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  }, [user, toast, availablePlans]);

  const cancelSubscription = useCallback(async (): Promise<void> => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para cancelar tu suscripción.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'cancel' },
      });

      if (error) throw error;

      toast({
        title: 'Suscripción cancelada',
        description: 'Tu suscripción se cancelará al final del período actual.',
      });

      // Reload subscription data
      await loadUserSubscription();
    } catch (err) {
      console.error('Error canceling subscription:', err);
      toast({
        title: 'Error',
        description: 'No se pudo cancelar la suscripción. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  }, [user, toast, loadUserSubscription]);

  const resumeSubscription = useCallback(async (): Promise<void> => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para reanudar tu suscripción.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'resume' },
      });

      if (error) throw error;

      toast({
        title: 'Suscripción reanudada',
        description: 'Tu suscripción ha sido reanudada exitosamente.',
      });

      // Reload subscription data
      await loadUserSubscription();
    } catch (err) {
      console.error('Error resuming subscription:', err);
      toast({
        title: 'Error',
        description: 'No se pudo reanudar la suscripción. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  }, [user, toast, loadUserSubscription]);

  const refreshSubscription = useCallback(async (): Promise<void> => {
    try {
      await loadUserSubscription();
    } catch (err) {
      console.error('Error refreshing subscription:', err);
    }
  }, [loadUserSubscription]);

  const value: SubscriptionContextValue = useMemo(() => ({
    // Estado
    currentPlan,
    userSubscription,
    planLimits,
    isLoading,
    error,
    
    // Queries
    availablePlans,
    
    // Validaciones
    canCreatePlaylist,
    canAddToPlaylist,
    canAccessFeature,
    getRemainingPlaylists,
    
    // Acciones
    upgradeToPlan,
    cancelSubscription,
    resumeSubscription,
    refreshSubscription,
    
    // Estado premium
    isPremium,
    isFreePlan,
    isTrialActive,
    trialDaysRemaining
  }), [
    currentPlan,
    userSubscription,
    planLimits,
    isLoading,
    error,
    availablePlans,
    canCreatePlaylist,
    canAddToPlaylist,
    canAccessFeature,
    getRemainingPlaylists,
    upgradeToPlan,
    cancelSubscription,
    resumeSubscription,
    refreshSubscription,
    isPremium,
    isFreePlan,
    isTrialActive,
    trialDaysRemaining
  ]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
