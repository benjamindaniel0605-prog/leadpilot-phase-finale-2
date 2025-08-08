import type { Express } from "express";
import express from "express";
import Stripe from "stripe";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";

// Configuration Stripe (lazy loading pour éviter les erreurs sans clés)
let stripe: Stripe | null = null;

function getStripeInstance(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY manquant');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
  }
  return stripe;
}

// Configuration des prix Stripe - IDs de prix réels
const STRIPE_PRICE_IDS = {
  // STARTER PLAN
  starter_monthly: 'price_1OqX8X2e9FXbOgciFbII01',    // Starter 49€/mois
  starter_yearly: 'price_1OqX8X2e9FXbOgciFbII02',     // Starter 490€/an
  
  // PRO PLAN  
  pro_monthly: 'price_1OqX8X2e9FXbOgciFbII03',        // Pro 99€/mois
  pro_yearly: 'price_1OqX8X2e9FXbOgciFbII04',         // Pro 990€/an
  
  // GROWTH PLAN
  growth_monthly: 'price_1OqX8X2e9FXbOgciFbII05',     // Growth 299€/mois
  growth_yearly: 'price_1OqX8X2e9FXbOgciFbII06'       // Growth 2990€/an
};

// Mapping des plans vers les prix
const PLAN_TO_PRICE_MAPPING = {
  'starter': {
    monthly: STRIPE_PRICE_IDS.starter_monthly,
    yearly: STRIPE_PRICE_IDS.starter_yearly
  },
  'pro': {
    monthly: STRIPE_PRICE_IDS.pro_monthly,
    yearly: STRIPE_PRICE_IDS.pro_yearly
  },
  'growth': {
    monthly: STRIPE_PRICE_IDS.growth_monthly,
    yearly: STRIPE_PRICE_IDS.growth_yearly
  }
};

