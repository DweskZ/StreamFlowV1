import { useSubscription } from '@/contexts/SubscriptionContext';
import { useCallback } from 'react';
import { useToast } from './use-toast';

/**
 * Hook personalizado para manejar suscripciones con validaciones
 */
export const useSubscriptionValidation = () => {
  const subscription = useSubscription();
  const { toast } = useToast();

  /**
   * Validar si puede crear una playlist y mostrar mensaje si no
   */
  const validateCreatePlaylist = useCallback(async (): Promise<boolean> => {
    const canCreate = await subscription.canCreatePlaylist();
    
    if (!canCreate) {
      const remaining = await subscription.getRemainingPlaylists();
      
      if (remaining === 0) {
        toast({
          title: 'Límite alcanzado',
          description: `Has alcanzado el límite de ${subscription.planLimits.maxPlaylists} playlists del plan gratuito. Actualiza a Premium para playlists ilimitadas.`,
          variant: 'destructive',
        });
      }
    }
    
    return canCreate;
  }, [subscription, toast]);

  /**
   * Validar si puede añadir track a playlist
   */
  const validateAddToPlaylist = useCallback(async (playlistId: string): Promise<boolean> => {
    const canAdd = await subscription.canAddToPlaylist(playlistId);
    
    if (!canAdd) {
      toast({
        title: 'Límite alcanzado',
        description: `Has alcanzado el límite de ${subscription.planLimits.maxPlaylistTracks} canciones por playlist del plan gratuito.`,
        variant: 'destructive',
      });
    }
    
    return canAdd;
  }, [subscription, toast]);

  /**
   * Mostrar prompt de upgrade
   */
  const showUpgradePrompt = useCallback((feature: string) => {
    toast({
      title: 'Función Premium',
      description: `${feature} está disponible solo para usuarios Premium. ¡Actualiza tu plan para disfrutar de todas las funciones!`,
    });
  }, [toast]);

  /**
   * Verificar acceso a feature y mostrar prompt si es necesario
   */
  const checkFeatureAccess = useCallback((feature: string): boolean => {
    const hasAccess = subscription.canAccessFeature(feature);
    
    if (!hasAccess) {
      showUpgradePrompt(feature);
    }
    
    return hasAccess;
  }, [subscription, showUpgradePrompt]);

  return {
    ...subscription,
    // Validaciones con UI
    validateCreatePlaylist,
    validateAddToPlaylist,
    checkFeatureAccess,
    showUpgradePrompt,
  };
};

/**
 * Hook para obtener información del plan actual
 */
export const usePlanInfo = () => {
  const { currentPlan, planLimits, isPremium, isFreePlan } = useSubscription();

  const planName = currentPlan?.display_name || 'Plan Gratuito';
  const planColor = isPremium ? 'text-yellow-500' : 'text-gray-500';
  const planBadgeColor = isPremium ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-500/20 text-gray-500';
  
  return {
    planName,
    planColor,
    planBadgeColor,
    currentPlan,
    planLimits,
    isPremium,
    isFreePlan,
  };
};
