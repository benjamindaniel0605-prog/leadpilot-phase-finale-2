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

  async generateContentVariation(originalContent: string): Promise<string> {
    // Transformations qui préservent la structure française et la cohérence
    const transformations = [
      // Style 1: Professionnel soutenu
      (text: string) => text
        .replace(/Bonjour\s+[A-Za-z\s,]*,?/gi, "Madame, Monsieur,")
        .replace(/Salut[^,.]*/gi, "Madame, Monsieur,")
        .replace(/j'espère que vous allez bien[^.]*/gi, "j'espère que cette correspondance vous trouve en excellente forme")
        .replace(/je me permets de vous contacter/gi, "j'ai l'honneur de prendre contact avec vous")
        .replace(/je me lance/gi, "je me permets")
        .replace(/\bintéressé\b/gi, "particulièrement attentif")
        .replace(/\bsolution\b/gi, "approche méthodologique")
        .replace(/\bentreprise\b/gi, "organisation")
        .replace(/\bsociété\b/gi, "structure")
        .replace(/\bdévelopper\b/gi, "optimiser")
        .replace(/\bcroissance\b/gi, "développement")
        .replace(/\bbooster\b/gi, "dynamiser")
        .replace(/Cordialement[^.]*\.?/gi, "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.")
        .replace(/À bientôt[^.]*\.?/gi, "Dans l'attente de votre retour.")
        .replace(/\bj'aimerais\b/gi, "il me serait agréable de")
        .replace(/\bdiscuter\b/gi, "échanger")
        .replace(/\brencontrer\b/gi, "avoir l'honneur de vous recevoir"),

      // Style 2: Moderne et accessible
      (text: string) => text
        .replace(/Bonjour\s+[A-Za-z\s,]*,?/gi, "Bonjour,")
        .replace(/Madame, Monsieur,/gi, "Bonjour,")
        .replace(/j'espère que cette correspondance[^.]*/gi, "j'espère que vous allez bien")
        .replace(/j'ai l'honneur de prendre contact/gi, "je prends contact")
        .replace(/je me permets de vous contacter/gi, "je vous écris")
        .replace(/\bparticulièrement attentif\b/gi, "intéressé")
        .replace(/\bapproche méthodologique\b/gi, "solution")
        .replace(/\borganisation\b/gi, "entreprise")
        .replace(/\bstructure\b/gi, "société")
        .replace(/\boptimiser\b/gi, "améliorer")
        .replace(/\bdynamiser\b/gi, "développer")
        .replace(/\bdéveloppement\b/gi, "croissance")
        .replace(/Je vous prie d'agréer[^.]*\./gi, "Cordialement,")
        .replace(/Dans l'attente de votre retour\./gi, "À bientôt,")
        .replace(/il me serait agréable de/gi, "j'aimerais")
        .replace(/\béchanger\b/gi, "discuter")
        .replace(/avoir l'honneur de vous recevoir/gi, "vous rencontrer"),

      // Style 3: Commercial et dynamique  
      (text: string) => text
        .replace(/Bonjour\s+[A-Za-z\s,]*,?/gi, "Excellente journée,")
        .replace(/j'espère que vous allez bien[^.]*/gi, "j'espère que vos projets se portent à merveille")
        .replace(/je prends contact/gi, "je vous contacte aujourd'hui")
        .replace(/je vous écris/gi, "je me tourne vers vous")
        .replace(/\bintéressé\b/gi, "passionné par")
        .replace(/\bsolution\b/gi, "opportunité")
        .replace(/\bentreprise\b/gi, "organisation")
        .replace(/\baméliorer\b/gi, "propulser")
        .replace(/\bdévelopper\b/gi, "accélérer")
        .replace(/\bcroissance\b/gi, "expansion")
        .replace(/Cordialement,/gi, "Excellente continuation,")
        .replace(/À bientôt,/gi, "Au plaisir,")
        .replace(/\bj'aimerais\b/gi, "je serais ravi de")
        .replace(/\bdiscuter\b/gi, "explorer ensemble")
        .replace(/vous rencontrer/gi, "échanger avec vous"),

      // Style 4: Chaleureux et personnel
      (text: string) => text
        .replace(/Bonjour\s+[A-Za-z\s,]*,?/gi, "Belle journée à vous,")
        .replace(/Excellente journée,/gi, "Très bonne journée,")
        .replace(/j'espère que vos projets[^.]*/gi, "j'espère sincèrement que tout va bien de votre côté")
        .replace(/je vous contacte aujourd'hui/gi, "je prends quelques minutes pour vous écrire")
        .replace(/je me tourne vers vous/gi, "je me permets de vous adresser ce message")
        .replace(/\bpassionné par\b/gi, "sensible à")
        .replace(/\bopportunité\b/gi, "accompagnement")
        .replace(/\borganisation\b/gi, "société que vous dirigez")
        .replace(/\bpropulser\b/gi, "accompagner dans le développement de")
        .replace(/\baccélérer\b/gi, "soutenir")
        .replace(/\bexpansion\b/gi, "épanouissement")
        .replace(/Excellente continuation,/gi, "Avec toute ma considération,")
        .replace(/Au plaisir,/gi, "Bien chaleureusement,")
        .replace(/je serais ravi de/gi, "cela me ferait grand plaisir de")
        .replace(/explorer ensemble/gi, "avoir une conversation")
        .replace(/échanger avec vous/gi, "faire votre connaissance")
    ];
    
    // Sélectionner une transformation aléatoire
    const randomTransformation = transformations[Math.floor(Math.random() * transformations.length)];
    const result = randomTransformation(originalContent);
    
    // Post-traitement pour corriger la ponctuation et les espaces
    return result
      .replace(/\s+/g, ' ') // Espaces multiples → espace simple
      .replace(/,\s*,/g, ',') // Virgules doubles
      .replace(/\.\s*\./g, '.') // Points doubles
      .replace(/\s+([,.;!?])/g, '$1') // Espaces avant ponctuation
      .trim();
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
