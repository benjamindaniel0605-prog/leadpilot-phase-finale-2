import type { Lead, InsertLead } from "@shared/schema";

export interface CSVExportOptions {
  leads: Lead[];
  includeScoring?: boolean;
  includeNotes?: boolean;
}

export interface CSVImportResult {
  successful: InsertLead[];
  errors: { row: number; error: string; data: any }[];
  total: number;
}

export class CSVService {
  static exportLeadsToCSV(options: CSVExportOptions): string {
    const { leads, includeScoring = true, includeNotes = true } = options;
    
    if (leads.length === 0) {
      return "Aucun lead à exporter";
    }

    // Define CSV headers
    const headers = [
      "Prénom",
      "Nom", 
      "Email",
      "Entreprise",
      "Secteur",
      "Poste",
      "Statut",
      "Source"
    ];

    if (includeScoring) {
      headers.push("Score IA");
    }

    if (includeNotes) {
      headers.push("Notes");
    }

    headers.push("Date de création");

    // Convert leads to CSV rows
    const rows = leads.map(lead => {
      const row = [
        this.escapeCSVField(lead.firstName || ""),
        this.escapeCSVField(lead.lastName || ""),
        this.escapeCSVField(lead.email || ""),
        this.escapeCSVField(lead.company || ""),
        this.escapeCSVField(lead.sector || ""),
        this.escapeCSVField(lead.position || ""),
        this.escapeCSVField(lead.status || ""),
        this.escapeCSVField(lead.source || "")
      ];

      if (includeScoring) {
        row.push(lead.aiScore?.toString() || "");
      }

      if (includeNotes) {
        row.push(this.escapeCSVField(lead.notes || ""));
      }

      row.push(lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('fr-FR') : "");

      return row.join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }

  static parseCSVToLeads(csvContent: string, userId: string): CSVImportResult {
    const result: CSVImportResult = {
      successful: [],
      errors: [],
      total: 0
    };

    try {
      const lines = csvContent.trim().split('\n');
      
      if (lines.length < 2) {
        result.errors.push({
          row: 0,
          error: "Le fichier CSV doit contenir au moins une ligne d'en-têtes et une ligne de données",
          data: null
        });
        return result;
      }

      const headers = this.parseCSVLine(lines[0]);
      const dataLines = lines.slice(1);
      result.total = dataLines.length;

      // Map headers to required fields
      const fieldMapping = this.createFieldMapping(headers);

      if (!fieldMapping.email || !fieldMapping.firstName || !fieldMapping.lastName) {
        result.errors.push({
          row: 0,
          error: "Les colonnes 'Email', 'Prénom' et 'Nom' sont obligatoires",
          data: headers
        });
        return result;
      }

      dataLines.forEach((line, index) => {
        const rowNumber = index + 2; // +2 because we skip header and arrays are 0-indexed
        
        try {
          const fields = this.parseCSVLine(line);
          
          if (fields.length === 0) {
            return; // Skip empty lines
          }

          const lead = this.createLeadFromCSVFields(fields, fieldMapping, userId);
          
          // Validate required fields
          if (!lead.email || !lead.firstName || !lead.lastName) {
            result.errors.push({
              row: rowNumber,
              error: "Email, Prénom et Nom sont obligatoires",
              data: fields
            });
            return;
          }

          // Validate email format
          if (!this.isValidEmail(lead.email)) {
            result.errors.push({
              row: rowNumber,
              error: "Format d'email invalide",
              data: fields
            });
            return;
          }

          result.successful.push(lead);
        } catch (error) {
          result.errors.push({
            row: rowNumber,
            error: `Erreur de parsing: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
            data: line
          });
        }
      });

    } catch (error) {
      result.errors.push({
        row: 0,
        error: `Erreur générale: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        data: null
      });
    }

    return result;
  }

  private static parseCSVLine(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        fields.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // Add the last field
    fields.push(current.trim());

    return fields;
  }

  private static escapeCSVField(field: string): string {
    if (!field) return '';
    
    // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    
    return field;
  }

  private static createFieldMapping(headers: string[]): Record<string, number> {
    const mapping: Record<string, number> = {};
    
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim();
      
      // Map various possible header names to our fields
      if (normalizedHeader.includes('email') || normalizedHeader.includes('e-mail')) {
        mapping.email = index;
      } else if (normalizedHeader.includes('prénom') || normalizedHeader.includes('prenom') || normalizedHeader.includes('firstname') || normalizedHeader.includes('first name')) {
        mapping.firstName = index;
      } else if (normalizedHeader.includes('nom') || normalizedHeader.includes('lastname') || normalizedHeader.includes('last name')) {
        mapping.lastName = index;
      } else if (normalizedHeader.includes('entreprise') || normalizedHeader.includes('company') || normalizedHeader.includes('société')) {
        mapping.company = index;
      } else if (normalizedHeader.includes('secteur') || normalizedHeader.includes('sector') || normalizedHeader.includes('industrie')) {
        mapping.sector = index;
      } else if (normalizedHeader.includes('poste') || normalizedHeader.includes('position') || normalizedHeader.includes('titre')) {
        mapping.position = index;
      } else if (normalizedHeader.includes('statut') || normalizedHeader.includes('status')) {
        mapping.status = index;
      } else if (normalizedHeader.includes('source')) {
        mapping.source = index;
      } else if (normalizedHeader.includes('score') || normalizedHeader.includes('ia')) {
        mapping.aiScore = index;
      } else if (normalizedHeader.includes('note') || normalizedHeader.includes('comment')) {
        mapping.notes = index;
      }
    });

    return mapping;
  }

  private static createLeadFromCSVFields(
    fields: string[], 
    mapping: Record<string, number>, 
    userId: string
  ): InsertLead {
    const lead: InsertLead = {
      userId,
      firstName: this.getFieldValue(fields, mapping.firstName) || '',
      lastName: this.getFieldValue(fields, mapping.lastName) || '',
      email: this.getFieldValue(fields, mapping.email) || '',
      company: this.getFieldValue(fields, mapping.company) || '',
      sector: this.getFieldValue(fields, mapping.sector) || 'Non spécifié',
      position: this.getFieldValue(fields, mapping.position) || 'Non spécifié',
      status: this.validateStatus(this.getFieldValue(fields, mapping.status)) || 'new',
      source: this.validateSource(this.getFieldValue(fields, mapping.source)) || 'csv_import',
      notes: this.getFieldValue(fields, mapping.notes) || null
    };

    // Parse AI score if provided
    const scoreValue = this.getFieldValue(fields, mapping.aiScore);
    if (scoreValue) {
      const score = parseInt(scoreValue, 10);
      if (!isNaN(score) && score >= 0 && score <= 100) {
        lead.aiScore = score;
      }
    }

    return lead;
  }

  private static getFieldValue(fields: string[], index: number | undefined): string {
    if (index === undefined || index >= fields.length) {
      return '';
    }
    return fields[index]?.trim() || '';
  }

  private static validateStatus(status: string): string | null {
    const validStatuses = ['new', 'contacted', 'qualified', 'unqualified', 'converted'];
    const normalizedStatus = status?.toLowerCase().trim();
    
    if (validStatuses.includes(normalizedStatus)) {
      return normalizedStatus;
    }
    
    // Try to map common variations
    if (normalizedStatus.includes('nouveau') || normalizedStatus.includes('new')) return 'new';
    if (normalizedStatus.includes('contacté') || normalizedStatus.includes('contacted')) return 'contacted';
    if (normalizedStatus.includes('qualifié') || normalizedStatus.includes('qualified')) return 'qualified';
    if (normalizedStatus.includes('non qualifié') || normalizedStatus.includes('unqualified')) return 'unqualified';
    if (normalizedStatus.includes('converti') || normalizedStatus.includes('converted')) return 'converted';
    
    return null;
  }

  private static validateSource(source: string): string | null {
    const validSources = ['manual', 'external', 'csv_import', 'api', 'referral'];
    const normalizedSource = source?.toLowerCase().trim();
    
    if (validSources.includes(normalizedSource)) {
      return normalizedSource;
    }
    
    // Try to map common variations
    if (normalizedSource.includes('manuel') || normalizedSource.includes('manual')) return 'manual';
    if (normalizedSource.includes('externe') || normalizedSource.includes('external')) return 'external';
    if (normalizedSource.includes('csv') || normalizedSource.includes('import')) return 'csv_import';
    if (normalizedSource.includes('api')) return 'api';
    if (normalizedSource.includes('référ') || normalizedSource.includes('referral')) return 'referral';
    
    return null;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static generateSampleCSV(): string {
    const headers = [
      "Prénom",
      "Nom",
      "Email", 
      "Entreprise",
      "Secteur",
      "Poste",
      "Statut",
      "Source",
      "Score IA",
      "Notes"
    ];

    const sampleData = [
      ["Marie", "Dubois", "marie.dubois@techstart.fr", "TechStart", "Tech/SaaS", "CEO", "new", "external", "85", "Startup prometteuse"],
      ["Pierre", "Martin", "p.martin@ecom-plus.com", "Ecom Plus", "E-commerce", "Directeur Marketing", "contacted", "api", "72", "Intéressé par notre solution"],
      ["Sophie", "Leroy", "sophie.leroy@consulting.fr", "Consulting Pro", "Services", "Associée", "qualified", "referral", "91", "Budget confirmé pour Q2"]
    ];

    const csvContent = [
      headers.join(","),
      ...sampleData.map(row => row.map(field => this.escapeCSVField(field)).join(","))
    ].join("\n");

    return csvContent;
  }
}