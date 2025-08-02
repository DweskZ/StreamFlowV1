import { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useStripe } from '@/hooks/useStripe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, CreditCard, Crown, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const SubscriptionManager = () => {
  const { 
    currentPlan, 
    userSubscription, 
    availablePlans, 
    isPremium, 
    isFreePlan,
    cancelSubscription,
    resumeSubscription 
  } = useSubscription();
  
  const { manageSubscription } = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await cancelSubscription();
      setShowCancelDialog(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResume = async () => {
    setIsLoading(true);
    try {
      await resumeSubscription();
      setShowResumeDialog(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePlan = async (newPlanId: string) => {
    setIsLoading(true);
    try {
      const result = await manageSubscription('change_plan', newPlanId);
      if (result) {
        // Reload subscription data
        window.location.reload();
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFreePlan) {
    return (
      <Card className="border-2 border-gray-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-gray-400" />
            Plan Actual: Gratuito
          </CardTitle>
          <CardDescription>
            Actualiza a Premium para desbloquear todas las funciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Tu plan gratuito tiene limitaciones. Considera actualizar para una mejor experiencia.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!userSubscription) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Cargando información de suscripción...</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    switch (userSubscription.status) {
      case 'active':
        return <Badge className="bg-green-600/20 text-green-400 border-green-600/30">Activa</Badge>;
      case 'canceled':
        return <Badge className="bg-red-600/20 text-red-400 border-red-600/30">Cancelada</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">Pago Pendiente</Badge>;
      case 'trial':
        return <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">Prueba</Badge>;
      default:
        return <Badge variant="secondary">{userSubscription.status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Card */}
      <Card className="border-2 border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-400" />
                {currentPlan?.display_name}
              </CardTitle>
              <CardDescription>
                Tu suscripción actual
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subscription Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Estado:</span>
              <span className="text-sm font-medium">{userSubscription.status}</span>
            </div>
            
            {userSubscription.current_period_start && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Inicio:</span>
                <span className="text-sm font-medium">
                  {formatDate(userSubscription.current_period_start)}
                </span>
              </div>
            )}
            
            {userSubscription.current_period_end && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Próximo pago:</span>
                <span className="text-sm font-medium">
                  {formatDate(userSubscription.current_period_end)}
                </span>
              </div>
            )}
            
            {userSubscription.cancel_at_period_end && (
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400 font-medium">
                  Se cancelará al final del período
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {userSubscription.cancel_at_period_end ? (
              <Button
                onClick={() => setShowResumeDialog(true)}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Reanudar Suscripción
              </Button>
            ) : (
              <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogTrigger asChild>
                  <Button
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancelar Suscripción
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancelar Suscripción</DialogTitle>
                    <DialogDescription>
                      ¿Estás seguro de que quieres cancelar tu suscripción? 
                      Tendrás acceso hasta el final del período actual.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowCancelDialog(false)}
                    >
                      Mantener
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Cancelando...' : 'Cancelar'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Change Plan Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  Cambiar Plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cambiar Plan</DialogTitle>
                  <DialogDescription>
                    Selecciona el plan al que quieres cambiar
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  {availablePlans
                    .filter(plan => plan.id !== currentPlan?.id && plan.name !== 'free')
                    .map((plan) => (
                      <Button
                        key={plan.id}
                        onClick={() => handleChangePlan(plan.id)}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span>{plan.display_name}</span>
                        <span className="text-sm text-gray-500">
                          ${plan.price}/{plan.interval_type === 'month' ? 'mes' : 'año'}
                        </span>
                      </Button>
                    ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Resume Dialog */}
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reanudar Suscripción</DialogTitle>
            <DialogDescription>
              ¿Quieres reanudar tu suscripción? Continuará normalmente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResumeDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleResume}
              disabled={isLoading}
            >
              {isLoading ? 'Reanudando...' : 'Reanudar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionManager; 