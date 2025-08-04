import type { InsertLead } from "@shared/schema";

// Lead generation service interface
export interface LeadGenerationService {
  generateLeads(params: LeadSearchParams): Promise<GeneratedLead[]>;
  enrichLead(email: string): Promise<EnrichedLeadData | null>;
}

export interface LeadSearchParams {
  sector?: string;
  location?: string;
  companySize?: string;
  jobTitles?: string[];
  limit?: number;
}

export interface GeneratedLead {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  sector: string;
  position: string;
  linkedinUrl?: string;
  companyWebsite?: string;
  employeeCount?: number;
  location?: string;
}

export interface EnrichedLeadData {
  company?: {
    industry: string;
    size: string;
    revenue?: string;
    founded?: number;
    technologies?: string[];
  };
  person?: {
    seniority: string;
    department: string;
    phoneNumber?: string;
  };
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
  };
}

// Mock Lead Generation Service (for development)
export class MockLeadService implements LeadGenerationService {
  private sampleCompanies = [
    { name: "TechInnovate", sector: "Tech/SaaS", website: "techinnovate.fr" },
    { name: "GreenEnergy Solutions", sector: "Energie", website: "green-energy.fr" },
    { name: "DigitalMarketing Pro", sector: "Marketing", website: "digimkt-pro.com" },
    { name: "CloudConsulting", sector: "Conseil", website: "cloudconsult.fr" },
    { name: "EcommercePlus", sector: "E-commerce", website: "ecom-plus.fr" },
    { name: "FinanceSecure", sector: "Finance", website: "financesecure.com" },
    { name: "HealthTech Solutions", sector: "Santé", website: "healthtech.fr" },
    { name: "EdTech Innovation", sector: "Education", website: "edtech-innov.com" },
    { name: "LogisticsMaster", sector: "Logistique", website: "logistics-master.fr" },
    { name: "RetailRevolution", sector: "Retail", website: "retail-revolution.com" }
  ];

  private samplePositions = [
    "CEO", "CTO", "CMO", "Directeur Commercial", "VP Sales", "Head of Marketing",
    "Directeur Général", "Responsable Business Development", "Chief Revenue Officer",
    "Directeur Marketing", "VP Business Development", "Head of Sales"
  ];

  private sampleFirstNames = [
    "Marie", "Pierre", "Sophie", "Thomas", "Amélie", "Julien", "Claire", "Nicolas",
    "Laura", "Alexandre", "Camille", "Maxime", "Emma", "Lucas", "Léa", "Antoine",
    "Chloé", "Mathieu", "Sarah", "Romain", "Julie", "Benjamin", "Manon", "Hugo"
  ];

  private sampleLastNames = [
    "Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand",
    "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David",
    "Bertrand", "Roux", "Vincent", "Fournier", "Morel", "Girard", "Andre", "Lefevre"
  ];

  async generateLeads(params: LeadSearchParams): Promise<GeneratedLead[]> {
    const count = Math.min(params.limit || 10, 50);
    const leads: GeneratedLead[] = [];

    for (let i = 0; i < count; i++) {
      const company = this.getRandomItem(this.sampleCompanies);
      const firstName = this.getRandomItem(this.sampleFirstNames);
      const lastName = this.getRandomItem(this.sampleLastNames);
      const position = this.getRandomItem(this.samplePositions);
      
      leads.push({
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.website}`,
        company: company.name,
        sector: params.sector || company.sector,
        position,
        linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        companyWebsite: `https://${company.website}`,
        employeeCount: Math.floor(Math.random() * 500) + 50,
        location: params.location || "France"
      });
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return leads;
  }

  async enrichLead(email: string): Promise<EnrichedLeadData | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      company: {
        industry: this.getRandomItem(["SaaS", "E-commerce", "Consulting", "Marketing", "Finance"]),
        size: this.getRandomItem(["1-10", "11-50", "51-200", "201-500", "500+"]),
        revenue: this.getRandomItem(["<1M€", "1-5M€", "5-20M€", "20-100M€", ">100M€"]),
        founded: 2015 + Math.floor(Math.random() * 8),
        technologies: this.getRandomItems(["React", "Node.js", "Python", "AWS", "Stripe", "Salesforce"], 2)
      },
      person: {
        seniority: this.getRandomItem(["Junior", "Mid", "Senior", "Executive"]),
        department: this.getRandomItem(["Sales", "Marketing", "Operations", "Technology", "Finance"])
      }
    };
  }

  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

// AI Scoring Service
export class AILeadScoringService {
  static calculateLeadScore(lead: GeneratedLead, enrichedData?: EnrichedLeadData): number {
    let score = 50; // Base score

    // Position scoring
    const seniorPositions = ["CEO", "CTO", "CMO", "Directeur", "VP", "Head", "Chief"];
    if (seniorPositions.some(pos => lead.position.includes(pos))) {
      score += 20;
    }

    // Company size scoring
    if (lead.employeeCount) {
      if (lead.employeeCount > 200) score += 15;
      else if (lead.employeeCount > 50) score += 10;
      else if (lead.employeeCount > 10) score += 5;
    }

    // Sector scoring
    const highValueSectors = ["Tech/SaaS", "Finance", "Conseil", "Marketing"];
    if (highValueSectors.includes(lead.sector)) {
      score += 10;
    }

    // Enriched data scoring
    if (enrichedData?.company) {
      if (enrichedData.company.size === "500+") score += 10;
      if (enrichedData.company.revenue?.includes("M€")) score += 15;
    }

    if (enrichedData?.person?.seniority === "Executive") {
      score += 15;
    }

    // Add some randomness for realistic scoring
    score += Math.floor(Math.random() * 20) - 10;

    return Math.max(0, Math.min(100, score));
  }
}

// External Lead API Service (for real implementation)
export class ExternalLeadService implements LeadGenerationService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.LEAD_API_KEY || "";
    this.baseUrl = process.env.LEAD_API_URL || "";
  }

  async generateLeads(params: LeadSearchParams): Promise<GeneratedLead[]> {
    if (!this.apiKey || !this.baseUrl) {
      console.warn("Lead API credentials not configured, falling back to mock service");
      const mockService = new MockLeadService();
      return mockService.generateLeads(params);
    }

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`Lead API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformApiResponse(data);
    } catch (error) {
      console.error("Error calling Lead API:", error);
      // Fallback to mock service
      const mockService = new MockLeadService();
      return mockService.generateLeads(params);
    }
  }

  async enrichLead(email: string): Promise<EnrichedLeadData | null> {
    if (!this.apiKey || !this.baseUrl) {
      const mockService = new MockLeadService();
      return mockService.enrichLead(email);
    }

    try {
      const response = await fetch(`${this.baseUrl}/enrich`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error(`Enrichment API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error enriching lead:", error);
      const mockService = new MockLeadService();
      return mockService.enrichLead(email);
    }
  }

  private transformApiResponse(data: any): GeneratedLead[] {
    // Transform external API response to our format
    // This would be customized based on the actual API response structure
    return data.leads || [];
  }
}

// Factory to get the appropriate lead service
export function getLeadService(): LeadGenerationService {
  // Use external service if API key is available, otherwise use mock
  if (process.env.LEAD_API_KEY && process.env.LEAD_API_URL) {
    return new ExternalLeadService();
  }
  return new MockLeadService();
}