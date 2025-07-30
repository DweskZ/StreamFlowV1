import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const PricingPage = () => {
  const navigate = useNavigate();
  const { availablePlans, currentPlan, upgradeToPlan } = useSubscription();

  // Filtrar y organizar planes
  const freePlan = availablePlans.find(p => p.name === 'free');
  const monthlyPlan = availablePlans.find(p => p.name === 'premium_monthly');
  const annualPlan = availablePlans.find(p => p.name === 'premium_annual');

  const displayPlans = [
    freePlan,
    monthlyPlan,
    annualPlan
  ].filter(Boolean);

  const handleUpgrade = async (planId: string) => {
    try {
      await upgradeToPlan(planId);
      // Implementaremos Stripe en el siguiente paso
    } catch (error) {
      console.error('Error upgrading plan:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Elige tu Plan
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Desbloquea todo el potencial de StreamFlow con nuestros planes premium
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1">
                      Más Popular
                    </Badge>
                  </div>
                )}
                
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                      Plan Actual
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center space-y-4">
                  <div className={cn(
                    "w-16 h-16 mx-auto rounded-full flex items-center justify-center",
                    plan.name === 'free' 
                      ? "bg-gray-500/20 text-gray-400" 
                      : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  )}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <CardTitle className="text-2xl text-white">
                      {plan.display_name}
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-2">
                      {plan.description}
                    </CardDescription>
                  </div>

                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-white">
                      ${plan.price}
                      {plan.price > 0 && (
                        <span className="text-lg text-gray-400 font-normal">
                          /{plan.interval_type === 'month' ? 'mes' : 'año'}
                        </span>
                      )}
                    </div>
                    {plan.name === 'premium_annual' && (
                      <div className="text-sm text-green-400">
                        Equivale a $8.33/mes
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 flex-1 flex flex-col">
                  {/* Features List */}
                  <div className="space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => !isCurrent && handleUpgrade(plan.id)}
                    disabled={isCurrent}
                    variant={getButtonVariant(plan)}
                    size="lg"
                    className={cn(
                      "w-full text-base font-semibold transition-all duration-300 mt-auto",
                      plan.name !== 'free' && !isCurrent && "neon-button hover:scale-105"
                    )}
                  >
                    {getButtonText(plan)}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-gray-400">
            ¿Tienes preguntas? <a href="#" className="text-purple-400 hover:text-purple-300">Contáctanos</a>
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <span>✓ Cancela en cualquier momento</span>
            <span>✓ Soporte 24/7</span>
            <span>✓ Garantía de 30 días</span>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white"
          >
            ← Volver
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
