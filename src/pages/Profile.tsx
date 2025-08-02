import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionManagement } from '@/hooks/useStripeIntegration';
import { Crown, Calendar, CreditCard, Loader2 } from 'lucide-react';

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
    interval: string;
    features: string[];
  };
}

export default function Profile() {
  const { user } = useAuth();
  const { getSubscription, cancelSubscription, openBillingPortal, loading } = useSubscriptionManagement();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      if (user) {
        setLoadingSubscription(true);
        const subData = await getSubscription();
        setSubscription(subData);
        setLoadingSubscription(false);
      }
    };

    loadSubscription();
  }, [user, getSubscription]);

  const handleCancelSubscription = async () => {
    if (confirm('¿Estás seguro de que quieres cancelar tu suscripción?')) {
      const success = await cancelSubscription();
      if (success) {
        // Recargar los datos de suscripción
        const subData = await getSubscription();
        setSubscription(subData);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-6">
      <Header />
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Información del Usuario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Perfil de Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2"><strong>Email:</strong> {user.email}</p>
          </CardContent>
        </Card>

        {/* Información de Suscripción */}
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
                        {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Precio</p>
                    <p className="text-lg font-semibold">
                      ${subscription.subscription_plans.price} {subscription.subscription_plans.currency.toUpperCase()}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{subscription.subscription_plans.interval}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Características del Plan */}
                <div>
                  <p className="text-sm font-medium mb-2">Características incluidas:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {subscription.subscription_plans.features?.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button 
                    onClick={openBillingPortal}
                    disabled={loading}
                    variant="outline"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Gestionar Facturación
                  </Button>
                  
                  {subscription.status === 'active' && (
                    <Button 
                      onClick={handleCancelSubscription}
                      disabled={loading}
                      variant="destructive"
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Cancelar Suscripción
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No tienes una suscripción activa</p>
                <Button onClick={() => window.location.href = '/pricing'}>
                  Ver Planes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
