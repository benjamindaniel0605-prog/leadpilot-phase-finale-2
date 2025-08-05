import { storage } from "../storage";

interface QueuedEmail {
  id: string;
  sequenceId: string;
  leadId: string;
  stepNumber: number;
  emailId: string;
  userId: string;
  scheduledFor: Date;
  sent: boolean;
  leadResponded: boolean;
}

// Simulation d'une queue d'emails programmés
let emailQueue: QueuedEmail[] = [];

export class SequenceAutomationService {
  
  // Ajouter un lead à une séquence
  static async enrollLeadInSequence(
    sequenceId: string, 
    leadId: string, 
    userId: string,
    sequenceSteps: any[]
  ) {
    console.log(`📧 Inscription du lead ${leadId} dans la séquence ${sequenceId}`);
    
    // Programmer tous les emails de la séquence
    for (const step of sequenceSteps) {
      if (step.emailId) {
        const scheduledFor = this.calculateScheduleTime(step.delayDays, step.delayHours);
        
        const queuedEmail: QueuedEmail = {
          id: `email-${Date.now()}-${step.stepNumber}`,
          sequenceId,
          leadId,
          stepNumber: step.stepNumber,
          emailId: step.emailId,
          userId,
          scheduledFor,
          sent: false,
          leadResponded: false
        };
        
        emailQueue.push(queuedEmail);
        
        console.log(`  ⏰ Email programmé - Étape ${step.stepNumber}: ${scheduledFor.toLocaleString()}`);
      }
    }
    
    return emailQueue.filter(e => e.sequenceId === sequenceId && e.leadId === leadId);
  }
  
  // Calculer l'heure de programmation d'un email
  private static calculateScheduleTime(delayDays: number, delayHours: number): Date {
    const now = new Date();
    now.setDate(now.getDate() + delayDays);
    now.setHours(now.getHours() + delayHours);
    return now;
  }
  
  // Marquer qu'un lead a répondu (arrête la séquence)
  static async markLeadResponded(leadId: string, sequenceId: string) {
    console.log(`✋ Lead ${leadId} a répondu - Arrêt de la séquence ${sequenceId}`);
    
    // Marquer tous les emails futurs comme annulés
    emailQueue = emailQueue.map(email => {
      if (email.leadId === leadId && email.sequenceId === sequenceId && !email.sent) {
        return { ...email, leadResponded: true };
      }
      return email;
    });
    
    const cancelledCount = emailQueue.filter(
      e => e.leadId === leadId && e.sequenceId === sequenceId && e.leadResponded
    ).length;
    
    console.log(`  📧 ${cancelledCount} email(s) annulé(s) suite à la réponse`);
  }
  
  // Processeur d'emails automatiques (appelé toutes les minutes en production)
  static async processScheduledEmails() {
    const now = new Date();
    const emailsToSend = emailQueue.filter(
      email => !email.sent && 
               !email.leadResponded && 
               email.scheduledFor <= now
    );
    
    if (emailsToSend.length === 0) {
      return;
    }
    
    console.log(`📬 Traitement de ${emailsToSend.length} email(s) programmé(s)`);
    
    for (const email of emailsToSend) {
      try {
        await this.sendScheduledEmail(email);
        
        // Marquer comme envoyé
        const emailIndex = emailQueue.findIndex(e => e.id === email.id);
        if (emailIndex !== -1) {
          emailQueue[emailIndex].sent = true;
        }
        
        console.log(`✅ Email envoyé - Séquence ${email.sequenceId}, Étape ${email.stepNumber}`);
        
      } catch (error) {
        console.error(`❌ Erreur envoi email ${email.id}:`, error);
      }
    }
  }
  
  // Envoyer un email programmé
  private static async sendScheduledEmail(email: QueuedEmail) {
    // Récupérer les données du lead (simulation pour la démonstration)
    const lead = {
      id: email.leadId,
      firstName: "John",
      lastName: "Doe", 
      email: "john.doe@example.com",
      company: "Example Corp"
    };
    if (!lead) {
      throw new Error(`Lead ${email.leadId} not found`);
    }
    
    // Récupérer l'email personnalisé (simulation)
    // const customEmail = await storage.getCustomEmail(email.emailId);
    const customEmail = {
      id: email.emailId,
      subject: "Email automatisé de séquence",
      content: "Bonjour [PRENOM], ceci est un email automatique de votre séquence."
    };
    
    console.log(`📧 Envoi automatique:`);
    console.log(`  Lead: ${lead.firstName} ${lead.lastName} (${lead.email})`);
    console.log(`  Sujet: ${customEmail.subject}`);
    console.log(`  Séquence: ${email.sequenceId}, Étape: ${email.stepNumber}`);
    
    // SIMULATION : En production, ici on utiliserait OAuth Gmail pour envoyer
    // await gmailService.sendEmail({
    //   to: lead.email,
    //   subject: customEmail.subject,
    //   body: this.personalizeEmailContent(customEmail.content, lead),
    //   userId: email.userId
    // });
    
    // Pour la démonstration, on log juste l'envoi
    console.log(`  ✉️ [SIMULATION] Email envoyé avec succès`);
  }
  
  // Personnaliser le contenu de l'email avec les données du lead
  private static personalizeEmailContent(content: string, lead: any): string {
    return content
      .replace(/\[PRENOM\]/g, lead.firstName || lead.email)
      .replace(/\[NOM\]/g, lead.lastName || '')
      .replace(/\[ENTREPRISE\]/g, lead.company || 'votre entreprise')
      .replace(/\[EMAIL\]/g, lead.email);
  }
  
  // Statistiques de la queue
  static getQueueStats() {
    const total = emailQueue.length;
    const sent = emailQueue.filter(e => e.sent).length;
    const pending = emailQueue.filter(e => !e.sent && !e.leadResponded).length;
    const cancelled = emailQueue.filter(e => e.leadResponded).length;
    
    return { total, sent, pending, cancelled };
  }
  
  // Obtenir les emails programmés pour un lead/séquence
  static getScheduledEmails(leadId?: string, sequenceId?: string) {
    return emailQueue.filter(email => {
      if (leadId && email.leadId !== leadId) return false;
      if (sequenceId && email.sequenceId !== sequenceId) return false;
      return true;
    });
  }
}

// Démarrer le processeur automatique (simulation toutes les 30 secondes)
let automationInterval: NodeJS.Timeout;

export function startSequenceAutomation() {
  console.log("🚀 Démarrage de l'automatisation des séquences");
  
  automationInterval = setInterval(async () => {
    await SequenceAutomationService.processScheduledEmails();
  }, 30000); // Toutes les 30 secondes pour la démo (1 minute en production)
}

export function stopSequenceAutomation() {
  if (automationInterval) {
    clearInterval(automationInterval);
    console.log("⏹️ Arrêt de l'automatisation des séquences");
  }
}