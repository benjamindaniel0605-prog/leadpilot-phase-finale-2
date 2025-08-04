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
    // Générateur de variations plus complet qui transforme TOUT le contenu
    const transformations = [
      // Transformation 1: Style professionnel soutenu
      (text: string) => text
        .replace(/Bonjour[^,.]*/gi, "Mesdames, Messieurs")
        .replace(/Salut[^,.]*/gi, "Mesdames, Messieurs") 
        .replace(/j'espère que vous allez bien[^.]*/gi, "j'espère que cette communication vous trouve en parfaite santé")
        .replace(/j'espère que tout[^.]*/gi, "j'espère que cette communication vous trouve en excellente forme")
        .replace(/je me permets de[^.]*/gi, "je me permets de solliciter votre attention afin de")
        .replace(/je prends[^.]*/gi, "j'ai l'honneur de prendre")
        .replace(/intéressé/gi, "vivement intéressé")
        .replace(/solution/gi, "méthodologie éprouvée")
        .replace(/approche/gi, "démarche professionnelle")
        .replace(/entreprise/gi, "structure entrepreneuriale")
        .replace(/société/gi, "organisation")
        .replace(/boîte/gi, "entreprise")
        .replace(/développer/gi, "optimiser et développer")
        .replace(/booster/gi, "développer stratégiquement")
        .replace(/croissance/gi, "développement stratégique")
        .replace(/growth/gi, "expansion")
        .replace(/Cordialement[^.]*/gi, "Je vous prie d'agréer mes salutations distinguées")
        .replace(/À très vite[^.]*/gi, "Dans l'attente de votre retour")
        .replace(/À bientôt[^.]*/gi, "En espérant avoir le plaisir de vous lire")
        .replace(/j'aimerais/gi, "il me serait agréable de")
        .replace(/ça me plairait/gi, "il me serait très agréable")
        .replace(/discuter/gi, "échanger de manière constructive")
        .replace(/papoter/gi, "converser professionnellement")
        .replace(/proposer/gi, "avoir l'honneur de vous présenter")
        .replace(/présenter/gi, "soumettre à votre approbation")
        .replace(/te montrer/gi, "vous présenter")
        .replace(/rencontrer/gi, "avoir le plaisir de vous rencontrer")
        .replace(/se voir/gi, "nous rencontrer")
        .replace(/échanger en direct/gi, "converser en personne"),

      // Transformation 2: Style décontracté et moderne  
      (text: string) => text
        .replace(/Bonjour[^,.]*/gi, "Salut")
        .replace(/Mesdames, Messieurs[^,.]*/gi, "Hello")
        .replace(/j'espère que vous allez bien[^.]*/gi, "j'espère que tout roule de votre côté")
        .replace(/j'espère que cette communication[^.]*/gi, "j'espère que ça va bien")
        .replace(/je me permets de[^.]*/gi, "je me lance et")
        .replace(/j'ai l'honneur de[^.]*/gi, "je")
        .replace(/vivement intéressé/gi, "super intéressé")
        .replace(/intéressé/gi, "curieux")
        .replace(/méthodologie éprouvée/gi, "super approche")
        .replace(/solution/gi, "truc génial")
        .replace(/démarche professionnelle/gi, "façon de faire")
        .replace(/approche/gi, "méthode")
        .replace(/structure entrepreneuriale/gi, "boîte")
        .replace(/organisation/gi, "entreprise")
        .replace(/entreprise/gi, "société")
        .replace(/optimiser et développer/gi, "booster")
        .replace(/développer stratégiquement/gi, "faire grandir")
        .replace(/développer/gi, "améliorer")
        .replace(/développement stratégique/gi, "growth")
        .replace(/expansion/gi, "développement")
        .replace(/croissance/gi, "progression")
        .replace(/Je vous prie d'agréer[^.]*/gi, "À très vite !")
        .replace(/Cordialement[^.]*/gi, "À bientôt !")
        .replace(/il me serait agréable de/gi, "ça me plairait de")
        .replace(/il me serait très agréable/gi, "j'adorerais")
        .replace(/j'aimerais/gi, "ça me dirait de")
        .replace(/échanger de manière constructive/gi, "papoter")
        .replace(/converser professionnellement/gi, "discuter")
        .replace(/discuter/gi, "bavarder")
        .replace(/avoir l'honneur de vous présenter/gi, "te montrer")
        .replace(/soumettre à votre approbation/gi, "te proposer")
        .replace(/proposer/gi, "montrer")
        .replace(/vous présenter/gi, "te faire voir")
        .replace(/avoir le plaisir de vous rencontrer/gi, "se voir")
        .replace(/converser en personne/gi, "se rencontrer")
        .replace(/rencontrer/gi, "voir"),

      // Transformation 3: Style commercial dynamique
      (text: string) => text
        .replace(/Bonjour[^,.]*/gi, "Excellente journée")
        .replace(/Salut[^,.]*/gi, "Super journée")
        .replace(/Hello[^,.]*/gi, "Bonne journée")
        .replace(/j'espère que vous allez bien[^.]*/gi, "j'espère que vos projets avancent à merveille")
        .replace(/j'espère que tout roule[^.]*/gi, "j'espère que les affaires marchent bien")
        .replace(/je me permets de[^.]*/gi, "je prends contact avec vous aujourd'hui pour")
        .replace(/je me lance et/gi, "je vous contacte pour")
        .replace(/super intéressé/gi, "particulièrement attentif à")
        .replace(/curieux/gi, "attentif à")
        .replace(/intéressé/gi, "focus sur")
        .replace(/super approche/gi, "stratégie gagnante")
        .replace(/truc génial/gi, "solution performante")
        .replace(/méthodologie éprouvée/gi, "stratégie éprouvée")
        .replace(/solution/gi, "approche")
        .replace(/façon de faire/gi, "méthode de travail")
        .replace(/méthode/gi, "stratégie")
        .replace(/approche/gi, "tactique")
        .replace(/boîte/gi, "organisation performante")
        .replace(/entreprise/gi, "structure dynamique")
        .replace(/société/gi, "entreprise")
        .replace(/booster/gi, "propulser")
        .replace(/faire grandir/gi, "développer rapidement")
        .replace(/améliorer/gi, "optimiser")
        .replace(/développer/gi, "accélérer")
        .replace(/growth/gi, "performance commerciale")
        .replace(/développement/gi, "croissance")
        .replace(/progression/gi, "montée en puissance")
        .replace(/croissance/gi, "expansion")
        .replace(/À très vite[^.]*/gi, "Excellente continuation")
        .replace(/À bientôt[^.]*/gi, "Bonne continuation")
        .replace(/Cordialement[^.]*/gi, "Très bonne journée")
        .replace(/ça me plairait de/gi, "je serais ravi de")
        .replace(/j'adorerais/gi, "ce serait fantastique de")
        .replace(/ça me dirait de/gi, "j'aimerais")
        .replace(/j'aimerais/gi, "je souhaiterais")
        .replace(/papoter/gi, "explorer ensemble")
        .replace(/discuter/gi, "échanger")
        .replace(/bavarder/gi, "converser")
        .replace(/te montrer/gi, "vous dévoiler")
        .replace(/te proposer/gi, "vous présenter")
        .replace(/montrer/gi, "démontrer")
        .replace(/te faire voir/gi, "vous faire découvrir")
        .replace(/proposer/gi, "suggérer")
        .replace(/se voir/gi, "échanger en direct")
        .replace(/se rencontrer/gi, "nous voir")
        .replace(/voir/gi, "rencontrer")
        .replace(/rencontrer/gi, "nous retrouver"),

      // Transformation 4: Style empathique et personnalisé
      (text: string) => text
        .replace(/Bonjour[^,.]*/gi, "Très bonne journée à vous")
        .replace(/Excellente journée[^,.]*/gi, "Belle journée")
        .replace(/Super journée[^,.]*/gi, "Agréable journée")
        .replace(/j'espère que vous allez bien[^.]*/gi, "j'espère sincèrement que tout va pour le mieux")
        .replace(/j'espère que vos projets[^.]*/gi, "j'espère que tout se déroule bien pour vous")
        .replace(/je me permets de[^.]*/gi, "je prends quelques minutes pour vous écrire afin de")
        .replace(/je prends contact avec vous[^.]*/gi, "je me tourne vers vous")
        .replace(/particulièrement attentif à/gi, "genuinement intéressé par")
        .replace(/attentif à/gi, "sensible à")
        .replace(/focus sur/gi, "concentré sur")
        .replace(/intéressé/gi, "touché par")
        .replace(/stratégie gagnante/gi, "accompagnement sur mesure")
        .replace(/solution performante/gi, "aide personnalisée")
        .replace(/stratégie éprouvée/gi, "soutien adapté")
        .replace(/tactique/gi, "approche bienveillante")
        .replace(/stratégie/gi, "méthode personnalisée")
        .replace(/approche/gi, "accompagnement")
        .replace(/organisation performante/gi, "société que vous dirigez")
        .replace(/structure dynamique/gi, "entreprise que vous animez")
        .replace(/entreprise/gi, "organisation")
        .replace(/propulser/gi, "faire grandir en douceur")
        .replace(/développer rapidement/gi, "accompagner le développement")
        .replace(/optimiser/gi, "améliorer")
        .replace(/accélérer/gi, "soutenir")
        .replace(/développer/gi, "cultiver")
        .replace(/performance commerciale/gi, "essor commercial")
        .replace(/croissance/gi, "épanouissement")
        .replace(/montée en puissance/gi, "développement harmonieux")
        .replace(/expansion/gi, "croissance")
        .replace(/Excellente continuation[^.]*/gi, "Avec toute ma considération")
        .replace(/Bonne continuation[^.]*/gi, "Bien cordialement")
        .replace(/Très bonne journée[^.]*/gi, "Chaleureusement")
        .replace(/je serais ravi de/gi, "cela me ferait réellement plaisir de")
        .replace(/ce serait fantastique de/gi, "j'aurais beaucoup de joie à")
        .replace(/j'aimerais/gi, "je serais honoré de")
        .replace(/je souhaiterais/gi, "il me tiendrait à cœur de")
        .replace(/explorer ensemble/gi, "avoir une conversation")
        .replace(/échanger/gi, "partager")
        .replace(/converser/gi, "dialoguer")
        .replace(/vous dévoiler/gi, "partager avec vous")
        .replace(/vous présenter/gi, "vous faire découvrir")
        .replace(/démontrer/gi, "vous expliquer")
        .replace(/vous faire découvrir/gi, "vous accompagner dans")
        .replace(/suggérer/gi, "proposer respectueusement")
        .replace(/échanger en direct/gi, "faire votre connaissance")
        .replace(/nous voir/gi, "nous rencontrer")
        .replace(/rencontrer/gi, "faire connaissance")
        .replace(/nous retrouver/gi, "avoir un échange")
    ];
    
    // Choisir une transformation aléatoire et l'appliquer
    const randomTransformation = transformations[Math.floor(Math.random() * transformations.length)];
    const result = randomTransformation(originalContent);
    return result;
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
