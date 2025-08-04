import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertLeadSchema, insertCampaignSchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";
import { seedDatabase, exampleLeads } from "./seed-data";
import { getLeadService, AILeadScoringService, type LeadSearchParams } from "./services/leadService";
import { CSVService } from "./services/csvService";
import { OpenAILeadScoringService } from "./services/openaiService";
import { registerEmailVariationRoutes } from "./routes/emailVariations";

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
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Utiliser OpenAI pour générer une variation complète
      const variation = await storage.generateAIVariation(template);
      
      // Mettre à jour le template avec la variation
      await storage.updateTemplate(req.params.id, { 
        subject: variation.subject, 
        content: variation.content 
      });
      
      res.json({ message: "AI variation applied successfully" });
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

  const httpServer = createServer(app);
  return httpServer;
}

// This function is now replaced by seedDatabase() from seed-data.ts
