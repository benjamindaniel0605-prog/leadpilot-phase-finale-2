import {
  users,
  templates,
  leads,
  campaigns,
  campaignEmails,
  sequences,
  bookings,
  customEmails,
  type User,
  type UpsertUser,
  type Template,
  type InsertTemplate,
  type Lead,
  type InsertLead,
  type Campaign,
  type InsertCampaign,
  type CampaignEmail,
  type Sequence,
  type InsertSequence,
  type Booking,
  type InsertBooking,
  type CustomEmail,
  type InsertCustomEmail,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Template operations
  getTemplates(): Promise<Template[]>;
  getTemplatesByPlan(plan: string): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(templateData: any): Promise<Template>;
  updateTemplateUsage(id: string): Promise<void>;
  updateTemplate(id: string, data: { subject?: string; content?: string }): Promise<void>;
  generateAIVariation(template: Template): Promise<{ subject: string; content: string }>;
  deleteCampaign(id: string): Promise<void>;
  
  // Custom email operations
  getCustomEmails(userId: string): Promise<CustomEmail[]>;
  createCustomEmail(userId: string, emailData: { name: string; subject: string; content: string; baseTemplateId?: string }): Promise<CustomEmail>;
  updateCustomEmail(id: string, data: { name?: string; subject?: string; content?: string }): Promise<void>;
  deleteCustomEmail(id: string): Promise<void>;
  generateContentVariation(content: string): Promise<string>;
  
  // Lead operations
  getLeads(userId: string): Promise<Lead[]>;
  getLead(id: string, userId: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, userId: string, updates: Partial<Lead>): Promise<Lead | undefined>;
  deleteLead(id: string, userId: string): Promise<boolean>;
  getLeadsCount(userId: string): Promise<number>;
  
  // Campaign operations
  getCampaigns(userId: string): Promise<Campaign[]>;
  getCampaign(id: string, userId: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  getCampaignEmails(campaignId: string): Promise<CampaignEmail[]>;
  
  // Sequence operations
  getSequences(userId: string): Promise<Sequence[]>;
  createSequence(sequence: InsertSequence): Promise<Sequence>;
  
  // Booking operations
  getBookings(userId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  
  // Analytics
  getUserStats(userId: string): Promise<{
    leadsGenerated: number;
    emailsSent: number;
    openRate: number;
    meetingsBooked: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Template operations
  async getTemplates(): Promise<Template[]> {
    return await db.select().from(templates).orderBy(templates.createdAt);
  }

  async createTemplate(templateData: any): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values(templateData)
      .returning();
    return template;
  }

  async getTemplatesByPlan(plan: string): Promise<Template[]> {
    const planHierarchy = {
      free: ['free'],
      starter: ['free', 'starter'],
      pro: ['free', 'starter', 'pro'],
      growth: ['free', 'starter', 'pro', 'growth']
    };
    
    const allowedPlans = planHierarchy[plan as keyof typeof planHierarchy] || ['free'];
    
    if (allowedPlans.length === 0) {
      return [];
    }
    
    return await db
      .select()
      .from(templates)
      .where(inArray(templates.plan, allowedPlans))
      .orderBy(templates.createdAt);
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }

  async updateTemplateUsage(id: string): Promise<void> {
    await db
      .update(templates)
      .set({ timesUsed: sql`${templates.timesUsed} + 1` })
      .where(eq(templates.id, id));
  }

  async updateTemplate(id: string, data: { subject?: string; content?: string }): Promise<void> {
    await db
      .update(templates)
      .set(data)
      .where(eq(templates.id, id));
  }

  async deleteTemplate(id: string): Promise<void> {
    await db.delete(templates).where(eq(templates.id, id));
  }

  // Vérifier les quotas de variations IA
  async checkVariationQuota(userId: string): Promise<{ canGenerate: boolean; remainingVariations: number; monthlyLimit: number }> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    // Quotas par plan
    const variationLimits = {
      free: 3,
      starter: 15,
      pro: 50,
      growth: 150
    };

    const monthlyLimit = variationLimits[user.plan as keyof typeof variationLimits] || 3;
    
    // Calculer les variations utilisées ce mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const variationsThisMonth = user.aiVariationsUsed || 0;
    const remainingVariations = Math.max(0, monthlyLimit - variationsThisMonth);

    return {
      canGenerate: remainingVariations > 0,
      remainingVariations,
      monthlyLimit
    };
  }

  // Incrémenter le compteur de variations utilisées
  async incrementVariationUsage(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        aiVariationsUsed: sql`${users.aiVariationsUsed} + 1`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async generateAIVariation(template: Template): Promise<{ subject: string; content: string }> {
    try {
      // Fallback direct avec variations substantielles (OpenAI sera ajouté plus tard)
      return {
        subject: this.generateSubjectVariation(template.subject),
        content: await this.generateContentVariation(template.content)
      };
    } catch (error) {
      console.error("Error generating variation:", error);
      // Fallback simple
      return {
        subject: template.subject + " - Version alternative",
        content: template.content.replace("Bonjour", "Salut").replace("vous", "tu")
      };
    }
  }

  private generateSubjectVariation(originalSubject: string): string {
    const variations = [
      originalSubject.replace(/Bonjour/gi, "Salutations")
        .replace(/votre/gi, "votre organisation")
        .replace(/entreprise/gi, "société")
        .replace(/découvrez/gi, "explorez")
        .replace(/opportunité/gi, "possibilité"),
      
      originalSubject.replace(/\b(\w+)\b/g, (match) => {
        const synonyms: { [key: string]: string } = {
          'bonjour': 'salut',
          'collaboration': 'partenariat',
          'découvrir': 'explorer',
          'opportunité': 'occasion',
          'solution': 'approche',
          'développer': 'améliorer',
          'croissance': 'expansion'
        };
        return synonyms[match.toLowerCase()] || match;
      }),
      
      originalSubject + " - Proposition personnalisée"
    ];
    
    return variations[Math.floor(Math.random() * variations.length)];
  }

  async generateContentVariation(originalContent: string, userId?: string): Promise<string> {
    // Transformations complètes qui affectent tout le contenu
    const transformations = [
      // Style 1: Professionnel très soutenu
      (text: string) => text
        .replace(/Bonjour\s*[^,\n]*/gi, "Madame, Monsieur")
        .replace(/Salut\s*[^,\n]*/gi, "Madame, Monsieur")
        .replace(/Hello\s*[^,\n]*/gi, "Madame, Monsieur")
        .replace(/j'espère que[^.]*\./gi, "j'ai l'espoir que cette correspondance vous trouve en excellente santé.")
        .replace(/je (vous )?écris|je (vous )?contacte|je prends contact/gi, "j'ai l'honneur de solliciter votre attention")
        .replace(/\bje\b/gi, "je me permets de")
        .replace(/\bvous\b/gi, "votre personne")
        .replace(/\bnotre\b/gi, "notre respectueuse")
        .replace(/\bvotre\b/gi, "votre estimée")
        .replace(/\bune\b/gi, "une remarquable")
        .replace(/\bdes\b/gi, "d'excellentes")
        .replace(/\bsolution\b/gi, "méthodologie d'excellence")
        .replace(/\bentreprise\b/gi, "noble organisation")
        .replace(/\bdévelopper\b/gi, "optimiser avec distinction")
        .replace(/\baméliorer\b/gi, "perfectionner")
        .replace(/Cordialement[^.]*\.?/gi, "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations les plus distinguées.")
        .replace(/À bientôt[^.]*\.?/gi, "Dans l'attente respectueuse de votre retour.")
        .replace(/Merci[^.]*\.?/gi, "Je vous exprime ma plus vive gratitude."),

      // Style 2: Moderne et décontracté
      (text: string) => text
        .replace(/Madame, Monsieur/gi, "Bonjour")
        .replace(/j'ai l'espoir que[^.]*\./gi, "j'espère que tout va bien !")
        .replace(/j'ai l'honneur de solliciter/gi, "je vous contacte")
        .replace(/je me permets de/gi, "je")
        .replace(/votre personne/gi, "vous")
        .replace(/notre respectueuse/gi, "notre")
        .replace(/votre estimée/gi, "votre")
        .replace(/une remarquable/gi, "une super")
        .replace(/d'excellentes/gi, "de bonnes")
        .replace(/méthodologie d'excellence/gi, "solution efficace")
        .replace(/noble organisation/gi, "boîte")
        .replace(/optimiser avec distinction/gi, "booster")
        .replace(/perfectionner/gi, "améliorer")
        .replace(/Veuillez agréer[^.]*\./gi, "À très bientôt !")
        .replace(/Dans l'attente respectueuse/gi, "J'ai hâte")
        .replace(/Je vous exprime ma plus vive gratitude/gi, "Merci beaucoup"),

      // Style 3: Commercial persuasif
      (text: string) => text
        .replace(/Bonjour/gi, "Excellente journée")
        .replace(/j'espère que tout va bien[^.]*\./gi, "j'espère que vos affaires prospèrent magnifiquement.")
        .replace(/je vous contacte/gi, "je me tourne vers vous avec enthousiasme")
        .replace(/\bje\b/gi, "j'ai le plaisir de")
        .replace(/\bvous\b/gi, "votre dynamique personne")
        .replace(/\bnotre\b/gi, "notre innovante")
        .replace(/\bvotre\b/gi, "votre florissante")
        .replace(/une super/gi, "une exceptionnelle")
        .replace(/de bonnes/gi, "de formidables")
        .replace(/solution efficace/gi, "opportunité en or")
        .replace(/boîte/gi, "entreprise leader")
        .replace(/booster/gi, "propulser vers le succès")
        .replace(/améliorer/gi, "révolutionner")
        .replace(/À très bientôt/gi, "Impatient de collaborer")
        .replace(/J'ai hâte/gi, "Dans l'attente de notre partenariat")
        .replace(/Merci beaucoup/gi, "Toute ma reconnaissance"),

      // Style 4: Chaleureux et humain
      (text: string) => text
        .replace(/Excellente journée/gi, "Belle journée à vous")
        .replace(/j'espère que vos affaires[^.]*\./gi, "j'espère sincèrement que vous vous portez à merveille.")
        .replace(/je me tourne vers vous avec enthousiasme/gi, "je prends un moment pour vous écrire")
        .replace(/j'ai le plaisir de/gi, "j'ai la joie de")
        .replace(/votre dynamique personne/gi, "vous")
        .replace(/notre innovante/gi, "notre")
        .replace(/votre florissante/gi, "votre")
        .replace(/une exceptionnelle/gi, "une belle")
        .replace(/de formidables/gi, "de chouettes")
        .replace(/opportunité en or/gi, "collaboration")
        .replace(/entreprise leader/gi, "société")
        .replace(/propulser vers le succès/gi, "accompagner")
        .replace(/révolutionner/gi, "enrichir")
        .replace(/Impatient de collaborer/gi, "Bien amicalement")
        .replace(/Dans l'attente de notre partenariat/gi, "Au plaisir d'échanger")
        .replace(/Toute ma reconnaissance/gi, "Merci du cœur")
    ];
    
    // Récupérer l'historique des variations pour éviter les doublons
    let variationHistory: string[] = [];
    if (userId) {
      const user = await this.getUser(userId);
      variationHistory = (user as any)?.variationHistory || [];
    }

    let result = originalContent;
    let attempts = 0;
    const maxAttempts = 20;

    // Générer une variation unique
    do {
      const randomIndex = Math.floor(Math.random() * transformations.length);
      const transformation = transformations[randomIndex];
      result = transformation(originalContent);
      
      // Ajouter de la randomisation supplémentaire basée sur le timestamp
      const timeBasedSeed = Date.now() % 8;
      result = this.addTimeBasedVariations(result, timeBasedSeed);
      
      attempts++;
    } while (variationHistory.includes(result) && attempts < maxAttempts);

    // Préserver EXACTEMENT les sauts de ligne et espaces originaux
    result = this.preserveExactFormatting(originalContent, result);
    
    // Stocker dans l'historique si userId fourni
    if (userId) {
      const updatedHistory = [...variationHistory, result].slice(-100); // Garder les 100 dernières
      await db.update(users)
        .set({ variationHistory: updatedHistory })
        .where(eq(users.id, userId));
    }
    
    return result;
  }

  private addTimeBasedVariations(text: string, seed: number): string {
    // Variations supplémentaires qui transforment plus de contenu
    const additionalVariations = [
      (t: string) => t
        .replace(/\bexcellent\b/gi, 'remarquable')
        .replace(/\bmerci\b/gi, 'mille mercis')
        .replace(/\brapide\b/gi, 'express')
        .replace(/\bfacile\b/gi, 'simple')
        .replace(/\befficace\b/gi, 'performant'),
      (t: string) => t
        .replace(/\bparfait\b/gi, 'idéal')
        .replace(/\bmerci\b/gi, 'un grand merci')
        .replace(/\brapide\b/gi, 'prompt')
        .replace(/\bfacile\b/gi, 'aisé')
        .replace(/\befficace\b/gi, 'redoutable'),
      (t: string) => t
        .replace(/\bcontacter\b/gi, 'joindre')
        .replace(/\bmerci\b/gi, 'toute ma gratitude')
        .replace(/\brapide\b/gi, 'véloce')
        .replace(/\bfacile\b/gi, 'fluide')
        .replace(/\befficace\b/gi, 'optimal'),
      (t: string) => t
        .replace(/\béchanger\b/gi, 'collaborer')
        .replace(/\bmerci\b/gi, 'ma reconnaissance')
        .replace(/\brapide\b/gi, 'immédiat')
        .replace(/\bfacile\b/gi, 'accessible')
        .replace(/\befficace\b/gi, 'productif'),
      (t: string) => t
        .replace(/\brencontrer\b/gi, 'nous voir')
        .replace(/\bmerci\b/gi, 'mes remerciements')
        .replace(/\brapide\b/gi, 'instantané')
        .replace(/\bfacile\b/gi, 'évident')
        .replace(/\befficace\b/gi, 'puissant'),
      (t: string) => t
        .replace(/\bproposer\b/gi, 'offrir')
        .replace(/\bmerci\b/gi, 'ma sincère gratitude')
        .replace(/\brapide\b/gi, 'fulgurant')
        .replace(/\bfacile\b/gi, 'intuitif')
        .replace(/\befficace\b/gi, 'remarquable'),
      (t: string) => t
        .replace(/\bprésenter\b/gi, 'exposer')
        .replace(/\bmerci\b/gi, 'toute ma considération')
        .replace(/\brapide\b/gi, 'ultra-rapide')
        .replace(/\bfacile\b/gi, 'sans effort')
        .replace(/\befficace\b/gi, 'extraordinaire'),
      (t: string) => t
        .replace(/\bdiscuter\b/gi, 'converser')
        .replace(/\bmerci\b/gi, 'mes plus vifs remerciements')
        .replace(/\brapide\b/gi, 'éclair')
        .replace(/\bfacile\b/gi, 'naturel')
        .replace(/\befficace\b/gi, 'incroyable')
    ];

    const variationIndex = seed % additionalVariations.length;
    return additionalVariations[variationIndex](text);
  }

  private preserveExactFormatting(original: string, transformed: string): string {
    // Conserver EXACTEMENT la structure de l'original
    const originalLines = original.split('\n');
    const transformedLines = transformed.split('\n');
    
    // Reconstituer en gardant les sauts de ligne originaux
    let result = '';
    for (let i = 0; i < originalLines.length; i++) {
      if (i < transformedLines.length) {
        result += transformedLines[i];
      } else {
        result += originalLines[i]; // Fallback sur l'original
      }
      
      if (i < originalLines.length - 1) {
        result += '\n'; // Préserver chaque saut de ligne
      }
    }
    
    return result
      .replace(/,\s*,/g, ',') // Virgules doubles
      .replace(/\.\s*\./g, '.') // Points doubles
      .replace(/\s+([,.;!?])/g, '$1'); // Espaces avant ponctuation
  }

  async deleteCampaign(id: string): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  // Custom email operations
  async getCustomEmails(userId: string): Promise<CustomEmail[]> {
    return await db.select().from(customEmails).where(eq(customEmails.userId, userId));
  }

  async createCustomEmail(userId: string, emailData: { name: string; subject: string; content: string; baseTemplateId?: string }): Promise<CustomEmail> {
    const [customEmail] = await db
      .insert(customEmails)
      .values({
        userId,
        name: emailData.name,
        subject: emailData.subject,
        content: emailData.content,
        baseTemplateId: emailData.baseTemplateId,
      })
      .returning();
    return customEmail;
  }

  async updateCustomEmail(id: string, data: { name?: string; subject?: string; content?: string }): Promise<void> {
    await db
      .update(customEmails)
      .set(data)
      .where(eq(customEmails.id, id));
  }

  async deleteCustomEmail(id: string): Promise<void> {
    await db.delete(customEmails).where(eq(customEmails.id, id));
  }

  // Lead operations
  async getLeads(userId: string): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.userId, userId))
      .orderBy(desc(leads.createdAt));
  }

  async getLead(id: string, userId: string): Promise<Lead | undefined> {
    const [lead] = await db
      .select()
      .from(leads)
      .where(and(eq(leads.id, id), eq(leads.userId, userId)));
    return lead;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  async updateLead(id: string, userId: string, updates: Partial<Lead>): Promise<Lead | undefined> {
    const [updatedLead] = await db
      .update(leads)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(leads.id, id), eq(leads.userId, userId)))
      .returning();
    return updatedLead;
  }

  async deleteLead(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(leads)
      .where(and(eq(leads.id, id), eq(leads.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getLeadsCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.userId, userId));
    return result.count;
  }

  // Campaign operations
  async getCampaigns(userId: string): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.userId, userId))
      .orderBy(desc(campaigns.createdAt));
  }

  async getCampaign(id: string, userId: string): Promise<Campaign | undefined> {
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)));
    return campaign;
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values(campaign).returning();
    return newCampaign;
  }

  async getCampaignEmails(campaignId: string): Promise<CampaignEmail[]> {
    return await db
      .select()
      .from(campaignEmails)
      .where(eq(campaignEmails.campaignId, campaignId));
  }

  // Sequence operations
  async getSequences(userId: string): Promise<Sequence[]> {
    return await db
      .select()
      .from(sequences)
      .where(eq(sequences.userId, userId))
      .orderBy(desc(sequences.createdAt));
  }

  async createSequence(sequence: InsertSequence): Promise<Sequence> {
    const [newSequence] = await db.insert(sequences).values(sequence).returning();
    return newSequence;
  }

  // Booking operations
  async getBookings(userId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.startTime));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  // Analytics
  async getUserStats(userId: string): Promise<{
    leadsGenerated: number;
    emailsSent: number;
    openRate: number;
    meetingsBooked: number;
  }> {
    const [leadsCount] = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.userId, userId));

    const [emailsStats] = await db
      .select({
        sent: sql<number>`COALESCE(SUM(${campaigns.totalSent}), 0)`,
        opened: sql<number>`COALESCE(SUM(${campaigns.totalOpened}), 0)`,
      })
      .from(campaigns)
      .where(eq(campaigns.userId, userId));

    const [bookingsCount] = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.userId, userId));

    const openRate = emailsStats.sent > 0 ? Math.round((emailsStats.opened / emailsStats.sent) * 100) : 0;

    return {
      leadsGenerated: leadsCount.count,
      emailsSent: emailsStats.sent,
      openRate,
      meetingsBooked: bookingsCount.count,
    };
  }

  // Analytics for user dashboard
  async getAnalytics(userId: string): Promise<any> {
    try {
      // Get leads count for current month (UTC time, start of month)
      const now = new Date();
      const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

      console.log(`Getting analytics for user ${userId}, month start: ${currentMonthStart.toISOString()}`);

      const [leadsResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(leads)
        .where(and(
          eq(leads.userId, userId),
          sql`${leads.createdAt} >= ${currentMonthStart}`
        ));

      const leadsThisMonth = leadsResult?.count || 0;
      console.log(`Leads this month for user ${userId}: ${leadsThisMonth}`);

      // Get user plan and calculate remaining leads
      const user = await this.getUser(userId);
      const planLimits = {
        free: 5,
        starter: 100,
        pro: 500,
        growth: 1500
      };

      const userPlan = user?.plan || 'free';
      const monthlyLimit = planLimits[userPlan as keyof typeof planLimits] || 10;
      const remainingLeads = Math.max(0, monthlyLimit - leadsThisMonth);

      console.log(`User plan: ${userPlan}, monthly limit: ${monthlyLimit}, remaining: ${remainingLeads}`);

      return {
        leadsGenerated: leadsThisMonth,
        remainingLeads: remainingLeads,
        userPlan: userPlan,
        monthlyLimit: monthlyLimit,
        emailsSent: "0", // À implémenter
        conversionRate: "0%", // À implémenter  
        avgScore: "0%" // À implémenter
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        leadsGenerated: 0,
        remainingLeads: 5,
        userPlan: 'free',
        monthlyLimit: 5,
        emailsSent: "0",
        conversionRate: "0%",
        avgScore: "0%"
      };
    }
  }
}

export const storage = new DatabaseStorage();
