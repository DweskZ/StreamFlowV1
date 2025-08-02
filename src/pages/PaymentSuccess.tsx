import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, ArrowRight } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentPlan, loadUserSubscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Recargar datos de suscripción
        await loadUserSubscription();
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading subscription:', error);
        setIsLoading(false);
      }
    };

    checkPaymentStatus();
  }, [loadUserSubscription]);

  const handleGoToDashboard = () => {
    navigate('/app');
  };

  const handleGoToPricing = () => {
    navigate('/app/pricing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando tu suscripción...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-green-500/30 shadow-glow-green/30">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-green-400">
              ¡Pago Exitoso!
            </CardTitle>
            <CardDescription className="text-lg text-gray-300">
              Tu suscripción ha sido activada correctamente
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Plan Actual */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-yellow-500" />
                  <div>
                    <h3 className="font-semibold text-white">
                      {currentPlan?.display_name || 'Plan Premium'}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Suscripción activa
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                  Activa
                </Badge>
              </div>
            </div>

            {/* Beneficios */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Beneficios activos:</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Playlists ilimitadas
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Sin anuncios
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Audio en alta calidad
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Descargas offline
                </li>
              </ul>
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={handleGoToDashboard}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Ir al Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                onClick={handleGoToPricing}
                className="flex-1"
              >
                Ver Planes
              </Button>
            </div>

            {/* Información adicional */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-700">
              <p>Recibirás un email de confirmación con los detalles de tu suscripción.</p>
              <p className="mt-1">¿Necesitas ayuda? Contacta nuestro soporte.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess; 