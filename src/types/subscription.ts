// types/subscription.ts
export interface SubscriptionPlan {
  id: string;
  name: 'free' | 'premium_monthly' | 'premium_annual';
  display_name: string;
  description?: string;
  price: number;
  currency: string;
  interval_type: 'month' | 'year' | 'one_time';
  interval_count: number;
  stripe_price_id?: string;
  stripe_product_id?: string;
  features: string[];
  max_playlists?: number; // null = unlimited
  max_downloads?: number; // null = unlimited
  has_ads: boolean;
  has_high_quality: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  subscription_plan_id: string;
  plan: SubscriptionPlan;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  status: 'active' | 'canceled' | 'past_due' | 'trial' | 'incomplete';
  current_period_start?: string;
  current_period_end?: string;
  trial_start?: string;
  trial_end?: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PlanLimits {
  maxPlaylists: number | null; // null = unlimited
  maxDownloads: number | null;
  hasAds: boolean;
  hasHighQuality: boolean;
  canCreatePublicPlaylists: boolean;
  canCollaboratePlaylists: boolean;
  maxPlaylistTracks: number | null;
}

export interface SubscriptionContextValue {
  // Estado
  currentPlan: SubscriptionPlan | null;
  userSubscription: UserSubscription | null;
  planLimits: PlanLimits;
  isLoading: boolean;
  error: string | null;
  
  // Queries
  availablePlans: SubscriptionPlan[];
  
  // Validaciones
  canCreatePlaylist: () => Promise<boolean>;
  canAddToPlaylist: (playlistId: string) => Promise<boolean>;
  canAccessFeature: (feature: string) => boolean;
  getRemainingPlaylists: () => Promise<number | null>;
  
  // Acciones
  upgradeToPlan: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  resumeSubscription: () => Promise<void>;
  
  // Estado premium
  isPremium: boolean;
  isFreePlan: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number | null;
}

export type PlanType = 'free' | 'premium_monthly' | 'premium_annual';

export const PLAN_FEATURES = {
  free: [
    'Búsqueda básica de música',
    'Reproductor estándar',
    'Máximo 3 playlists',
    'Previews de 30 segundos',
    'Con anuncios'
  ],
  premium_monthly: [
    'Todo del plan gratuito',
    'Playlists ilimitadas',
    'Sin anuncios',
    'Calidad de audio premium',
    'Descargas offline',
    'Recomendaciones avanzadas'
  ],
  premium_annual: [
    'Todo del Premium Mensual',
    '2 meses gratis (ahorro del 17%)',
    'Acceso anticipado a nuevas funciones',
    'Soporte prioritario',
    'Playlists colaborativas'
  ]
} as const;

export const PLAN_LIMITS = {
  free: {
    maxPlaylists: 3,
    maxDownloads: 0,
    hasAds: true,
    hasHighQuality: false,
    canCreatePublicPlaylists: false,
    canCollaboratePlaylists: false,
    maxPlaylistTracks: 50
  },
  premium_monthly: {
    maxPlaylists: null, // unlimited
    maxDownloads: null, // unlimited
    hasAds: false,
    hasHighQuality: true,
    canCreatePublicPlaylists: true,
    canCollaboratePlaylists: true,
    maxPlaylistTracks: null // unlimited
  },
  premium_annual: {
    maxPlaylists: null, // unlimited
    maxDownloads: null, // unlimited
    hasAds: false,
    hasHighQuality: true,
    canCreatePublicPlaylists: true,
    canCollaboratePlaylists: true,
    maxPlaylistTracks: null // unlimited
  }
} as const;
