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

// Prix des plans - Liens de paiement Stripe test configurés
const PLAN_PRICES = {
  // STARTER PLAN
  starter_monthly: 'https://buy.stripe.com/test_14AaEXc529FXbOgciFbII01?prefilled_email=exemple%40gmail.com',    // Starter 49€/mois
  starter_yearly: 'https://buy.stripe.com/test_7sY7sL7OM3hzaKc1E1bII00?prefilled_email=exemple%40gmail.com',      // Starter 490€/an
  
  // PRO PLAN  
  pro_monthly: 'https://buy.stripe.com/test_bJe00j5GE9FX4lO1E1bII02?prefilled_email=exemple%40gmail.com',            // Pro 99€/mois
  pro_yearly: 'https://buy.stripe.com/test_fZu6oH4CA9FX3hK4QdbII03?prefilled_email=exemple%40gmail.com',              // Pro 990€/an
  
  // GROWTH PLAN
  growth_monthly: 'https://buy.stripe.com/test_7sYbJ1gli5pHbOgaaxbII04?prefilled_email=exemple%40gmail.com',      // Growth 299€/mois
  growth_yearly: 'https://buy.stripe.com/test_9B68wP5GE5pH3hK6YlbII05?prefilled_email=exemple%40gmail.com'         // Growth 2990€/an
};

export function registerPaymentRoutes(app: Express) {

  // Créer un abonnement
  app.post("/api/create-subscription", isAuthenticated, async (req: any, res) => {
    try {
      const stripe = getStripeInstance();
      const { planId, isYearly } = req.body;  // Ajout de isYearly pour gérer mensuel/annuel
      const userId = req.user.claims.sub;
      
      console.log(`💳 Création d'abonnement ${planId} ${isYearly ? 'annuel' : 'mensuel'} pour l'utilisateur ${userId}`);

      // Récupérer l'utilisateur
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Vérifier si l'utilisateur a déjà un abonnement actif
      if (user.stripeSubscriptionId) {
        const existingSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        if (existingSubscription.status === 'active') {
          return res.status(400).json({ 
            message: "Vous avez déjà un abonnement actif" 
          });
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
      const priceKey = `${planId}_${isYearly ? 'yearly' : 'monthly'}` as keyof typeof PLAN_PRICES;
      const priceId = PLAN_PRICES[priceKey];
      
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
  app.post("/api/stripe-webhook", async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    
    try {
      const stripe = getStripeInstance();
      // Utiliser la clé webhook fournie
      const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_U3z9XZKXQ7zQddmouNlZUByjjIxX946U');

      console.log(`🎣 Webhook Stripe reçu: ${event.type}`);

      switch (event.type) {
        case 'invoice.payment_succeeded':
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
              if (subscription.items.data[0]?.price.id === PLAN_PRICES.pro) {
                newPlan = 'pro';
              } else if (subscription.items.data[0]?.price.id === PLAN_PRICES.growth) {
                newPlan = 'growth';
              }
              
              // Mettre à jour le plan de l'utilisateur
              await storage.updateUserPlan(user.id, newPlan);
              
              console.log(`✅ Plan mis à jour: ${user.id} -> ${newPlan}`);
            }
          }
          break;

        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object as Stripe.Subscription;
          const deletedCustomerId = deletedSubscription.customer as string;
          
          // Remettre l'utilisateur au plan gratuit
          const userToDowngrade = await storage.getUserByStripeCustomerId(deletedCustomerId);
          if (userToDowngrade) {
            await storage.updateUserPlan(userToDowngrade.id, 'free');
            console.log(`⬇️ Plan remis à gratuit: ${userToDowngrade.id}`);
          }
          break;

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

  // Route simple pour redirection directe vers Stripe avec liens personnalisés
  app.post('/api/payment/direct-checkout', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { plan, billing } = req.body;
      
      if (!plan || !billing) {
        return res.status(400).json({ error: 'Plan et facturation requis' });
      }

      const priceKey = `${plan}_${billing}` as keyof typeof PLAN_PRICES;
      let paymentUrl = PLAN_PRICES[priceKey];

      if (!paymentUrl) {
        return res.status(400).json({ error: 'Plan invalide' });
      }

      // Remplacer l'email exemple par l'email de l'utilisateur  
      const userEmail = req.user?.email || req.user?.claims?.email || '';
      const encodedEmail = encodeURIComponent(userEmail);
      paymentUrl = paymentUrl.replace('exemple%40gmail.com', encodedEmail);
      
      // Ajouter les paramètres de retour pour identifier le plan
      const successUrl = `${req.protocol}://${req.get('host')}/payment-success?plan=${plan}&billing=${billing}`;
      const encodedSuccessUrl = encodeURIComponent(successUrl);
      
      // Ajouter l'URL de succès au lien Stripe si elle n'est pas déjà présente
      if (!paymentUrl.includes('success_url=')) {
        paymentUrl += `&success_url=${encodedSuccessUrl}`;
      }

      console.log(`🔗 Redirection paiement ${plan} ${billing} pour ${userEmail}: ${paymentUrl}`);

      res.json({ url: paymentUrl });
    } catch (error) {
      console.error('Erreur redirection checkout:', error);
      res.status(500).json({ error: 'Erreur lors de la redirection' });
    }
  });

  // Route pour vérifier le succès du paiement et mettre à jour le plan utilisateur
  app.post('/api/payment/verify-success', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        console.log('❌ Utilisateur non authentifié lors de la vérification du paiement');
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { planType, billing } = req.body;
      const userId = req.user.id;

      console.log(`💳 Vérification paiement pour user ${userId}:`, { planType, billing });
      console.log(`👤 Utilisateur connecté:`, req.user.email);

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

  // Webhook Stripe pour traitement automatique des paiements
  app.post("/api/stripe/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.log('⚠️ Webhook Stripe configuré mais STRIPE_WEBHOOK_SECRET manquant');
      return res.status(400).send('Webhook secret not configured');
    }

    let event;

    try {
      const stripe = getStripeInstance();
      event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
      console.log(`🔔 Webhook Stripe reçu: ${event.type}`);
    } catch (err: any) {
      console.error(`❌ Erreur signature webhook: ${err.message}`);
      return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
    }

    try {
      switch (event.type) {
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

        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`🔄 Abonnement mis à jour: ${subscription.id}, statut: ${subscription.status}`);

          // Trouver l'utilisateur par customer ID
          const user = await storage.getUserByStripeCustomerId(subscription.customer as string);
          if (user) {
            // Mettre à jour le statut si l'abonnement est annulé ou suspendu
            if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
              await storage.updateUserPlan(user.id, 'free');
              console.log(`📉 Plan utilisateur ${user.id} rétrogradé vers Free suite à l'annulation`);
            }
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`🗑️ Abonnement supprimé: ${subscription.id}`);

          // Trouver l'utilisateur et le remettre en plan gratuit
          const user = await storage.getUserByStripeCustomerId(subscription.customer as string);
          if (user) {
            await storage.updateUserPlan(user.id, 'free');
            await storage.updateUserStripeInfo(user.id, {
              stripeCustomerId: user.stripeCustomerId,
              stripeSubscriptionId: null
            });
            console.log(`📉 Plan utilisateur ${user.id} rétrogradé vers Free suite à la suppression`);
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          console.log(`❌ Échec de paiement pour facture: ${invoice.id}`);
          // Optionnel: notifier l'utilisateur ou suspendre temporairement
          break;
        }

        default:
          console.log(`ℹ️ Événement webhook non traité: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('❌ Erreur traitement webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });
}