import type { Express } from "express";
import { z } from "zod";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { OpenAILeadScoringService } from "../services/openaiService";

export function registerEmailVariationRoutes(app: Express) {
  // Generate email variations for a template
  app.post('/api/templates/:templateId/variations', isAuthenticated, async (req: any, res) => {
    try {
      const { templateId } = req.params;
      const schema = z.object({
        leadContext: z.object({
          firstName: z.string(),
          lastName: z.string(),
          company: z.string(),
          position: z.string(),
          sector: z.string()
        }),
        count: z.number().min(1).max(5).default(3)
      });

      const { leadContext, count } = schema.parse(req.body);

      // Get the template
      const template = await storage.getTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          message: "AI service not available - OpenAI API key required" 
        });
      }

      // Generate variations using OpenAI
      const openaiService = new OpenAILeadScoringService();
      const variations = await openaiService.generateEmailVariations(
        template.content,
        leadContext,
        count
      );

      res.json({
        templateId,
        originalSubject: template.subject,
        originalContent: template.content,
        variations: variations.map((content, index) => ({
          id: index + 1,
          subject: template.subject, // Could also vary the subject
          content,
          tone: index === 0 ? "professionnel" : index === 1 ? "décontracté" : "direct"
        })),
        leadContext
      });
    } catch (error) {
      console.error("Error generating email variations:", error);
      res.status(500).json({ message: "Failed to generate variations" });
    }
  });

  // Get available AI features status
  app.get('/api/ai/status', isAuthenticated, async (req, res) => {
    res.json({
      openaiAvailable: !!process.env.OPENAI_API_KEY,
      apolloAvailable: !!process.env.APOLLO_API_KEY,
      features: {
        advancedScoring: !!process.env.OPENAI_API_KEY,
        emailVariations: !!process.env.OPENAI_API_KEY,
        realLeadGeneration: !!process.env.APOLLO_API_KEY,
        leadEnrichment: !!process.env.APOLLO_API_KEY
      }
    });
  });
}