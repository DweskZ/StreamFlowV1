-- INSTRUCCIONES PARA CONFIGURAR WEBHOOK EN STRIPE
-- Ejecutar estos pasos en el Dashboard de Stripe

/*
PASOS PARA CONFIGURAR WEBHOOK:

1. Ve a: https://dashboard.stripe.com/webhooks

2. Haz clic en "Add endpoint"

3. Configuración:
   - Endpoint URL: https://tnqtlltiwoocwajorglp.supabase.co/functions/v1/stripe-webhook-debug
   - Events to send: 
     ✅ checkout.session.completed
     ✅ customer.subscription.created
     ✅ customer.subscription.updated
     ✅ customer.subscription.deleted
     ✅ invoice.payment_succeeded
     ✅ invoice.payment_failed

4. Haz clic en "Add endpoint"

5. Copia el "Signing secret" (whsec_...)

6. Ve a Supabase Dashboard → Settings → Edge Functions
7. Agrega el secret: STRIPE_WEBHOOK_SECRET = [el signing secret que copiaste]

8. Redespliega la función:
   npx supabase functions deploy stripe-webhook-debug

9. Prueba el webhook:
   - Ve a la página de pricing
   - Haz un checkout de prueba
   - Verifica los logs en la tabla webhook_logs
*/

-- Verificar si hay webhooks configurados actualmente
SELECT 
  'Verificar en Stripe Dashboard:' as instruction,
  'https://dashboard.stripe.com/webhooks' as url,
  'Buscar webhook con URL: https://tnqtlltiwoocwajorglp.supabase.co/functions/v1/stripe-webhook-debug' as action; 