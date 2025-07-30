import { useSubscription } from '@/contexts/SubscriptionContext';
import { useSubscriptionValidation } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanStatus } from '@/components/subscription/PlanBadge';

export const SubscriptionTest = () => {
  const {
    currentPlan,
    isLoading,
    isPremium,
    isFreePlan,
    planLimits,
    availablePlans
  } = useSubscription();

  const {
    validateCreatePlaylist,
    validateAddToPlaylist,
    checkFeatureAccess,
    showUpgradePrompt
  } = useSubscriptionValidation();

  const handleTestCreatePlaylist = async () => {
    const canCreate = await validateCreatePlaylist();
    console.log('Can create playlist:', canCreate);
  };

  const handleTestAddToPlaylist = async () => {
    // Usamos un ID de ejemplo
    const canAdd = await validateAddToPlaylist('test-playlist-id');
    console.log('Can add to playlist:', canAdd);
  };

  const handleTestPremiumFeature = () => {
    const hasAccess = checkFeatureAccess('high_quality_audio');
    console.log('Has access to premium feature:', hasAccess);
  };

  if (isLoading) {
    return <div>Cargando información de suscripción...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Estado de Suscripción</CardTitle>
          <CardDescription>Información del plan actual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PlanStatus />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Plan actual:</strong> {currentPlan?.display_name || 'No disponible'}
            </div>
            <div>
              <strong>Es Premium:</strong> {isPremium ? 'Sí' : 'No'}
            </div>
            <div>
              <strong>Es Gratuito:</strong> {isFreePlan ? 'Sí' : 'No'}
            </div>
            <div>
              <strong>Máx. Playlists:</strong> {planLimits.maxPlaylists || 'Ilimitado'}
            </div>
            <div>
              <strong>Con anuncios:</strong> {planLimits.hasAds ? 'Sí' : 'No'}
            </div>
            <div>
              <strong>Alta calidad:</strong> {planLimits.hasHighQuality ? 'Sí' : 'No'}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Planes Disponibles</CardTitle>
          <CardDescription>Todos los planes de suscripción</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {availablePlans.map((plan) => (
              <div key={plan.id} className="p-3 border rounded-lg">
                <div className="font-medium">{plan.display_name}</div>
                <div className="text-sm text-muted-foreground">
                  ${plan.price}/{plan.interval_type}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {plan.features.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pruebas de Validación</CardTitle>
          <CardDescription>Probar las validaciones del plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button onClick={handleTestCreatePlaylist} variant="outline" size="sm">
              Probar: ¿Puedo crear playlist?
            </Button>
            <Button onClick={handleTestAddToPlaylist} variant="outline" size="sm">
              Probar: ¿Puedo añadir a playlist?
            </Button>
            <Button onClick={handleTestPremiumFeature} variant="outline" size="sm">
              Probar: ¿Tengo acceso a función premium?
            </Button>
            <Button onClick={() => showUpgradePrompt('Audio de alta calidad')} variant="outline" size="sm">
              Mostrar prompt de upgrade
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
