import type { Express } from "express";
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

// Prix des plans - REMPLACEZ PAR VOS LIENS DE PAIEMENT TEST STRIPE
const PLAN_PRICES = {
  // STARTER PLAN
  starter_monthly: 'VOTRE_LIEN_STARTER_MENSUEL_ICI',    // Remplacez par votre lien Starter mensuel
  starter_yearly: 'VOTRE_LIEN_STARTER_ANNUEL_ICI',      // Remplacez par votre lien Starter annuel
  
  // PRO PLAN  
  pro_monthly: 'VOTRE_LIEN_PRO_MENSUEL_ICI',            // Remplacez par votre lien Pro mensuel
  pro_yearly: 'VOTRE_LIEN_PRO_ANNUEL_ICI',              // Remplacez par votre lien Pro annuel
  
  // GROWTH PLAN
  growth_monthly: 'VOTRE_LIEN_GROWTH_MENSUEL_ICI',      // Remplacez par votre lien Growth mensuel
  growth_yearly: 'VOTRE_LIEN_GROWTH_ANNUEL_ICI'         // Remplacez par votre lien Growth annuel
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
      // En production, utiliser process.env.STRIPE_WEBHOOK_SECRET
      const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test');

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
}