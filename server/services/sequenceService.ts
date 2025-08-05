import { storage } from "../storage";
import type { Sequence, SequenceStep, SequenceEnrollment, InsertSequence, InsertSequenceStep, InsertSequenceEnrollment } from "@shared/schema";

export class SequenceService {
  // Créer une nouvelle séquence
  static async createSequence(userId: string, sequenceData: InsertSequence): Promise<Sequence> {
    return await storage.createSequence(userId, sequenceData);
  }

  // Ajouter une étape à une séquence
  static async addSequenceStep(sequenceId: string, stepData: InsertSequenceStep): Promise<SequenceStep> {
    return await storage.createSequenceStep(sequenceId, stepData);
  }

  // Inscrire un lead dans une séquence
  static async enrollLead(sequenceId: string, leadId: string): Promise<SequenceEnrollment> {
    const enrollment: InsertSequenceEnrollment = {
      sequenceId,
      leadId,
      currentStep: 1,
      status: "active",
      nextEmailScheduled: this.calculateNextEmailTime(1, [])
    };
    
    return await storage.createSequenceEnrollment(enrollment);
  }

  // Calculer le prochain envoi d'email
  static calculateNextEmailTime(stepNumber: number, steps: SequenceStep[]): Date {
    const step = steps.find(s => s.stepNumber === stepNumber);
    if (!step) return new Date();

    const now = new Date();
    const delayMs = (step.delayDays * 24 * 60 * 60 * 1000) + (step.delayHours * 60 * 60 * 1000);
    return new Date(now.getTime() + delayMs);
  }

  // Traiter les emails en attente (à appeler périodiquement)
  static async processScheduledEmails(): Promise<void> {
    const pendingEmails = await storage.getPendingSequenceEmails();
    
    for (const enrollment of pendingEmails) {
      try {
        // Logique d'envoi d'email ici
        await this.sendSequenceEmail(enrollment);
        
        // Mettre à jour l'inscription
        await storage.updateSequenceEnrollment(enrollment.id, {
          lastEmailSent: new Date(),
          currentStep: enrollment.currentStep + 1,
          nextEmailScheduled: this.calculateNextEmailTime(enrollment.currentStep + 1, [])
        });
      } catch (error) {
        console.error(`Erreur envoi email séquence ${enrollment.id}:`, error);
      }
    }
  }

  // Envoyer un email de séquence
  static async sendSequenceEmail(enrollment: SequenceEnrollment): Promise<void> {
    // Intégration avec le service d'email
    console.log(`Envoi email séquence pour lead ${enrollment.leadId}, étape ${enrollment.currentStep}`);
    // TODO: Intégrer avec le service d'email OAuth
  }

  // Obtenir les statistiques d'une séquence
  static async getSequenceStats(sequenceId: string): Promise<{
    totalEnrolled: number;
    active: number;
    completed: number;
    optedOut: number;
    averageCompletionRate: number;
  }> {
    return await storage.getSequenceStats(sequenceId);
  }
}