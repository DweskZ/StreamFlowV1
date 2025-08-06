import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStripeCheckout } from '@/hooks/useStripeIntegration';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export const StripeTest = () => {
  const { createCheckoutSession, loading, error } = useStripeCheckout();
  const { availablePlans } = useSubscription();
  const [testResult, setTestResult] = useState<string | null>(null);

  const testStripeCheckout = async () => {
    setTestResult(null);
    
    // Buscar el plan premium mensual
    const monthlyPlan = availablePlans.find(p => p.name === 'premium_monthly');
    
    if (!monthlyPlan || !monthlyPlan.stripe_price_id) {
      setTestResult('❌ No se encontró el plan premium mensual o no tiene stripe_price_id configurado');
      return;
    }

    try {
      console.log('🧪 Iniciando prueba de Stripe...');
      console.log('Plan:', monthlyPlan);
      console.log('Price ID:', monthlyPlan.stripe_price_id);
      
      const result = await createCheckoutSession({
        priceId: monthlyPlan.stripe_price_id,
        successUrl: `${window.location.origin}/profile?test=success`,
        cancelUrl: `${window.location.origin}/profile?test=canceled`
      });
      
      if (result) {
        setTestResult('✅ Sesión de checkout creada exitosamente');
        console.log('✅ Resultado:', result);
      } else {
        setTestResult('❌ No se pudo crear la sesión de checkout');
      }
    } catch (err) {
      setTestResult(`❌ Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      console.error('❌ Error en prueba:', err);
    }
  };

  const testEdgeFunction = async () => {
    setTestResult(null);
    
    try {
      console.log('🧪 Probando edge function directamente...');
      
      const { data, error } = await supabase.functions.invoke('test-stripe', {
        body: { test: true }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log('✅ Respuesta de test-stripe:', data);
      
      if (data.success && data.url) {
        setTestResult('✅ Edge function funciona correctamente');
      } else if (data.error) {
        setTestResult(`❌ Edge function error: ${data.error}`);
      } else {
        setTestResult('❌ Edge function no devolvió URL');
      }
    } catch (err) {
      setTestResult(`❌ Error en edge function: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      console.error('❌ Error:', err);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🧪 Prueba de Integración Stripe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado de los planes */}
        <div className="space-y-2">
          <h4 className="font-medium">Planes disponibles:</h4>
          {availablePlans.map((plan) => (
            <div key={plan.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
              <span>{plan.display_name}</span>
              <span className="text-sm">
                {plan.stripe_price_id ? '✅ Configurado' : '❌ Sin configurar'}
              </span>
            </div>
          ))}
        </div>

        {/* Botones de prueba */}
        <div className="flex gap-2">
          <Button 
            onClick={testEdgeFunction}
            disabled={loading}
            variant="outline"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '🧪 Probar Edge Function'}
          </Button>
          
          <Button 
            onClick={testStripeCheckout}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '💳 Probar Checkout'}
          </Button>
        </div>

        {/* Resultado */}
        {testResult && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            testResult.startsWith('✅') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {testResult.startsWith('✅') ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span>{testResult}</span>
          </div>
        )}

        {/* Error de Stripe */}
        {error && (
          <div className="p-3 bg-red-100 text-red-800 rounded-lg">
            <strong>Error de Stripe:</strong> {error}
          </div>
        )}

        {/* Información de debug */}
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Debug Info:</strong></p>
          <p>• Planes cargados: {availablePlans.length}</p>
          <p>• Plan premium mensual: {availablePlans.find(p => p.name === 'premium_monthly')?.stripe_price_id || 'No configurado'}</p>
          <p>• Plan premium anual: {availablePlans.find(p => p.name === 'premium_annual')?.stripe_price_id || 'No configurado'}</p>
        </div>
      </CardContent>
    </Card>
  );
}; 