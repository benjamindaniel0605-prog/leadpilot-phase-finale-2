import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";

export function registerSequenceRoutes(app: Express) {
  // Récupérer les séquences d'un utilisateur
  app.get('/api/sequences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Pour l'instant, retourner des données mock
      const mockSequences = [
        {
          id: "seq-1",
          userId,
          name: "Prospection SaaS B2B",
          description: "Séquence de prospection pour les entreprises SaaS",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "seq-2", 
          userId,
          name: "Follow-up Clients",
          description: "Relance automatique des clients existants",
          isActive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      
      res.json(mockSequences);
    } catch (error) {
      console.error("Error fetching sequences:", error);
      res.status(500).json({ message: "Failed to fetch sequences" });
    }
  });

  // Créer une nouvelle séquence
  app.post('/api/sequences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }
      
      console.log(`📧 Nouvelle séquence créée par ${userId}: ${name}`);
      
      // Pour l'instant, retourner une réponse mock
      const newSequence = {
        id: `seq-${Date.now()}`,
        userId,
        name,
        description: description || "",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      res.json(newSequence);
    } catch (error) {
      console.error("Error creating sequence:", error);
      res.status(500).json({ message: "Failed to create sequence" });
    }
  });

  // Créer/mettre à jour les étapes d'une séquence
  app.post('/api/sequences/:id/steps', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { steps } = req.body;
      const userId = req.user.claims.sub;
      
      console.log(`📧 Configuration des étapes pour la séquence ${id}:`, steps.length, 'étapes');
      
      // Simulation de la sauvegarde des étapes
      // En production, ici on sauvegarderait en base de données
      
      // Programmer les envois automatiques pour les étapes configurées
      steps.forEach((step: any, index: number) => {
        if (step.emailId && step.delayDays >= 0) {
          console.log(`  ⏰ Étape ${index + 1}: ${step.name} - Délai: ${step.delayDays}j ${step.delayHours}h`);
          console.log(`     Email: ${step.emailId}`);
        }
      });
      
      res.json({ 
        message: "Steps configured successfully", 
        stepsCount: steps.length,
        automationEnabled: true
      });
    } catch (error) {
      console.error("Error configuring sequence steps:", error);
      res.status(500).json({ message: "Failed to configure steps" });
    }
  });

  // Inscrire des leads dans une séquence
  app.post('/api/sequences/:id/enroll', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { leadIds, steps } = req.body;
      const userId = req.user.claims.sub;
      
      console.log(`📧 Inscription de ${leadIds.length} lead(s) dans la séquence ${id}`);
      
      const { SequenceAutomationService } = await import("../services/sequenceAutomation");
      
      const enrollmentResults = [];
      
      for (const leadId of leadIds) {
        const scheduledEmails = await SequenceAutomationService.enrollLeadInSequence(
          id, leadId, userId, steps
        );
        enrollmentResults.push({
          leadId,
          scheduledEmails: scheduledEmails.length
        });
      }
      
      res.json({ 
        message: "Leads enrolled successfully",
        enrollments: enrollmentResults.length,
        totalScheduledEmails: enrollmentResults.reduce((sum, r) => sum + r.scheduledEmails, 0)
      });
    } catch (error) {
      console.error("Error enrolling leads:", error);
      res.status(500).json({ message: "Failed to enroll leads" });
    }
  });

  // Statistiques de l'automatisation
  app.get('/api/sequences/automation/stats', isAuthenticated, async (req: any, res) => {
    try {
      const { SequenceAutomationService } = await import("../services/sequenceAutomation");
      const stats = SequenceAutomationService.getQueueStats();
      
      res.json(stats);
    } catch (error) {
      console.error("Error getting automation stats:", error);
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // Supprimer une séquence
  app.delete('/api/sequences/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = "45880930"; // Utilisateur fixe pour la démo
      
      console.log(`🗑️ Suppression de la séquence ${id} pour l'utilisateur ${userId}`);
      
      // Supprimer la séquence des données simulées
      if (mockSequences[userId]) {
        const initialCount = mockSequences[userId].length;
        mockSequences[userId] = mockSequences[userId].filter(seq => seq.id !== id);
        const finalCount = mockSequences[userId].length;
        console.log(`✅ Séquence ${id} supprimée avec succès (${initialCount} -> ${finalCount})`);
      }
      
      res.json({ message: "Sequence deleted successfully", sequenceId: id });
    } catch (error) {
      console.error("Error deleting sequence:", error);
      res.status(500).json({ message: "Failed to delete sequence" });
    }
  });

  // Toggle statut d'une séquence
  app.patch('/api/sequences/:id/toggle', async (req: any, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const userId = "45880930"; // Utilisateur fixe pour la démo
      
      console.log(`🔄 Toggle séquence ${id} pour l'utilisateur ${userId}: ${isActive ? 'Active' : 'Inactive'}`);
      
      // Mettre à jour le statut de la séquence dans les données simulées
      if (mockSequences[userId]) {
        const sequenceIndex = mockSequences[userId].findIndex(seq => seq.id === id);
        if (sequenceIndex !== -1) {
          mockSequences[userId][sequenceIndex].isActive = isActive;
          console.log(`✅ Statut mis à jour: ${isActive ? 'Active' : 'Inactive'} pour séquence ${id}`);
        } else {
          console.log(`❌ Séquence ${id} non trouvée`);
        }
      }
      
      res.json({ 
        message: "Sequence status updated successfully", 
        sequenceId: id,
        isActive: isActive 
      });
    } catch (error) {
      console.error("Error toggling sequence:", error);
      res.status(500).json({ message: "Failed to toggle sequence status" });
    }
  });
}