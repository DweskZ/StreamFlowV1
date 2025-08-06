import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Inicializar Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware para validar que Stripe esté configurado
const validateStripeConfig = (req, res, next) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ 
      error: 'Stripe not configured',
      message: 'STRIPE_SECRET_KEY is missing' 
    });
  }
  next();
};

// Endpoint para crear una sesión de checkout
router.post('/create-checkout-session', validateStripeConfig, async (req, res) => {
  try {
    const { priceId, userId, successUrl, cancelUrl, customerEmail } = req.body;

    console.log('Creating checkout session for:', { priceId, userId });

    if (!priceId || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'priceId and userId are required' 
      });
    }

    // Crear la sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail || 'test@example.com',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || process.env.SUCCESS_URL || 'http://localhost:5173/profile?success=true',
      cancel_url: cancelUrl || process.env.CANCEL_URL || 'http://localhost:5173/pricing?canceled=true',
      metadata: {
        userId: userId
      }
    });

    console.log('Checkout session created:', session.id);

    res.json({ 
      success: true,
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Endpoint para obtener los precios/planes disponibles
router.get('/prices', validateStripeConfig, async (req, res) => {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product']
    });

    const formattedPrices = prices.data.map(price => ({
      id: price.id,
      amount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval,
      product: {
        id: price.product.id,
        name: price.product.name,
        description: price.product.description
      }
    }));

    res.json({ 
      success: true,
      prices: formattedPrices
    });

  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Endpoint para obtener la suscripción de un usuario
router.get('/subscription/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          id,
          name,
          description,
          price,
          features
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({ 
      success: true,
      subscription: subscription || null
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Endpoint para cancelar una suscripción
router.post('/cancel-subscription', validateStripeConfig, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        error: 'Missing userId' 
      });
    }

    // Buscar la suscripción activa del usuario
    const { data: userSub, error: findError } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (findError || !userSub) {
      return res.status(404).json({ 
        error: 'Active subscription not found' 
      });
    }

    // Cancelar la suscripción en Stripe
    const subscription = await stripe.subscriptions.cancel(
      userSub.stripe_subscription_id
    );

    // La actualización en la base de datos se hará a través del webhook

    res.json({ 
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status
      }
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

export default router;
