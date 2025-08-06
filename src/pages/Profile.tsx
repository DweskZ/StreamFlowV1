import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  Loader2, 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Music, 
  Download,
  LogOut,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Globe,
  Palette,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionManagement, useStripeCheckout } from '@/hooks/useStripeIntegration';
import { useToast } from '@/hooks/use-toast';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { supabase } from '@/integrations/supabase/client';
import { UserStats } from '@/components/UserStats';
import { StripeTest } from '@/components/subscription/StripeTest';

interface SubscriptionData {
  id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  subscription_plans: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval_type: string;
    features: string[];
  };
}

interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      new_releases: boolean;
      playlist_updates: boolean;
    };
    playback: {
      autoplay: boolean;
      crossfade: boolean;
      gapless: boolean;
      volume: number;
      quality: 'low' | 'medium' | 'high';
    };
    privacy: {
      profile_public: boolean;
      listening_history_public: boolean;
      show_online_status: boolean;
    };
  };
  created_at: string;
  last_login?: string;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const { getSubscription, cancelSubscription, openBillingPortal, loading } = useSubscriptionManagement();
  const { processPendingPayments, getPendingCheckoutPlan, clearPendingCheckoutPlan } = useStripeCheckout();
  const { toast } = useToast();
  const { preferences, updateTheme, updatePlaybackSettings, updateNotificationSettings, updatePrivacySettings } = useUserPreferences();
  
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Estados para edición de perfil
  const [editData, setEditData] = useState({
    display_name: '',
    bio: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (user && !profile) { // Solo cargar si no hay perfil ya
        setLoadingProfile(true);
        
        try {
          // Crear perfil por defecto solo si no existe
          if (!profile) {
            console.log('Creating default profile for user');
            const defaultProfile: UserProfile = {
              id: user.id,
              email: user.email || '',
              display_name: user.email?.split('@')[0] || 'Usuario',
              preferences: {
                theme: 'system',
                language: 'es',
                notifications: {
                  email: true,
                  push: true,
                  new_releases: true,
                  playlist_updates: true
                },
                playback: {
                  autoplay: true,
                  crossfade: false,
                  gapless: true,
                  volume: 0.7,
                  quality: 'medium'
                },
                privacy: {
                  profile_public: false,
                  listening_history_public: false,
                  show_online_status: true
                }
              },
              created_at: new Date().toISOString()
            };
            setProfile(defaultProfile);
            setEditData({
              display_name: defaultProfile.display_name,
              bio: defaultProfile.bio || ''
            });
          }
          
        } catch (error) {
          console.error('Error loading profile data:', error);
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    loadData();
  }, [user]); // Solo depende de user

  // useEffect separado para cargar suscripción
  useEffect(() => {
    const loadSubscription = async () => {
      console.log('🔄 loadSubscription iniciado para usuario:', user?.email);
      
      if (user) {
        setLoadingSubscription(true);
        try {
          console.log('🔄 Llamando a getSubscription...');
          const subData = await getSubscription();
          console.log('📊 Resultado de getSubscription:', subData);
          setSubscription(subData);
        } catch (error) {
          console.error('❌ Error loading subscription:', error);
          setSubscription(null);
        } finally {
          console.log('🔄 Estableciendo loadingSubscription = false');
          setLoadingSubscription(false);
        }
      } else {
        console.log('❌ No hay usuario, estableciendo loadingSubscription = false');
        setLoadingSubscription(false);
        setSubscription(null);
      }
    };

    loadSubscription();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    
    setSaving(true);
    try {
      // Por ahora, solo actualizar el estado local ya que la tabla profiles no existe aún
      setProfile(prev => prev ? {
        ...prev,
        display_name: editData.display_name,
        bio: editData.bio
      } : null);
      
      setEditingProfile(false);
      toast({
        title: 'Perfil actualizado',
        description: 'Tu perfil se ha actualizado correctamente.',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden.',
        variant: 'destructive'
      });
      return;
    }

    if (passwordData.new.length < 6) {
      toast({
        title: 'Error',
        description: 'La nueva contraseña debe tener al menos 6 caracteres.',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      });

      if (error) throw error;

      setPasswordData({ current: '', new: '', confirm: '' });
      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña se ha actualizado correctamente.',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cambiar la contraseña. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };



  const handleDowngradeToFree = async () => {
    if (confirm('⚠️ ¿Estás seguro de que quieres cambiar a plan gratuito?')) {
      try {
        console.log('🔄 Cambiando a plan gratuito...');
        
        // Buscar el plan gratuito
        const { data: freePlan, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', 'free')
          .single();

        if (planError) {
          console.error('❌ Error obteniendo plan gratuito:', planError);
          throw planError;
        }

        // Actualizar la suscripción a plan gratuito usando UPDATE en lugar de UPSERT
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            subscription_plan_id: freePlan.id,
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user?.id);

        if (updateError) {
          console.error('❌ Error actualizando suscripción:', updateError);
          throw updateError;
        }

        console.log('✅ Cambiado a plan gratuito exitosamente');
        
        // Recargar datos de suscripción
        const subData = await getSubscription();
        setSubscription(subData);
        
        toast({
          title: 'Plan cambiado',
          description: 'Has cambiado al plan gratuito correctamente.',
        });
      } catch (error) {
        console.error('❌ Error en handleDowngradeToFree:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cambiar al plan gratuito.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleChangeToPlan = async (planName: string) => {
    if (confirm(`⚠️ ¿Estás seguro de que quieres cambiar a plan ${planName}? Esto es solo para testing.`)) {
      try {
        console.log(`🔄 Cambiando a plan ${planName}...`);
        
        // Buscar el plan especificado
        const { data: plan, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', planName)
          .single();

        if (planError) {
          console.error(`❌ Error obteniendo plan ${planName}:`, planError);
          throw planError;
        }

        // Actualizar la suscripción al plan especificado
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            subscription_plan_id: plan.id,
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user?.id);

        if (updateError) {
          console.error(`❌ Error actualizando suscripción a ${planName}:`, updateError);
          throw updateError;
        }

        console.log(`✅ Cambiado a plan ${planName} exitosamente`);
        
        // Recargar datos de suscripción
        const subData = await getSubscription();
        setSubscription(subData);
        
        toast({
          title: 'Plan cambiado',
          description: `Has cambiado al plan ${plan.display_name || plan.name}.`,
        });
      } catch (error) {
        console.error(`❌ Error en handleChangeToPlan ${planName}:`, error);
        toast({
          title: 'Error',
          description: `No se pudo cambiar al plan ${planName}.`,
          variant: 'destructive',
        });
      }
    }
  };

  const handleCreateFreeSubscription = async () => {
    if (confirm('⚠️ ¿Estás seguro de que quieres crear una suscripción gratuita? Esto es solo para testing.')) {
      try {
        console.log('🔄 Creando suscripción gratuita...');
        
        // Buscar el plan gratuito
        const { data: freePlan, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', 'free')
          .single();

        if (planError) {
          console.error('❌ Error obteniendo plan gratuito:', planError);
          throw planError;
        }

        // Crear nueva suscripción gratuita con fechas de período
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 30); // 30 días para plan gratuito
        
        const { data: newSubscription, error: createError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user?.id,
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

        console.log('✅ Suscripción gratuita creada exitosamente:', newSubscription);
        
        // Recargar datos de suscripción
        const subData = await getSubscription();
        setSubscription(subData);
        
        toast({
          title: 'Suscripción creada',
          description: 'Se creó tu suscripción gratuita correctamente.',
        });
      } catch (error) {
        console.error('❌ Error en handleCreateFreeSubscription:', error);
        toast({
          title: 'Error',
          description: 'No se pudo crear la suscripción gratuita.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSimulateCheckout = async () => {
    const planChoice = confirm(
      '¿Qué plan quieres simular que compraste?\n\n' +
      '• OK = Premium Mensual ($9.99/mes)\n' +
      '• Cancelar = Premium Anual ($99.99/año)'
    );
    
    const planName = planChoice ? 'premium_monthly' : 'premium_annual';
    
    try {
      console.log(`🛒 Simulando checkout de ${planName}...`);
      
      // Buscar el plan
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', planName)
        .single();

      if (planError) {
        console.error(`❌ Error obteniendo plan ${planName}:`, planError);
        throw planError;
      }

      // Simular un pago en payment_history
      const { error: paymentError } = await supabase
        .from('payment_history')
        .insert({
          user_id: user?.id,
          subscription_id: subscription?.id,
          stripe_payment_intent_id: `pi_simulated_${Date.now()}`,
          stripe_invoice_id: `in_simulated_${Date.now()}`,
          amount: plan.price,
          currency: 'USD',
          status: 'succeeded',
          created_at: new Date().toISOString()
        });

      if (paymentError) {
        console.error('❌ Error simulando pago:', paymentError);
        // No lanzar error, continuar con la actualización
      }

      // Actualizar la suscripción
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          subscription_plan_id: plan.id,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (updateError) {
        console.error(`❌ Error actualizando suscripción a ${planName}:`, updateError);
        throw updateError;
      }

      console.log(`✅ Checkout simulado exitosamente para ${planName}`);
      
      // Recargar datos de suscripción
      const subData = await getSubscription();
      setSubscription(subData);
      
      toast({
        title: 'Checkout simulado',
        description: `Se simuló un checkout exitoso para ${plan.display_name || plan.name}.`,
      });
    } catch (error) {
      console.error(`❌ Error en handleSimulateCheckout:`, error);
      toast({
        title: 'Error',
        description: 'No se pudo simular el checkout.',
        variant: 'destructive',
      });
    }
  };

  const handleForceUpdateSubscription = async () => {
    try {
      console.log('🔄 Actualizando estado de suscripción...');
      
      // PRIMERO: Verificar si hay un plan pendiente de checkout
      const pendingPlanName = await getPendingCheckoutPlan();
      console.log('🔍 Plan pendiente de checkout:', pendingPlanName);
      
      if (pendingPlanName) {
        console.log('🎯 Usando plan pendiente:', pendingPlanName);
        
        // Buscar el plan en la base de datos
        const { data: plan, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', pendingPlanName)
          .single();

        if (planError) {
          console.error('❌ Error obteniendo plan pendiente:', planError);
          throw planError;
        }

        // Actualizar la suscripción al plan pendiente
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            subscription_plan_id: plan.id,
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user?.id);

        if (updateError) {
          console.error('❌ Error actualizando suscripción:', updateError);
          throw updateError;
        }

        console.log('✅ Suscripción actualizada al plan pendiente:', plan.name);
        
        // Limpiar el plan pendiente
        await clearPendingCheckoutPlan();
        
        // Recargar datos de suscripción
        const subData = await getSubscription();
        setSubscription(subData);
        
        toast({
          title: 'Suscripción actualizada',
          description: `Se actualizó tu suscripción a ${plan.display_name || plan.name} correctamente.`,
        });
        
        return; // Salir aquí, no continuar con el resto de la lógica
      }
      
      // Si no hay plan pendiente, continuar con la lógica original
      console.log('📝 No hay plan pendiente, usando lógica de pagos recientes...');
      
      // Verificar si hay pagos recientes
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

      // Listar todas las suscripciones del usuario para debugging
      const { data: allSubscriptions, error: allSubError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id);

      console.log('📊 Todas las suscripciones del usuario:', allSubscriptions);
      console.log('❌ Error obteniendo todas las suscripciones:', allSubError);

      // Verificar estado actual de la suscripción
      const { data: currentSubscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (subError) {
        console.error('❌ Error obteniendo suscripción:', subError);
        throw subError;
      }

      // Determinar qué plan usar basado en los pagos recientes
      let targetPlan = null;
      
      if (recentPayments && recentPayments.length > 0) {
        // Si hay pagos recientes, usar el plan del pago más reciente
        const latestPayment = recentPayments[0];
        console.log('📊 Pago más reciente:', latestPayment);
        console.log('🔍 Detalles del pago:');
        console.log('  - subscription_id:', latestPayment.subscription_id);
        console.log('  - amount:', latestPayment.amount);
        console.log('  - currency:', latestPayment.currency);
        console.log('  - created_at:', latestPayment.created_at);
        
                        if (latestPayment.subscription_id) {
                  console.log('🔍 Buscando suscripción con ID:', latestPayment.subscription_id);
                  
                  // Obtener la suscripción del pago más reciente
                  const { data: subscription, error: subError } = await supabase
                    .from('user_subscriptions')
                    .select('subscription_plan_id')
                    .eq('stripe_subscription_id', latestPayment.subscription_id)
                    .single();
                    
                  console.log('🔍 Buscando suscripción con stripe_subscription_id:', latestPayment.subscription_id);
                  console.log('📊 Resultado de búsqueda:', subscription);
                  console.log('❌ Error de búsqueda:', subError);
                    
                  if (!subError && subscription) {
                    // Obtener el plan de la suscripción
                    const { data: plan, error: planError } = await supabase
                      .from('subscription_plans')
                      .select('*')
                      .eq('id', subscription.subscription_plan_id)
                      .single();
                      
                    if (!planError && plan) {
                      targetPlan = plan;
                      console.log('🎯 Plan detectado de la suscripción:', targetPlan.name);
                    }
                  } else {
                    console.log('⚠️ No se encontró suscripción con stripe_subscription_id:', latestPayment.subscription_id);
                  }
                }
                
                // Si no se detectó plan por subscription_id, usar el monto como fallback
                if (!targetPlan) {
                  console.log('💰 Usando monto como fallback:', latestPayment.amount);
                  
                  // Buscar el plan basado en el monto (convertir de centavos si es necesario)
                  let searchAmount = latestPayment.amount;
                  
                  // Si el monto es muy alto (probablemente en centavos), convertirlo
                  if (searchAmount > 100) {
                    searchAmount = searchAmount / 100;
                    console.log('🔄 Convirtiendo monto de centavos a dólares:', searchAmount);
                  }
                  
                  const { data: plans, error: plansError } = await supabase
                    .from('subscription_plans')
                    .select('*')
                    .eq('price', searchAmount);
                    
                  if (!plansError && plans && plans.length > 0) {
                    targetPlan = plans[0];
                    console.log('🎯 Plan detectado por monto:', targetPlan.name, '($' + targetPlan.price + ')');
                  } else {
                    console.log('⚠️ No se encontró plan con precio:', searchAmount);
                    console.log('📊 Planes disponibles:', plans);
                  }
                }
      }
      
      // Si no se detectó plan del pago, preguntar al usuario qué plan quiere
      if (!targetPlan) {
        console.log('❓ No se detectó plan automáticamente');
        
        // Mostrar opciones al usuario
        const planChoice = confirm(
          'No se detectó automáticamente el plan. ¿Quieres actualizar a Premium Mensual?\n\n' +
          '• OK = Premium Mensual ($9.99/mes)\n' +
          '• Cancelar = Premium Anual ($99.99/año)'
        );
        
        const planName = planChoice ? 'premium_monthly' : 'premium_annual';
        
        const { data: selectedPlan, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', planName)
          .single();

        if (planError) {
          console.error('❌ Error obteniendo plan:', planError);
          throw planError;
        }
        targetPlan = selectedPlan;
        console.log('🎯 Plan seleccionado por usuario:', targetPlan.name);
      }

      // Si hay pagos recientes o la suscripción actual es diferente al plan objetivo
      if (recentPayments && recentPayments.length > 0 || 
          (currentSubscription && currentSubscription.subscription_plan_id !== targetPlan.id)) {
        
        console.log('🔄 Actualizando a plan:', targetPlan.name);
        
        // Actualizar la suscripción al plan correcto
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            subscription_plan_id: targetPlan.id,
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user?.id);

        if (updateError) {
          console.error('❌ Error actualizando suscripción:', updateError);
          throw updateError;
        }

        console.log('✅ Suscripción actualizada a premium exitosamente');
        
        // Recargar datos de suscripción
        const subData = await getSubscription();
        setSubscription(subData);
        
        toast({
          title: 'Suscripción actualizada',
          description: `Se actualizó tu suscripción a ${targetPlan.display_name || targetPlan.name} correctamente.`,
        });
      } else {
        console.log('✅ Suscripción ya está actualizada');
        
        // Recargar datos de suscripción
        const subData = await getSubscription();
        setSubscription(subData);
        
        toast({
          title: 'Sin cambios',
          description: 'Tu suscripción ya está actualizada.',
        });
      }
    } catch (error) {
      console.error('❌ Error en handleForceUpdateSubscription:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la suscripción.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'null' || dateString === 'undefined') {
      return 'No disponible';
    }
    
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'No disponible';
    }
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para calcular el período de suscripción
  const getSubscriptionPeriod = (subscription: any) => {
    if (!subscription) return null;
    
    // Si ya tiene fechas definidas, usarlas
    if (subscription.current_period_start && subscription.current_period_end) {
      return {
        start: subscription.current_period_start,
        end: subscription.current_period_end
      };
    }
    
    // Si no tiene fechas, calcularlas basadas en la fecha de creación
    if (subscription.created_at) {
      const startDate = new Date(subscription.created_at);
      let endDate = new Date(startDate);
      
      // Calcular fecha de fin basada en el tipo de plan
      if (subscription.subscription_plans?.interval_type === 'month') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (subscription.subscription_plans?.interval_type === 'year') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        // Para planes gratuitos o de un solo pago, mostrar 30 días
        endDate.setDate(endDate.getDate() + 30);
      }
      
      return {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      };
    }
    
    return null;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Activa</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      case 'past_due':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pago Pendiente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente.',
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return null;
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-6">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header del Perfil */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-lg">
                {profile?.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{profile?.display_name || 'Usuario'}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              {profile?.bio && <p className="text-sm mt-1">{profile.bio}</p>}
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="subscription">Suscripción</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
          </TabsList>

          {/* Pestaña de Perfil */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="display_name">Nombre de usuario</Label>
                      <Input
                        id="display_name"
                        value={editData.display_name}
                        onChange={(e) => setEditData(prev => ({ ...prev, display_name: e.target.value }))}
                        placeholder="Tu nombre de usuario"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Biografía</Label>
                      <Input
                        id="bio"
                        value={editData.bio}
                        onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Cuéntanos sobre ti..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} disabled={saving}>
                        {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </Button>
                      <Button variant="outline" onClick={() => setEditingProfile(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>Nombre de usuario</Label>
                      <p className="text-sm text-muted-foreground">{profile?.display_name || 'No establecido'}</p>
                    </div>
                    <div>
                      <Label>Biografía</Label>
                      <p className="text-sm text-muted-foreground">{profile?.bio || 'No establecida'}</p>
                    </div>
                    <Button onClick={() => setEditingProfile(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Información de la Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div>
                    <Label>Miembro desde</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(profile?.created_at || user.created_at || '')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <UserStats className="mt-6" />
          </TabsContent>

          {/* Pestaña de Suscripción */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Suscripción
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSubscription ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Cargando suscripción...</span>
                  </div>
                ) : subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{subscription.subscription_plans.name}</h3>
                        <p className="text-muted-foreground">{subscription.subscription_plans.description}</p>
                      </div>
                      {getStatusBadge(subscription.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Periodo actual</p>
                          <p className="text-sm text-muted-foreground">
                            {(() => {
                              const period = getSubscriptionPeriod(subscription);
                              if (period) {
                                return `${formatDate(period.start)} - ${formatDate(period.end)}`;
                              }
                              return 'Período no definido';
                            })()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Precio</p>
                        <p className="text-lg font-semibold">
                          ${subscription.subscription_plans.price} {subscription.subscription_plans.currency.toUpperCase()}
                          <span className="text-sm font-normal text-muted-foreground">
                            /{subscription.subscription_plans.interval_type === 'month' ? 'mes' : 'año'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Características incluidas:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {subscription.subscription_plans.features?.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                      <Button 
                        onClick={openBillingPortal}
                        disabled={loading}
                        variant="outline"
                      >
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Gestionar Facturación
                      </Button>
                      
                      <Button 
                        onClick={handleForceUpdateSubscription}
                        disabled={loading}
                        variant="secondary"
                      >
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Actualizar Estado
                      </Button>
                      
                      {subscription.status === 'active' && (
                        <Button 
                          onClick={handleDowngradeToFree}
                          disabled={loading}
                          variant="outline"
                          className="border-orange-500 text-orange-500 hover:bg-orange-50"
                        >
                          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                          Cambiar a Plan Gratuito
                        </Button>
                      )}
                          
                                                  {/* Botones para testing manual - OCULTOS PARA MVP */}
                        {false && (
                          <>
                            <Button 
                              onClick={() => handleChangeToPlan('premium_monthly')}
                              disabled={loading}
                              variant="outline"
                              className="border-blue-500 text-blue-500 hover:bg-blue-50"
                            >
                              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                              📅 Cambiar a Mensual (Testing)
                            </Button>
                            
                            <Button 
                              onClick={() => handleChangeToPlan('premium_annual')}
                              disabled={loading}
                              variant="outline"
                              className="border-green-500 text-green-500 hover:bg-green-50"
                            >
                              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                              📅 Cambiar a Anual (Testing)
                            </Button>
                            
                            {/* Botón para simular checkout reciente */}
                            <Button 
                              onClick={handleSimulateCheckout}
                              disabled={loading}
                              variant="outline"
                              className="border-purple-500 text-purple-500 hover:bg-purple-50"
                            >
                              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                              🛒 Simular Checkout Reciente
                            </Button>
                            
                            {/* Botón para limpiar plan pendiente */}
                            <Button 
                              onClick={async () => {
                                await clearPendingCheckoutPlan();
                                toast({
                                  title: 'Plan pendiente limpiado',
                                  description: 'Se limpió el plan pendiente de checkout.',
                                });
                              }}
                              disabled={loading}
                              variant="outline"
                              className="border-orange-500 text-orange-500 hover:bg-orange-50"
                            >
                              🧹 Limpiar Plan Pendiente
                            </Button>
                            
                            {/* Botón para crear suscripción gratuita */}
                            <Button 
                              onClick={handleCreateFreeSubscription}
                              disabled={loading}
                              variant="outline"
                              className="border-teal-500 text-teal-500 hover:bg-teal-50"
                            >
                              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                              🆓 Crear Suscripción Gratuita
                            </Button>
                          </>
                        )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No tienes una suscripción activa</p>
                    <Button onClick={() => window.location.href = '/app/pricing'}>
                      Ver Planes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
                         {/* Componente de prueba de Stripe - OCULTO PARA MVP */}
             {false && <StripeTest />}
            
            {/* Botón para actualizar estado de suscripción - OCULTO PARA MVP */}
            {false && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Gestión de Suscripción
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Si tu suscripción no se actualiza automáticamente, usa este botón para procesar pagos pendientes.
                    </p>
                    <Button 
                      onClick={handleForceUpdateSubscription}
                      disabled={loading}
                      variant="secondary"
                      className="w-full sm:w-auto"
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Actualizar Estado de Suscripción
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pestaña de Configuración */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                                 <div>
                   <h4 className="font-medium mb-4">Apariencia</h4>
                   <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <div>
                         <Label>Tema</Label>
                         <p className="text-sm text-muted-foreground">Elige el tema de la aplicación</p>
                       </div>
                       <div className="flex items-center gap-2">
                         <Button 
                           variant={preferences.theme === 'light' ? 'default' : 'outline'} 
                           size="sm"
                           onClick={() => updateTheme('light')}
                         >
                           <Sun className="h-4 w-4" />
                         </Button>
                         <Button 
                           variant={preferences.theme === 'dark' ? 'default' : 'outline'} 
                           size="sm"
                           onClick={() => updateTheme('dark')}
                         >
                           <Moon className="h-4 w-4" />
                         </Button>
                         <Button 
                           variant={preferences.theme === 'system' ? 'default' : 'outline'} 
                           size="sm"
                           onClick={() => updateTheme('system')}
                         >
                           <Monitor className="h-4 w-4" />
                         </Button>
                       </div>
                     </div>
                   </div>
                 </div>

                <Separator />

                                 <div>
                   <h4 className="font-medium mb-4">Reproducción</h4>
                   <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <div>
                         <Label>Autoplay</Label>
                         <p className="text-sm text-muted-foreground">Reproducir automáticamente la siguiente canción</p>
                       </div>
                       <Switch 
                         checked={preferences.playback.autoplay}
                         onCheckedChange={(checked) => updatePlaybackSettings({ autoplay: checked })}
                       />
                     </div>
                     <div className="flex items-center justify-between">
                       <div>
                         <Label>Crossfade</Label>
                         <p className="text-sm text-muted-foreground">Transición suave entre canciones</p>
                       </div>
                       <Switch 
                         checked={preferences.playback.crossfade}
                         onCheckedChange={(checked) => updatePlaybackSettings({ crossfade: checked })}
                       />
                     </div>
                     <div className="flex items-center justify-between">
                       <div>
                         <Label>Reproducción sin pausas</Label>
                         <p className="text-sm text-muted-foreground">Reproducir canciones sin pausas</p>
                       </div>
                       <Switch 
                         checked={preferences.playback.gapless}
                         onCheckedChange={(checked) => updatePlaybackSettings({ gapless: checked })}
                       />
                     </div>
                   </div>
                 </div>

                <Separator />

                                 <div>
                   <h4 className="font-medium mb-4">Notificaciones</h4>
                   <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <div>
                         <Label>Notificaciones por email</Label>
                         <p className="text-sm text-muted-foreground">Recibir notificaciones por correo electrónico</p>
                       </div>
                       <Switch 
                         checked={preferences.notifications.email}
                         onCheckedChange={(checked) => updateNotificationSettings({ email: checked })}
                       />
                     </div>
                     <div className="flex items-center justify-between">
                       <div>
                         <Label>Nuevos lanzamientos</Label>
                         <p className="text-sm text-muted-foreground">Notificaciones sobre nuevos lanzamientos</p>
                       </div>
                       <Switch 
                         checked={preferences.notifications.new_releases}
                         onCheckedChange={(checked) => updateNotificationSettings({ new_releases: checked })}
                       />
                     </div>
                     <div className="flex items-center justify-between">
                       <div>
                         <Label>Actualizaciones de playlist</Label>
                         <p className="text-sm text-muted-foreground">Notificaciones sobre cambios en playlists</p>
                       </div>
                       <Switch 
                         checked={preferences.notifications.playlist_updates}
                         onCheckedChange={(checked) => updateNotificationSettings({ playlist_updates: checked })}
                       />
                     </div>
                   </div>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Seguridad */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Cambiar Contraseña
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Contraseña actual</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.current}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                      placeholder="Tu contraseña actual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="new-password">Nueva contraseña</Label>
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.new}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                    placeholder="Nueva contraseña"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                    placeholder="Confirma tu nueva contraseña"
                  />
                </div>
                <Button onClick={handleChangePassword} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Cambiar Contraseña
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Privacidad
                </CardTitle>
              </CardHeader>
                             <CardContent className="space-y-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <Label>Perfil público</Label>
                     <p className="text-sm text-muted-foreground">Permitir que otros usuarios vean tu perfil</p>
                   </div>
                   <Switch 
                     checked={preferences.privacy.profile_public}
                     onCheckedChange={(checked) => updatePrivacySettings({ profile_public: checked })}
                   />
                 </div>
                 <div className="flex items-center justify-between">
                   <div>
                     <Label>Historial de reproducción público</Label>
                     <p className="text-sm text-muted-foreground">Mostrar tu historial de reproducción</p>
                   </div>
                   <Switch 
                     checked={preferences.privacy.listening_history_public}
                     onCheckedChange={(checked) => updatePrivacySettings({ listening_history_public: checked })}
                   />
                 </div>
                 <div className="flex items-center justify-between">
                   <div>
                     <Label>Estado en línea</Label>
                     <p className="text-sm text-muted-foreground">Mostrar cuando estás en línea</p>
                   </div>
                   <Switch 
                     checked={preferences.privacy.show_online_status}
                     onCheckedChange={(checked) => updatePrivacySettings({ show_online_status: checked })}
                   />
                 </div>
               </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
