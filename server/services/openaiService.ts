import type { GeneratedLead, EnrichedLeadData } from "./leadService";

export class OpenAILeadScoringService {
  private apiKey: string;
  private baseUrl = "https://api.openai.com/v1";

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is required");
    }
  }

  async calculateAdvancedLeadScore(
    lead: GeneratedLead, 
    enrichedData?: EnrichedLeadData
  ): Promise<{ score: number; reasoning: string; priorities: string[] }> {
    try {
      const prompt = this.buildScoringPrompt(lead, enrichedData);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Tu es un expert en qualification de prospects B2B pour des solutions SaaS. Analyse chaque lead et fournis un score de 0 à 100 avec un raisonnement détaillé."
            },
            {
              role: "user", 
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || "";
      
      return this.parseAIResponse(content);
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      // Fallback to basic scoring
      const basicScore = this.calculateBasicScore(lead, enrichedData);
      return {
        score: basicScore,
        reasoning: `Score basique calculé (IA indisponible) - Position: ${lead.position}, Entreprise: ${lead.company}`,
        priorities: ["Vérifier le potentiel manuellement", "Analyser le secteur d'activité", "Contacter directement"]
      };
    }
  }

  async generateEmailVariations(
    templateContent: string,
    leadContext: { firstName: string; lastName: string; company: string; position: string; sector: string },
    count: number = 3
  ): Promise<string[]> {
    try {
      const prompt = `Génère ${count} variations de cet email de prospection en français :

Template original :
${templateContent}

Contexte du prospect :
- Nom: ${leadContext.firstName} ${leadContext.lastName}
- Entreprise: ${leadContext.company}
- Poste: ${leadContext.position}
- Secteur: ${leadContext.sector}

Consignes :
1. Garde la structure et les variables [PRENOM], [ENTREPRISE], etc.
2. Varie le ton (professionnel, décontracté, direct)
3. Change l'accroche et l'argumentation
4. Reste pertinent pour le secteur d'activité
5. Chaque variation doit être unique et engageante

Réponds avec les 3 variations séparées par "---"`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Tu es un expert en rédaction d'emails de prospection B2B en français. Crée des variations naturelles et engageantes."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || "";
      
      return content.split('---').map((variation: string) => variation.trim()).filter((v: string) => v.length > 50);
    } catch (error) {
      console.error("Error generating email variations:", error);
      return [];
    }
  }

  private buildScoringPrompt(lead: GeneratedLead, enrichedData?: EnrichedLeadData): string {
    return `Analyse ce prospect B2B et donne un score de qualification de 0 à 100 :

PROSPECT :
- Nom: ${lead.firstName} ${lead.lastName}
- Email: ${lead.email}
- Entreprise: ${lead.company}
- Poste: ${lead.position}
- Secteur: ${lead.sector}
- Nombre d'employés: ${lead.employeeCount || 'Inconnu'}
- Localisation: ${lead.location || 'Inconnue'}

${enrichedData ? `
DONNÉES ENRICHIES :
- Industrie: ${enrichedData.company?.industry || 'Inconnue'}
- Taille: ${enrichedData.company?.size || 'Inconnue'}
- Revenus: ${enrichedData.company?.revenue || 'Inconnus'}
- Fondée: ${enrichedData.company?.founded || 'Inconnu'}
- Ancienneté: ${enrichedData.person?.seniority || 'Inconnue'}
- Département: ${enrichedData.person?.department || 'Inconnu'}
` : ''}

CRITÈRES DE QUALIFICATION :
- Pouvoir de décision (poste, ancienneté)
- Taille et maturité de l'entreprise  
- Secteur d'activité (pertinence pour SaaS B2B)
- Potentiel budgétaire
- Facilité de contact

FORMAT DE RÉPONSE :
Score: [0-100]
Raisonnement: [2-3 phrases expliquant le score]
Priorités: [3 actions concrètes pour ce prospect]`;
  }

  private parseAIResponse(content: string): { score: number; reasoning: string; priorities: string[] } {
    const lines = content.split('\n').filter(line => line.trim());
    
    let score = 50;
    let reasoning = "Analyse basique";
    let priorities: string[] = [];

    for (const line of lines) {
      if (line.toLowerCase().includes('score:')) {
        const scoreMatch = line.match(/\d+/);
        if (scoreMatch) {
          score = Math.min(100, Math.max(0, parseInt(scoreMatch[0])));
        }
      } else if (line.toLowerCase().includes('raisonnement:')) {
        reasoning = line.replace(/^[^:]*:/, '').trim();
      } else if (line.toLowerCase().includes('priorités:') || line.toLowerCase().includes('priorities:')) {
        const priorityText = line.replace(/^[^:]*:/, '').trim();
        priorities = priorityText.split(/[,;]/).map(p => p.trim()).filter(p => p.length > 0);
      } else if (line.startsWith('-') || line.match(/^\d+\./)) {
        priorities.push(line.replace(/^[-\d\.\s]*/, '').trim());
      }
    }

    // If no priorities found, extract from reasoning
    if (priorities.length === 0) {
      priorities = ["Analyser le potentiel", "Préparer l'approche", "Planifier le suivi"];
    }

    return { score, reasoning, priorities: priorities.slice(0, 3) };
  }

  private calculateBasicScore(lead: GeneratedLead, enrichedData?: EnrichedLeadData): number {
    let score = 50; // Base score

    // Position scoring
    const seniorPositions = ["CEO", "CTO", "CMO", "Directeur", "VP", "Head", "Chief", "Founder"];
    if (seniorPositions.some(pos => lead.position.toLowerCase().includes(pos.toLowerCase()))) {
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
      if (enrichedData.company.revenue?.includes("M€") || enrichedData.company.revenue?.includes("M$")) score += 15;
    }

    if (enrichedData?.person?.seniority === "Executive") {
      score += 15;
    }

    // Add some variation
    score += Math.floor(Math.random() * 10) - 5;

    return Math.max(0, Math.min(100, score));
  }
}