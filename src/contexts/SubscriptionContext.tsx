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
        features: Array.isArray(plan.features) ? plan.features : []
      }));

      setAvailablePlans(plans);
    } catch (err) {
      console.error('Error loading plans:', err);
      setError('Error al cargar los planes de suscripción');
    }
  }, []);

  // Cargar suscripción del usuario
  const loadUserSubscription = useCallback(async () => {
    if (!user) {
      // Usuario no autenticado = plan gratuito
      const freePlan = availablePlans.find(p => p.name === 'free');
      setCurrentPlan(freePlan || null);
      setUserSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.subscription_plan) {
        const subscription: UserSubscription = {
          ...data,
          plan: {
            ...data.subscription_plan,
            features: Array.isArray(data.subscription_plan.features) 
              ? data.subscription_plan.features 
              : []
          }
        };
        
        setUserSubscription(subscription);
        setCurrentPlan(subscription.plan);
      } else {
        // Usuario sin suscripción = plan gratuito
        const freePlan = availablePlans.find(p => p.name === 'free');
        setCurrentPlan(freePlan || null);
        setUserSubscription(null);
      }
    } catch (err) {
      console.error('Error loading user subscription:', err);
      setError('Error al cargar tu suscripción');
      
      // Fallback al plan gratuito
      const freePlan = availablePlans.find(p => p.name === 'free');
      setCurrentPlan(freePlan || null);
      setUserSubscription(null);
    } finally {
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
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          planId,
          successUrl: `${window.location.origin}/app/payment-success?success=true`,
          cancelUrl: `${window.location.origin}/app/pricing?canceled=true`,
        },
      });

      if (error) throw error;

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      toast({
        title: 'Error',
        description: 'No se pudo crear la sesión de pago. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

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
