import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertLeadSchema, insertCampaignSchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Templates routes
  app.get('/api/templates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const templates = await storage.getTemplatesByPlan(user.plan);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get('/api/templates/:id', isAuthenticated, async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // Leads routes
  app.get('/api/leads', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const leads = await storage.getLeads(userId);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.post('/api/leads', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check quota limits
      const leadsCount = await storage.getLeadsCount(userId);
      const limits = {
        free: 5,
        starter: 100,
        pro: 400,
        growth: 1500
      };
      
      if (leadsCount >= (limits[user.plan as keyof typeof limits] || 5)) {
        return res.status(400).json({ message: "Lead quota exceeded for your plan" });
      }

      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead({ ...leadData, userId });
      
      // Update user's leads used count
      await storage.upsertUser({ 
        ...user, 
        leadsUsed: user.leadsUsed + 1 
      });
      
      res.json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      console.error("Error creating lead:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.put('/api/leads/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = insertLeadSchema.partial().parse(req.body);
      const updatedLead = await storage.updateLead(req.params.id, userId, updates);
      
      if (!updatedLead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(updatedLead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      console.error("Error updating lead:", error);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete('/api/leads/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteLead(req.params.id, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json({ message: "Lead deleted successfully" });
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Campaigns routes
  app.get('/api/campaigns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const campaigns = await storage.getCampaigns(userId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.post('/api/campaigns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const campaignData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign({ ...campaignData, userId });
      
      // Update template usage
      await storage.updateTemplateUsage(campaignData.templateId);
      
      res.json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid campaign data", errors: error.errors });
      }
      console.error("Error creating campaign:", error);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  // Sequences routes
  app.get('/api/sequences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.plan !== 'pro' && user.plan !== 'growth')) {
        return res.status(403).json({ message: "Sequences require Pro or Growth plan" });
      }
      
      const sequences = await storage.getSequences(userId);
      res.json(sequences);
    } catch (error) {
      console.error("Error fetching sequences:", error);
      res.status(500).json({ message: "Failed to fetch sequences" });
    }
  });

  // Bookings routes
  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking({ ...bookingData, userId });
      res.json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // User profile routes
  app.get('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Seed templates on startup
  await seedTemplates();

  const httpServer = createServer(app);
  return httpServer;
}

// Seed initial templates
async function seedTemplates() {
  try {
    const existingTemplates = await storage.getTemplates();
    if (existingTemplates.length > 0) return;

    const templates = [
      // Free plan (1 template)
      {
        name: "Template 1 – Découverte simple",
        subject: "Une idée rapide pour [Entreprise]",
        content: `Bonjour [Prénom],

Nous aidons des entreprises comme [Entreprise] à résoudre [Problème] rapidement grâce à [Produit].
Souhaitez-vous en discuter 5 minutes cette semaine ?

[Signature]`,
        plan: "free",
        category: "discovery",
        variables: ["Prénom", "Entreprise", "Problème", "Produit", "Signature"]
      },
      
      // Starter plan (5 templates)
      {
        name: "Template 2 – Problème → Solution",
        subject: "[Entreprise] et [Problème] ?",
        content: `Bonjour [Prénom],

J'ai remarqué que [Entreprise] rencontre souvent [Problème]. Nous aidons des entreprises similaires à résoudre ce problème en [délai] sans [contrainte].

Souhaitez-vous qu'on en parle 10 min cette semaine ?

[Signature]`,
        plan: "starter",
        category: "problem-solution",
        variables: ["Prénom", "Entreprise", "Problème", "délai", "contrainte", "Signature"]
      },
      {
        name: "Template 3 – Question simple",
        subject: "Vous gérez comment [Problème] ?",
        content: `Bonjour [Prénom],

Comment gérez-vous [Problème] actuellement chez [Entreprise] ?
Nous aidons [Entreprise similaire] à [résultat obtenu].
Intéressé pour en discuter ?

[Signature]`,
        plan: "starter",
        category: "question",
        variables: ["Prénom", "Problème", "Entreprise", "Entreprise similaire", "résultat obtenu", "Signature"]
      },
      {
        name: "Template 4 – Chiffre choc",
        subject: "73% des entreprises comme [Entreprise]…",
        content: `Bonjour [Prénom],

73% des entreprises dans [secteur] rencontrent [Problème].
[Produit] permet de réduire ce problème de [X%] en [temps].
Vous voulez en parler ?

[Signature]`,
        plan: "starter",
        category: "statistics",
        variables: ["Prénom", "secteur", "Problème", "Produit", "X%", "temps", "Signature"]
      },
      {
        name: "Template 5 – Email court",
        subject: "Une idée pour [Entreprise]",
        content: `Bonjour [Prénom],
On aide [Entreprise similaire] à [résultat] en [temps].
Ça vous tente d'en discuter ?

[Signature]`,
        plan: "starter",
        category: "short",
        variables: ["Prénom", "Entreprise similaire", "résultat", "temps", "Signature"]
      },
      {
        name: "Template 6 – Petit rappel (follow-up)",
        subject: "Petit rappel :)",
        content: `Bonjour [Prénom],
Je reviens vers vous suite à mon précédent message.
Est-ce que c'est pertinent pour [Entreprise] ?

[Signature]`,
        plan: "starter",
        category: "follow-up",
        variables: ["Prénom", "Entreprise", "Signature"]
      }
    ];
    
    // Add more templates for Pro and Growth plans...
    const proTemplates = [
      {
        name: "Template 7 – Social Proof",
        subject: "Comment [Entreprise similaire] a résolu [Problème]",
        content: `Bonjour [Prénom],

Il y a 3 mois, [Entreprise similaire] faisait face à [Problème].
Avec [Produit], ils ont obtenu [résultat concret] en [temps].

Est-ce que ça pourrait aussi aider [Entreprise] ?

[Signature]`,
        plan: "pro",
        category: "social-proof",
        variables: ["Prénom", "Entreprise similaire", "Problème", "Produit", "résultat concret", "temps", "Entreprise", "Signature"]
      },
      // Add more pro templates...
    ];

    for (const template of [...templates, ...proTemplates]) {
      await storage.getTemplates(); // This will create the template using the seeded data
    }
  } catch (error) {
    console.error("Error seeding templates:", error);
  }
}