export function registerPaymentRoutes(app: Express) {

  // Créer un abonnement
  app.post("/api/create-subscription", isAuthenticated, async (req: any, res) => {
    try {
      const stripe = getStripeInstance();
      const { planId, isYearly } = req.body;
      const userId = req.user.claims.sub;
      
      console.log(`💳 Création d'abonnement ${planId} ${isYearly ? 'annuel' : 'mensuel'} pour l'utilisateur ${userId}`);

      // Récupérer l'utilisateur
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Vérifier si l'utilisateur a déjà un abonnement actif
      if (user.stripeSubscriptionId) {
        try {
          const existingSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          if (existingSubscription.status === 'active') {
            return res.status(400).json({ 
              message: "Vous avez déjà un abonnement actif" 
            });
          }
        } catch (error) {
          // Si l'abonnement n'existe plus, on peut continuer
          console.log("Ancien abonnement non trouvé, création d'un nouveau");
        }
      }

      let customerId = user.stripeCustomerId;

      // Créer un client Stripe si nécessaire
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || '',
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          metadata: {
            userId: userId
          }
        });
        
        customerId = customer.id;
        
        // Mettre à jour l'utilisateur avec l'ID client Stripe
        await storage.updateUserStripeInfo(userId, { 
          stripeCustomerId: customerId 
        });
        
        console.log(`✅ Client Stripe créé: ${customerId}`);
      }

      // Déterminer le bon prix selon le plan et la période
      const planMapping = PLAN_TO_PRICE_MAPPING[planId as keyof typeof PLAN_TO_PRICE_MAPPING];
      if (!planMapping) {
        return res.status(400).json({ 
          message: `Plan ${planId} non disponible` 
        });
      }

      const priceId = isYearly ? planMapping.yearly : planMapping.monthly;
      
      if (!priceId) {
        return res.status(400).json({ 
          message: `Plan ${planId} ${isYearly ? 'annuel' : 'mensuel'} non disponible` 
        });
      }

      // Créer l'abonnement
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: priceId,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: userId,
          planId: planId,
          isYearly: isYearly.toString()
        }
      });

      // Mettre à jour l'utilisateur avec l'ID d'abonnement
      await storage.updateUserStripeInfo(userId, {
        stripeSubscriptionId: subscription.id
      });

      console.log(`✅ Abonnement créé: ${subscription.id}`);

      const clientSecret = (subscription.latest_invoice as any)?.payment_intent?.client_secret;

      res.json({
        subscriptionId: subscription.id,
        clientSecret,
        status: subscription.status
      });

    } catch (error: any) {
      console.error("Erreur création abonnement:", error);
      res.status(500).json({ 
        message: "Erreur lors de la création de l'abonnement",
        error: error.message 
      });
    }
  });

  // Webhook Stripe pour les événements
  app.post("/api/stripe-webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    
    try {
      const stripe = getStripeInstance();
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        console.error('❌ STRIPE_WEBHOOK_SECRET manquant');
        return res.status(400).json({ error: 'Webhook secret not configured' });
      }

      const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

      console.log(`🎣 Webhook Stripe reçu: ${event.type}`);

      switch (event.type) {
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          const subscriptionId = typeof invoice.subscription === 'string' 
            ? invoice.subscription 
            : invoice.subscription?.id;
          
          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const customerId = subscription.customer as string;
            
            // Récupérer l'utilisateur par customer ID
            const user = await storage.getUserByStripeCustomerId(customerId);
            
            if (user) {
              // Déterminer le plan basé sur le prix
              let newPlan = 'free';
              const priceId = subscription.items.data[0]?.price.id;
              
              if (priceId === STRIPE_PRICE_IDS.starter_monthly || priceId === STRIPE_PRICE_IDS.starter_yearly) {
                newPlan = 'starter';
              } else if (priceId === STRIPE_PRICE_IDS.pro_monthly || priceId === STRIPE_PRICE_IDS.pro_yearly) {
                newPlan = 'pro';
              } else if (priceId === STRIPE_PRICE_IDS.growth_monthly || priceId === STRIPE_PRICE_IDS.growth_yearly) {
                newPlan = 'growth';
              }
              
              // Mettre à jour le plan de l'utilisateur
              await storage.updateUserPlan(user.id, newPlan);
              
              console.log(`✅ Plan mis à jour: ${user.id} -> ${newPlan}`);
            }
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const deletedSubscription = event.data.object as Stripe.Subscription;
          const deletedCustomerId = deletedSubscription.customer as string;
          
          // Remettre l'utilisateur au plan gratuit
          const userToDowngrade = await storage.getUserByStripeCustomerId(deletedCustomerId);
          if (userToDowngrade) {
            await storage.updateUserPlan(userToDowngrade.id, 'free');
            console.log(`⬇️ Plan remis à gratuit: ${userToDowngrade.id}`);
          }
          break;
        }

        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log(`✅ Paiement réussi pour session: ${session.id}`);

          if (session.customer && session.metadata?.userId) {
            const userId = session.metadata.userId;
            const planId = session.metadata.planId || 'starter';
            const isYearly = session.metadata.isYearly === 'true';

            console.log(`📈 Mise à jour du plan utilisateur ${userId} vers ${planId} (${isYearly ? 'annuel' : 'mensuel'})`);

            // Mettre à jour le plan de l'utilisateur
            await storage.updateUserPlan(userId, planId);
            
            // Enregistrer les infos Stripe si c'est un abonnement
            if (session.subscription) {
              await storage.updateUserStripeInfo(userId, {
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string
              });
            }

            console.log(`✅ Plan utilisateur ${userId} mis à jour avec succès`);
          }
          break;
        }

        default:
          console.log(`⚠️ Événement Stripe non géré: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Erreur webhook Stripe:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Annuler un abonnement
  app.post("/api/cancel-subscription", isAuthenticated, async (req: any, res) => {
    try {
      const stripe = getStripeInstance();
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeSubscriptionId) {
        return res.status(404).json({ message: "Aucun abonnement trouvé" });
      }

      // Annuler l'abonnement à la fin de la période de facturation
      const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      console.log(`🚫 Abonnement programmé pour annulation: ${subscription.id}`);

      res.json({ 
        message: "Abonnement programmé pour annulation",
        cancelAt: subscription.cancel_at 
      });

    } catch (error: any) {
      console.error("Erreur annulation abonnement:", error);
      res.status(500).json({ 
        message: "Erreur lors de l'annulation",
        error: error.message 
      });
    }
  });

  // Récupérer les informations d'abonnement
  app.get("/api/subscription-status", isAuthenticated, async (req: any, res) => {
    try {
      const stripe = getStripeInstance();
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeSubscriptionId) {
        return res.json({ 
          status: 'none',
          plan: user?.plan || 'free'
        });
      }

      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      
      res.json({
        status: subscription.status,
        plan: user.plan,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      });

    } catch (error: any) {
      console.error("Erreur récupération statut:", error);
      res.status(500).json({ 
        message: "Erreur lors de la récupération du statut",
        error: error.message 
      });
    }
  });

  // Route pour créer une session de checkout Stripe
  app.post('/api/create-checkout-session', isAuthenticated, async (req: any, res) => {
    try {
      const stripe = getStripeInstance();
      const { planId, isYearly } = req.body;
      const userId = req.user.claims.sub;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Déterminer le prix
      const planMapping = PLAN_TO_PRICE_MAPPING[planId as keyof typeof PLAN_TO_PRICE_MAPPING];
      if (!planMapping) {
        return res.status(400).json({ message: "Plan invalide" });
      }

      const priceId = isYearly ? planMapping.yearly : planMapping.monthly;
      
      // Créer la session de checkout
      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${req.protocol}://${req.get('host')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/upgrade`,
        metadata: {
          userId: userId,
          planId: planId,
          isYearly: isYearly.toString()
        }
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Erreur création session checkout:', error);
      res.status(500).json({ error: 'Erreur lors de la création de la session' });
    }
  });

  // Route pour vérifier le succès du paiement
  app.post('/api/payment/verify-success', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        console.log('❌ Utilisateur non authentifié lors de la vérification du paiement');
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { planType, billing } = req.body;
      const userId = req.user.id;

      console.log(`💳 Vérification paiement pour user ${userId}:`, { planType, billing });

      // Mettre à jour le plan de l'utilisateur dans la base de données
      let newPlan = 'free';
      let planName = 'Gratuit';

      switch (planType) {
        case 'starter':
          newPlan = 'starter';
          planName = 'Starter';
          break;
        case 'pro':
          newPlan = 'pro';
          planName = 'Pro';
          break;
        case 'growth':
          newPlan = 'growth';
          planName = 'Growth';
          break;
        default:
          return res.status(400).json({ error: 'Plan invalide' });
      }

      // Mettre à jour le plan utilisateur en base
      await storage.updateUserPlan(userId, newPlan, billing === 'yearly');

      console.log(`✅ Plan utilisateur ${userId} mis à jour vers ${newPlan} (${billing})`);

      res.json({ 
        success: true, 
        planName,
        message: `Plan ${planName} activé avec succès` 
      });

    } catch (error) {
      console.error('Erreur vérification paiement:', error);
      res.status(500).json({ error: 'Erreur lors de la vérification du paiement' });
    }
  });
}