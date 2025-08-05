import type { Express } from "express";
import { storage } from "../storage";

export function registerAdminRoutes(app: Express) {
  // Route d'administration pour mettre à jour manuellement le plan d'un utilisateur
  app.post('/api/admin/update-user-plan', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { plan } = req.body;
      const userId = req.user.id;

      console.log(`🔧 Mise à jour administrative du plan pour user ${userId} vers ${plan}`);

      // Valider le plan
      const validPlans = ['free', 'starter', 'pro', 'growth'];
      if (!validPlans.includes(plan)) {
        return res.status(400).json({ error: 'Plan invalide' });
      }

      // Mettre à jour le plan utilisateur
      const updatedUser = await storage.updateUserPlan(userId, plan, false);

      console.log(`✅ Plan utilisateur ${userId} mis à jour vers ${plan}`);

      res.json({ 
        success: true, 
        user: updatedUser,
        message: `Plan mis à jour vers ${plan}` 
      });

    } catch (error) {
      console.error('Erreur mise à jour plan admin:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du plan' });
    }
  });
}