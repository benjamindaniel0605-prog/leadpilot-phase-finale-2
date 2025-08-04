import type { LeadGenerationService, LeadSearchParams, GeneratedLead, EnrichedLeadData } from "./leadService";

export class ApolloLeadService implements LeadGenerationService {
  private apiKey: string;
  private baseUrl = "https://api.apollo.io/v1";

  constructor() {
    this.apiKey = process.env.APOLLO_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("APOLLO_API_KEY is required");
    }
  }

  async generateLeads(params: LeadSearchParams): Promise<GeneratedLead[]> {
    try {
      const searchParams = this.buildSearchParams(params);
      
      const response = await fetch(`${this.baseUrl}/mixed_people/search`, {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey
        },
        body: JSON.stringify(searchParams)
      });

      if (!response.ok) {
        throw new Error(`Apollo API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformApolloResponse(data);
    } catch (error) {
      console.error("Error calling Apollo API:", error);
      throw error;
    }
  }

  async enrichLead(email: string): Promise<EnrichedLeadData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/people/match`, {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey
        },
        body: JSON.stringify({
          email: email,
          reveal_personal_emails: true
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Person not found
        }
        throw new Error(`Apollo enrichment error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformEnrichmentResponse(data);
    } catch (error) {
      console.error("Error enriching lead with Apollo:", error);
      return null;
    }
  }

  private buildSearchParams(params: LeadSearchParams) {
    const apolloParams: any = {
      page: 1,
      per_page: Math.min(params.limit || 25, 100),
      person_locations: params.location ? [params.location] : ["France"],
      person_seniorities: ["c_suite", "senior", "director", "vp"],
    };

    if (params.sector) {
      // Map common sectors to Apollo industry keywords
      const industryMapping: Record<string, string[]> = {
        "Tech/SaaS": ["Software", "Computer Software", "Information Technology", "SaaS"],
        "E-commerce": ["E-commerce", "Retail", "Internet"],
        "Finance": ["Financial Services", "Banking", "Fintech"],
        "Marketing": ["Marketing", "Advertising", "Digital Marketing"],
        "Conseil": ["Management Consulting", "Business Consulting"],
        "Santé": ["Healthcare", "Medical Devices", "Biotechnology"],
        "Education": ["Education", "E-learning", "EdTech"]
      };

      const industries = industryMapping[params.sector] || [params.sector];
      apolloParams.organization_industry_tag_ids = industries;
    }

    if (params.jobTitles && params.jobTitles.length > 0) {
      apolloParams.person_titles = params.jobTitles;
    } else {
      // Default to decision maker titles
      apolloParams.person_titles = [
        "CEO", "CTO", "CMO", "COO", "Founder", "Co-founder",
        "Director", "VP", "Head of", "Manager"
      ];
    }

    if (params.companySize) {
      const sizeMapping: Record<string, string[]> = {
        "startup": ["1-10", "11-50"],
        "small": ["11-50", "51-200"],
        "medium": ["201-500", "501-1000"],
        "large": ["1001-5000", "5001+"]
      };
      apolloParams.organization_num_employees_ranges = sizeMapping[params.companySize] || ["11-200"];
    }

    return apolloParams;
  }

  private transformApolloResponse(data: any): GeneratedLead[] {
    if (!data.people || !Array.isArray(data.people)) {
      return [];
    }

    return data.people.map((person: any) => {
      const organization = person.organization || {};
      
      return {
        firstName: person.first_name || "",
        lastName: person.last_name || "",
        email: person.email || "",
        company: organization.name || "",
        sector: this.mapApolloIndustryToSector(organization.industry),
        position: person.title || "",
        linkedinUrl: person.linkedin_url || "",
        companyWebsite: organization.website_url || "",
        employeeCount: organization.estimated_num_employees || 0,
        location: person.city && person.state ? `${person.city}, ${person.state}` : person.country || ""
      };
    });
  }

  private transformEnrichmentResponse(data: any): EnrichedLeadData {
    const person = data.person || {};
    const organization = person.organization || {};

    return {
      company: {
        industry: organization.industry || "",
        size: this.mapEmployeeCountToSize(organization.estimated_num_employees),
        revenue: organization.estimated_annual_revenue || "",
        founded: organization.founded_year || 0,
        technologies: organization.technologies || []
      },
      person: {
        seniority: this.mapTitleToSeniority(person.title),
        department: this.mapTitleToDepartment(person.title),
        phoneNumber: person.phone_numbers?.[0]?.sanitized_number || ""
      },
      socialProfiles: {
        linkedin: person.linkedin_url || "",
        twitter: person.twitter_url || ""
      }
    };
  }

  private mapApolloIndustryToSector(industry: string): string {
    if (!industry) return "Non spécifié";
    
    const mapping: Record<string, string> = {
      "Computer Software": "Tech/SaaS",
      "Software": "Tech/SaaS",
      "Information Technology": "Tech/SaaS",
      "SaaS": "Tech/SaaS",
      "Internet": "E-commerce",
      "E-commerce": "E-commerce",
      "Retail": "E-commerce",
      "Financial Services": "Finance",
      "Banking": "Finance",
      "Fintech": "Finance",
      "Marketing": "Marketing",
      "Advertising": "Marketing",
      "Digital Marketing": "Marketing",
      "Management Consulting": "Conseil",
      "Business Consulting": "Conseil",
      "Healthcare": "Santé",
      "Medical Devices": "Santé",
      "Biotechnology": "Santé",
      "Education": "Education",
      "E-learning": "Education",
      "EdTech": "Education"
    };

    return mapping[industry] || industry;
  }

  private mapEmployeeCountToSize(count: number): string {
    if (count <= 10) return "1-10";
    if (count <= 50) return "11-50";
    if (count <= 200) return "51-200";
    if (count <= 500) return "201-500";
    return "500+";
  }

  private mapTitleToSeniority(title: string): string {
    if (!title) return "Mid";
    
    const titleLower = title.toLowerCase();
    if (titleLower.includes("ceo") || titleLower.includes("founder") || titleLower.includes("president")) {
      return "Executive";
    }
    if (titleLower.includes("cto") || titleLower.includes("cmo") || titleLower.includes("coo") || titleLower.includes("vp")) {
      return "Executive";
    }
    if (titleLower.includes("director") || titleLower.includes("head")) {
      return "Senior";
    }
    if (titleLower.includes("manager") || titleLower.includes("lead")) {
      return "Mid";
    }
    if (titleLower.includes("junior") || titleLower.includes("associate") || titleLower.includes("coordinator")) {
      return "Junior";
    }
    
    return "Mid";
  }

  private mapTitleToDepartment(title: string): string {
    if (!title) return "Operations";
    
    const titleLower = title.toLowerCase();
    if (titleLower.includes("sales") || titleLower.includes("business development") || titleLower.includes("revenue")) {
      return "Sales";
    }
    if (titleLower.includes("marketing") || titleLower.includes("growth") || titleLower.includes("content")) {
      return "Marketing";
    }
    if (titleLower.includes("tech") || titleLower.includes("engineer") || titleLower.includes("developer") || titleLower.includes("cto")) {
      return "Technology";
    }
    if (titleLower.includes("finance") || titleLower.includes("accounting") || titleLower.includes("cfo")) {
      return "Finance";
    }
    if (titleLower.includes("hr") || titleLower.includes("people") || titleLower.includes("talent")) {
      return "HR";
    }
    if (titleLower.includes("operations") || titleLower.includes("ops") || titleLower.includes("coo")) {
      return "Operations";
    }
    
    return "Operations";
  }
}