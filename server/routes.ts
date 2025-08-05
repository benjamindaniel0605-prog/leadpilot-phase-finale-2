import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupOAuthRoutes } from "./oauth-email";
import { insertLeadSchema, insertCampaignSchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";
import { seedDatabase, exampleLeads } from "./seed-data";
import { getLeadService, AILeadScoringService, type LeadSearchParams } from "./services/leadService";
import { CSVService } from "./services/csvService";
import { OpenAILeadScoringService } from "./services/openaiService";
import { registerEmailVariationRoutes } from "./routes/emailVariations";
import { emailService } from "./services/emailService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // OAuth email routes
  setupOAuthRoutes(app);
  
  // Setup OAuth debug routes
  const { setupOAuthDebug } = await import('./oauth-debug');
  setupOAuthDebug(app);

  // Setup sequence routes
  const { registerSequenceRoutes } = await import('./routes/sequences');
  registerSequenceRoutes(app);

  // Setup payment routes
  const { registerPaymentRoutes } = await import('./routes/payments');
  registerPaymentRoutes(app);

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

  // Route pour utiliser un template
  app.post('/api/templates/:id/use', isAuthenticated, async (req, res) => {
    try {
      await storage.updateTemplateUsage(req.params.id);
      res.json({ message: "Template usage updated" });
    } catch (error) {
      console.error("Error updating template usage:", error);
      res.status(500).json({ message: "Failed to update template usage" });
    }
  });

  // Route pour modifier un template
  app.patch('/api/templates/:id', isAuthenticated, async (req, res) => {
    try {
      const { subject, content } = req.body;
      await storage.updateTemplate(req.params.id, { subject, content });
      res.json({ message: "Template updated successfully" });
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  // Route pour supprimer un template
  app.delete('/api/templates/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteTemplate(req.params.id);
      res.json({ message: "Template deleted successfully" });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Route pour générer une variation d'email avec quota
  app.post('/api/templates/:id/variation', isAuthenticated, async (req: any, res) => {
    try {
      const templateId = req.params.id;
      const userId = req.user.claims.sub;
      
      // Vérifier les quotas
      const quotaCheck = await storage.checkVariationQuota(userId);
      if (!quotaCheck.canGenerate) {
        return res.status(429).json({ 
          message: "Quota de variations épuisé pour ce mois",
          remainingVariations: quotaCheck.remainingVariations,
          monthlyLimit: quotaCheck.monthlyLimit
        });
      }

      const template = await storage.getTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Générer la variation
      const variation = await storage.generateAIVariation(template);
      
      // Incrémenter le compteur
      await storage.incrementVariationUsage(userId);
      
      res.json({
        ...variation,
        remainingVariations: quotaCheck.remainingVariations - 1
      });
    } catch (error) {
      console.error("Error generating variation:", error);
      res.status(500).json({ message: "Failed to generate variation" });
    }
  });

  // Route pour créer un template personnalisé
  app.post('/api/templates', isAuthenticated, async (req, res) => {
    try {
      const template = await storage.createTemplate(req.body);
      res.json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  // Route pour générer une variation IA d'un template
  app.post('/api/templates/:id/ai-variation', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Vérifier les quotas
      const quotaCheck = await storage.checkVariationQuota(userId);
      if (!quotaCheck.canGenerate) {
        return res.status(429).json({ 
          message: "Quota de variations épuisé pour ce mois",
          remainingVariations: quotaCheck.remainingVariations,
          monthlyLimit: quotaCheck.monthlyLimit
        });
      }

      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Utiliser l'IA pour générer une variation complète
      const variation = await storage.generateAIVariation(template);
      
      // Mettre à jour le template avec la variation
      await storage.updateTemplate(req.params.id, { 
        subject: variation.subject, 
        content: variation.content 
      });
      
      // Incrémenter le compteur
      await storage.incrementVariationUsage(userId);
      
      res.json({ 
        message: "AI variation applied successfully",
        remainingVariations: quotaCheck.remainingVariations - 1
      });
    } catch (error) {
      console.error("Error generating AI variation:", error);
      res.status(500).json({ message: "Failed to generate AI variation" });
    }
  });

  // Route pour supprimer une campagne
  app.delete('/api/campaigns/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCampaign(req.params.id);
      res.json({ message: "Campaign deleted successfully" });
    } catch (error) {
      console.error("Error deleting campaign:", error);
      res.status(500).json({ message: "Failed to delete campaign" });
    }
  });

  // Routes pour les emails personnalisés
  app.get('/api/custom-emails', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const customEmails = await storage.getCustomEmails(userId);
      res.json(customEmails);
    } catch (error) {
      console.error("Error fetching custom emails:", error);
      res.status(500).json({ message: "Failed to fetch custom emails" });
    }
  });

  app.post('/api/custom-emails', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const customEmail = await storage.createCustomEmail(userId, req.body);
      res.json(customEmail);
    } catch (error) {
      console.error("Error creating custom email:", error);
      res.status(500).json({ message: "Failed to create custom email" });
    }
  });

  app.patch('/api/custom-emails/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.updateCustomEmail(req.params.id, req.body);
      res.json({ message: "Custom email updated successfully" });
    } catch (error) {
      console.error("Error updating custom email:", error);
      res.status(500).json({ message: "Failed to update custom email" });
    }
  });

  app.delete('/api/custom-emails/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCustomEmail(req.params.id);
      res.json({ message: "Custom email deleted successfully" });
    } catch (error) {
      console.error("Error deleting custom email:", error);
      res.status(500).json({ message: "Failed to delete custom email" });
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
        pro: 500,
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
      
      res.json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid campaign data", errors: error.errors });
      }
      console.error("Error creating campaign:", error);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  // Route pour lancer une campagne (envoyer les emails)
  app.post('/api/campaigns/:id/send', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const campaignId = req.params.id;
      
      // Récupérer la campagne
      const campaign = await storage.getCampaign(campaignId, userId);
      if (!campaign || campaign.userId !== userId) {
        return res.status(404).json({ message: "Campagne non trouvée" });
      }

      if (campaign.status === 'sent') {
        return res.status(400).json({ message: "Cette campagne a déjà été envoyée" });
      }

      // Récupérer l'email personnalisé
      const customEmail = await storage.getCustomEmail(campaign.emailId);
      if (!customEmail) {
        return res.status(404).json({ message: "Email non trouvé" });
      }

      // Récupérer les leads ciblés
      const leadIds = campaign.leadTargets.split(',');
      const leads = await storage.getLeadsByIds(leadIds);

      if (leads.length === 0) {
        return res.status(400).json({ message: "Aucun lead trouvé pour cette campagne" });
      }

      // Pour l'instant, on simule l'envoi d'emails (mode démo)
      const user = await storage.getUser(userId);
      console.log(`📧 Simulation d'envoi de campagne pour ${user?.email}`);

      // Envoyer les emails
      const results = await emailService.sendCampaignEmails(
        userId,
        campaignId,
        leads,
        customEmail.content,
        customEmail.subject
      );

      // Mettre à jour le statut de la campagne
      await storage.updateCampaign(campaignId, {
        status: 'sent',
        totalSent: results.sent
      });

      res.json({
        message: "Campagne envoyée avec succès",
        results: {
          sent: results.sent,
          failed: results.failed,
          total: leads.length,
          errors: results.errors.slice(0, 5) // Limiter les erreurs affichées
        }
      });
    } catch (error) {
      console.error("Erreur envoi campagne:", error);
      res.status(500).json({ message: "Erreur lors de l'envoi de la campagne" });
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

  // Supprimer un booking
  app.delete('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingId = req.params.id;
      
      await storage.deleteBooking(bookingId, userId);
      res.json({ message: "RDV supprimé avec succès" });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  });

  // Mettre à jour le statut de conversion d'un booking
  app.patch('/api/bookings/:id/conversion', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingId = req.params.id;
      const { conversionStatus } = req.body;
      
      if (!['converted', 'not_converted'].includes(conversionStatus)) {
        return res.status(400).json({ message: "Statut de conversion invalide" });
      }

      await storage.updateBookingConversion(bookingId, userId, conversionStatus);
      res.json({ message: "Statut de conversion mis à jour" });
    } catch (error) {
      console.error("Error updating conversion status:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour" });
    }
  });

  // Route publique pour que les prospects puissent booker directement
  app.post('/api/bookings/public', async (req: any, res) => {
    try {
      // Cette route accepte les bookings publics sans authentification
      const bookingData = {
        contactName: req.body.contactName,
        contactEmail: req.body.contactEmail,
        contactPhone: req.body.contactPhone,
        company: req.body.company,
        startTime: new Date(req.body.startTime),
        duration: req.body.duration,
        meetingType: req.body.meetingType,
        description: req.body.description,
        status: req.body.status || 'scheduled',
        message: req.body.message,
        // Pour l'instant, on associe à un utilisateur par défaut (premier utilisateur)
        userId: '45880930' as string // À remplacer par un système plus robuste
      };

      // Créer un booking standard avec les champs requis
      const standardBooking = {
        id: crypto.randomUUID(),
        userId: bookingData.userId,
        title: `RDV avec ${bookingData.contactName}`,
        description: bookingData.description,
        startTime: bookingData.startTime,
        endTime: new Date(bookingData.startTime.getTime() + (bookingData.duration * 60000)),
        status: bookingData.status,
        meetingType: bookingData.meetingType,
        createdAt: new Date()
      };

      const booking = await storage.createBooking(standardBooking);

      console.log(`📅 Nouveau RDV public programmé: ${bookingData.contactName} (${bookingData.contactEmail})`);
      
      res.json({
        message: "Rendez-vous confirmé !",
        booking: {
          id: booking.id,
          title: booking.title,
          startTime: booking.startTime,
          endTime: booking.endTime
        }
      });
    } catch (error) {
      console.error("Error creating public booking:", error);
      res.status(500).json({ message: "Erreur lors de la programmation du rendez-vous" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analytics = await storage.getAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
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
  await seedDatabase();

  // Register additional routes
  registerEmailVariationRoutes(app);

  // Custom email variation endpoint
  app.post('/api/custom-emails/generate-variation', isAuthenticated, async (req: any, res) => {
    try {
      const { content } = req.body;
      const userId = req.user.claims.sub;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "Content is required" });
      }

      // Vérifier les quotas
      const quotaCheck = await storage.checkVariationQuota(userId);
      if (!quotaCheck.canGenerate) {
        return res.status(429).json({ 
          message: `Quota épuisé ! Plan actuel permet ${quotaCheck.monthlyLimit} variations/mois.`,
          remainingVariations: quotaCheck.remainingVariations,
          monthlyLimit: quotaCheck.monthlyLimit,
          quotaExhausted: true
        });
      }

      // Générer la variation
      const variation = await storage.generateContentVariation(content, userId);
      
      // Incrémenter le compteur
      await storage.incrementVariationUsage(userId);
      
      res.json({ 
        variation,
        remainingVariations: quotaCheck.remainingVariations - 1,
        monthlyLimit: quotaCheck.monthlyLimit
      });
    } catch (error) {
      console.error("Error generating custom email variation:", error);
      res.status(500).json({ message: "Failed to generate variation" });
    }
  });

  // Lead generation endpoint
  app.post('/api/leads/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const searchParams: LeadSearchParams = req.body;
      
      // Validate search parameters
      const schema = z.object({
        sector: z.string().optional(),
        location: z.string().optional(),
        companySize: z.string().optional(),
        jobTitles: z.array(z.string()).optional(),
        limit: z.number().min(1).max(100).default(10)
      });
      
      const validatedParams = schema.parse(searchParams);
      
      // Generate leads using external service
      console.log(`🔍 Generating leads with Apollo API for sector: ${validatedParams.sector}, limit: ${validatedParams.limit}`);
      const leadService = getLeadService();
      const generatedLeads = await leadService.generateLeads(validatedParams);
      console.log(`📊 Generated ${generatedLeads.length} leads from Apollo API`);
      
      // Calculate AI scores and save to database
      const savedLeads = [];
      for (const leadData of generatedLeads) {
        // Enrich lead data
        const enrichedData = await leadService.enrichLead(leadData.email);
        
        // Calculate AI score using OpenAI if available
        let aiScore: number;
        let notes = "";
        
        // Calculate AI score using OpenAI with rate limiting
        if (process.env.OPENAI_API_KEY && generatedLeads.indexOf(leadData) < 3) {
          // Only use OpenAI for first 3 leads to avoid rate limiting
          try {
            const openaiService = new OpenAILeadScoringService();
            const aiResult = await openaiService.calculateAdvancedLeadScore(leadData, enrichedData || undefined);
            aiScore = aiResult.score;
            notes = `IA: ${aiResult.reasoning} | Priorités: ${aiResult.priorities.join(', ')}`;
          } catch (error) {
            console.warn("OpenAI scoring failed, using basic scoring:", error);
            aiScore = AILeadScoringService.calculateLeadScore(leadData, enrichedData || undefined);
            notes = enrichedData ? `Enrichi: ${enrichedData.company?.industry || ''} | ${enrichedData.person?.seniority || ''}` : "Score basique calculé";
          }
        } else {
          aiScore = AILeadScoringService.calculateLeadScore(leadData, enrichedData || undefined);
          notes = enrichedData ? `Enrichi: ${enrichedData.company?.industry || ''} | ${enrichedData.person?.seniority || ''}` : "Score basique calculé";
        }
        
        // Save to database
        const lead = await storage.createLead({
          userId,
          firstName: leadData.firstName,
          lastName: leadData.lastName,
          email: leadData.email,
          company: leadData.company,
          sector: leadData.sector,
          position: leadData.position,
          aiScore,
          status: 'new',
          source: 'external',
          notes
        });
        
        savedLeads.push(lead);
      }
      
      res.json({ 
        message: `${savedLeads.length} leads generated successfully`,
        leads: savedLeads 
      });
    } catch (error) {
      console.error("Error generating leads:", error);
      res.status(500).json({ message: "Failed to generate leads" });
    }
  });

  // CSV Import endpoint
  app.post('/api/leads/import-csv', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { csvContent } = req.body;
      
      if (!csvContent || typeof csvContent !== 'string') {
        return res.status(400).json({ message: "CSV content is required" });
      }
      
      // Parse CSV
      const importResult = CSVService.parseCSVToLeads(csvContent, userId);
      
      // Save successful leads to database
      const savedLeads = [];
      for (const leadData of importResult.successful) {
        // Calculate AI score if not provided
        if (!leadData.aiScore) {
          if (process.env.OPENAI_API_KEY) {
            try {
              const openaiService = new OpenAILeadScoringService();
              const aiResult = await openaiService.calculateAdvancedLeadScore({
                firstName: leadData.firstName || "",
                lastName: leadData.lastName || "",
                email: leadData.email || "",
                company: leadData.company || "",
                sector: leadData.sector || "",
                position: leadData.position || ""
              });
              leadData.aiScore = aiResult.score;
              if (!leadData.notes) {
                leadData.notes = `IA: ${aiResult.reasoning}`;
              }
            } catch (error) {
              console.warn("OpenAI scoring failed for CSV import, using basic scoring:", error);
              leadData.aiScore = AILeadScoringService.calculateLeadScore({
                firstName: leadData.firstName || "",
                lastName: leadData.lastName || "",
                email: leadData.email || "",
                company: leadData.company || "",
                sector: leadData.sector || "",
                position: leadData.position || ""
              });
            }
          } else {
            leadData.aiScore = AILeadScoringService.calculateLeadScore({
              firstName: leadData.firstName || "",
              lastName: leadData.lastName || "",
              email: leadData.email || "",
              company: leadData.company || "",
              sector: leadData.sector || "",
              position: leadData.position || ""
            });
          }
        }
        
        const lead = await storage.createLead(leadData);
        savedLeads.push(lead);
      }
      
      res.json({
        message: `Import completed: ${savedLeads.length}/${importResult.total} leads imported`,
        imported: savedLeads.length,
        total: importResult.total,
        errors: importResult.errors,
        leads: savedLeads
      });
    } catch (error) {
      console.error("Error importing CSV:", error);
      res.status(500).json({ message: "Failed to import CSV" });
    }
  });

  // CSV Export endpoint
  app.get('/api/leads/export-csv', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const leads = await storage.getLeads(userId);
      
      const csvContent = CSVService.exportLeadsToCSV({
        leads,
        includeScoring: true,
        includeNotes: true
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=leads-export.csv');
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      res.status(500).json({ message: "Failed to export CSV" });
    }
  });

  // Get sample CSV template
  app.get('/api/leads/csv-template', isAuthenticated, async (req: any, res) => {
    try {
      const csvTemplate = CSVService.generateSampleCSV();
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=leads-template.csv');
      res.send(csvTemplate);
    } catch (error) {
      console.error("Error generating CSV template:", error);
      res.status(500).json({ message: "Failed to generate CSV template" });
    }
  });

  // Admin endpoint to seed example leads for testing
  app.post('/api/admin/seed-leads', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Create example leads for this user
      for (const leadData of exampleLeads) {
        await storage.createLead({ ...leadData, userId });
      }
      
      res.json({ message: `${exampleLeads.length} example leads created successfully` });
    } catch (error) {
      console.error("Error seeding leads:", error);
      res.status(500).json({ message: "Failed to seed leads" });
    }
  });

  // Route pour annuler l'abonnement
  app.post('/api/cancel-subscription', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { reason, userEmail, userName } = req.body;
      
      console.log(`🚫 Demande d'annulation d'abonnement pour ${userId}: ${reason}`);
      
      // Downgrade vers le plan gratuit
      const updatedUser = await storage.updateUserPlan(userId, 'free', false);
      
      // Envoyer email avec la raison de résiliation
      await sendCancellationNotification(userEmail, userName, reason);
      
      // Log de la raison pour analyse (en production, sauvegarder en base)
      console.log(`📝 Raison d'annulation: "${reason}"`);
      
      res.json({ 
        success: true, 
        message: "Abonnement annulé avec succès",
        user: updatedUser 
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({ message: 'Erreur lors de l\'annulation' });
    }
  });

  // Fonction pour envoyer la notification de résiliation
  async function sendCancellationNotification(userEmail: string, userName: string, reason: string) {
    try {
      // Pour le moment, on log simplement - en production, utiliser un service d'email
      const adminEmail = 'contact@leadpilot.com'; // Tu peux changer cette adresse
      
      console.log(`
📧 NOTIFICATION DE RÉSILIATION
----------------------------------------
De: ${userName} (${userEmail})
Date: ${new Date().toLocaleString('fr-FR')}
Raison: ${reason}

Utilisateur ID: ${userEmail}
Envoyé à: ${adminEmail}
----------------------------------------
      `);
      
      // TODO: Intégrer un service d'email comme SendGrid, Mailgun ou SMTP
      // await emailService.send({
      //   to: adminEmail,
      //   subject: `Résiliation d'abonnement - ${userName}`,
      //   text: `L'utilisateur ${userName} (${userEmail}) a résilié son abonnement.\n\nRaison: ${reason}`
      // });
      
    } catch (error) {
      console.error('Erreur envoi email résiliation:', error);
      // Ne pas faire échouer la résiliation si l'email ne part pas
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}

// This function is now replaced by seedDatabase() from seed-data.ts
