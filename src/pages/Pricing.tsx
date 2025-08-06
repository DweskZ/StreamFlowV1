import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useStripeCheckout } from '@/hooks/useStripeIntegration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const PricingPage = () => {
  const navigate = useNavigate();
  const { availablePlans, currentPlan } = useSubscription();
  const { createCheckoutSession, loading: stripeLoading, error: stripeError } = useStripeCheckout();

  // Filtrar y organizar planes
  const freePlan = availablePlans.find(p => p.name === 'free');
  const monthlyPlan = availablePlans.find(p => p.name === 'premium_monthly');
  const annualPlan = availablePlans.find(p => p.name === 'premium_annual');

  const displayPlans = [
    freePlan,
    monthlyPlan,
    annualPlan
  ].filter(Boolean);

  const handleUpgrade = async (plan: any) => {
    console.log('handleUpgrade called with plan:', plan);
    
    // Si es el plan gratuito, simplemente navegar
    if (plan.name === 'free') {
      navigate('/');
      return;
    }

    // Para planes premium, usar Stripe
    if (plan.stripe_price_id) {
      console.log('Creating checkout session with price ID:', plan.stripe_price_id);
      try {
        const result = await createCheckoutSession({
          priceId: plan.stripe_price_id,
          successUrl: `${window.location.origin}/profile?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`
        });
        console.log('Checkout session result:', result);
      } catch (error) {
        console.error('Error creating checkout session:', error);
      }
    } else {
      console.error('No stripe_price_id found for plan:', plan);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'free':
        return Zap;
      case 'premium_monthly':
      case 'premium_annual':
        return Crown;
      default:
        return Star;
    }
  };

  const isCurrentPlan = (planId: string) => {
    return currentPlan?.id === planId;
  };

  const getButtonText = (plan: any) => {
    if (isCurrentPlan(plan.id)) {
      return 'Plan Actual';
    }
    if (plan.name === 'free') {
      return 'Plan Gratuito';
    }
    return 'Actualizar a Premium';
  };

  const getButtonVariant = (plan: any) => {
    if (isCurrentPlan(plan.id)) {
      return 'secondary';
    }
    if (plan.name === 'free') {
      return 'outline';
    }
    return 'default';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Elige tu Plan
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto px-4">
            Desbloquea todo el potencial de StreamFlow con nuestros planes premium
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {displayPlans.map((plan) => {
            if (!plan) return null;
            
            const Icon = getPlanIcon(plan.name);
            const isPopular = plan.name === 'premium_annual';
            const isCurrent = isCurrentPlan(plan.id);
            
            return (
              <Card 
                key={plan.id} 
                className={cn(
                  "relative cyber-card border-2 transition-all duration-300 hover:shadow-glow-purple/50 flex flex-col",
                  isPopular && "border-purple-500/50 shadow-glow-purple/30",
                  isCurrent && "border-green-500/50 shadow-glow-green/30",
                  plan.name === 'free' && "border-gray-500/30"
                )}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30 text-xs sm:text-sm">
                      Más Popular
                    </Badge>
                  </div>
                )}
                
                {isCurrent && (
                  <div className="absolute -top-3 right-3 sm:right-4">
                    <Badge className="bg-green-600/20 text-green-400 border-green-600/30 text-xs sm:text-sm">
                      Plan Actual
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center space-y-4 p-4 sm:p-6">
                  <div className={cn(
                    "w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center",
                    plan.name === 'free' 
                      ? "bg-gray-500/20 text-gray-400" 
                      : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  )}>
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  
                  <div>
                    <CardTitle className="text-xl sm:text-2xl text-white">
                      {plan.display_name}
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-2 text-sm sm:text-base">
                      {plan.description}
                    </CardDescription>
                  </div>

                  <div className="space-y-2">
                    <div className="text-3xl sm:text-4xl font-bold text-white">
                      ${plan.price}
                      {plan.price > 0 && (
                        <span className="text-base sm:text-lg text-gray-400 font-normal">
                          /{plan.interval_type === 'month' ? 'mes' : 'año'}
                        </span>
                      )}
                    </div>
                    {plan.name === 'premium_annual' && (
                      <div className="text-xs sm:text-sm text-green-400">
                        Equivale a $8.33/mes
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 flex-1 flex flex-col p-4 sm:p-6">
                  {/* Features List */}
                  <div className="space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-xs sm:text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => !isCurrent && handleUpgrade(plan)}
                    disabled={isCurrent || stripeLoading}
                    variant={getButtonVariant(plan)}
                    size="lg"
                    className={cn(
                      "w-full text-sm sm:text-base font-semibold transition-all duration-300 mt-auto",
                      plan.name !== 'free' && !isCurrent && "neon-button hover:scale-105"
                    )}
                  >
                    {stripeLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {getButtonText(plan)}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Error Display */}
        {stripeError && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {stripeError}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400 text-sm">
          <p>¿Tienes preguntas? Contacta con nuestro equipo de soporte</p>
          <p className="mt-2">
            Todos los planes incluyen acceso completo a StreamFlow
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage; 