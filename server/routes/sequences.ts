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

  // Mettre à jour une séquence
  app.put('/api/sequences/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Pour l'instant, retourner une réponse mock
      res.json({ message: "Sequence updated successfully" });
    } catch (error) {
      console.error("Error updating sequence:", error);
      res.status(500).json({ message: "Failed to update sequence" });
    }
  });

  // Supprimer une séquence
  app.delete('/api/sequences/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Pour l'instant, retourner une réponse mock
      res.json({ message: "Sequence deleted successfully" });
    } catch (error) {
      console.error("Error deleting sequence:", error);
      res.status(500).json({ message: "Failed to delete sequence" });
    }
  });
}