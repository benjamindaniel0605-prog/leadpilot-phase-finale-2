import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Upload, Plus, Search, Mail, Edit, Trash2, Download, Settings2, Target } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Lead } from "@shared/schema";
import { AdminSeedButton } from "@/components/admin-seed-button";

export default function LeadsSection() {
  const [filters, setFilters] = useState({
    sector: "all",
    score: "all",
    status: "all"
  });

  const [showGenerationForm, setShowGenerationForm] = useState(true); // Show form by default for better UX
  const [generationCriteria, setGenerationCriteria] = useState({
    sector: "",
    location: "France",
    companySize: "",
    jobTitles: "",
    count: 10
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: analytics } = useQuery<{
    leadsGenerated: number;
    emailsSent: string;
    campaignsActive: number;
    remainingLeads: number;
  }>({
    queryKey: ["/api/analytics/stats"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (leadId: string) => {
      await apiRequest("DELETE", `/api/leads/${leadId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead supprimé",
        description: "Le lead a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le lead.",
        variant: "destructive",
      });
    },
  });

  // Lead generation mutation
  const generateLeadsMutation = useMutation({
    mutationFn: async (params: any) => {
      return await apiRequest("POST", "/api/leads/generate", params);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      toast({
        title: "Leads générés !",
        description: `${data.message}`,
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de générer les leads.",
        variant: "destructive",
      });
    },
  });

  // CSV Import mutation
  const importCSVMutation = useMutation({
    mutationFn: async (csvContent: string) => {
      return await apiRequest("POST", "/api/leads/import-csv", { csvContent });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      toast({
        title: "Import réussi !",
        description: `${data.message}`,
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'importer le fichier CSV.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleGenerateLeads = () => {
    if (!generationCriteria.sector) {
      toast({
        title: "Secteur requis",
        description: "Veuillez sélectionner un secteur d'activité.",
        variant: "destructive",
      });
      return;
    }

    const params = {
      sector: generationCriteria.sector,
      location: generationCriteria.location,
      companySize: generationCriteria.companySize || undefined,
      jobTitles: generationCriteria.jobTitles ? generationCriteria.jobTitles.split(',').map(t => t.trim()) : undefined,
      limit: generationCriteria.count
    };
    
    generateLeadsMutation.mutate(params);
    setShowGenerationForm(false);
  };

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const csvContent = e.target?.result as string;
          importCSVMutation.mutate(csvContent);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/leads/export-csv', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads-export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export réussi !",
        description: "Le fichier CSV a été téléchargé.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les leads.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: "Nouveau", variant: "secondary" as const },
      contacted: { label: "Contacté", variant: "default" as const },
      qualified: { label: "Qualifié", variant: "default" as const },
      converted: { label: "Converti", variant: "default" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const filteredLeads = leads.filter((lead: Lead) => {
    if (filters.sector !== "all" && lead.sector !== filters.sector) return false;
    if (filters.status !== "all" && lead.status !== filters.status) return false;
    if (filters.score !== "all") {
      const score = lead.aiScore || 0;
      if (filters.score === "high" && score < 80) return false;
      if (filters.score === "medium" && (score < 60 || score >= 80)) return false;
      if (filters.score === "low" && score >= 60) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const remainingLeads = analytics?.remainingLeads || 0;
  const maxLeads = Math.min(remainingLeads, 50); // Limite max par génération

  return (
    <div className="p-6 space-y-6">
      {/* Header with Lead Generation Form */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Leads</h3>
            <p className="text-muted-foreground">
              Gérez vos prospects et leur scoring IA • {remainingLeads} leads restants
            </p>
          </div>
          <div className="flex space-x-2">
            <AdminSeedButton />
            <Button variant="outline" onClick={handleImportCSV} disabled={importCSVMutation.isPending}>
              <Upload className="h-4 w-4 mr-2" />
              {importCSVMutation.isPending ? "Import..." : "Importer"}
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Lead Generation Section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Génération de Leads</CardTitle>
              </div>
              <Button 
                onClick={() => setShowGenerationForm(!showGenerationForm)}
                disabled={remainingLeads === 0}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showGenerationForm ? "Masquer" : "Générer des Leads"}
              </Button>
            </div>
          </CardHeader>
          
          {showGenerationForm && (
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="sector" className="text-sm font-medium">Secteur d'activité *</Label>
                  <Select value={generationCriteria.sector} onValueChange={(value) => 
                    setGenerationCriteria(prev => ({ ...prev, sector: value }))
                  }>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Sélectionner un secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tech/SaaS">Tech / SaaS</SelectItem>
                      <SelectItem value="E-commerce">E-commerce</SelectItem>
                      <SelectItem value="Finance">Finance / Fintech</SelectItem>
                      <SelectItem value="Marketing">Marketing / Publicité</SelectItem>
                      <SelectItem value="Conseil">Conseil / Services</SelectItem>
                      <SelectItem value="Santé">Santé / Médical</SelectItem>
                      <SelectItem value="Education">Éducation / Formation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="location" className="text-sm font-medium">Localisation</Label>
                  <Input
                    className="h-10"
                    value={generationCriteria.location}
                    onChange={(e) => setGenerationCriteria(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="France, Paris, Lyon..."
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="companySize" className="text-sm font-medium">Taille d'entreprise</Label>
                  <Select value={generationCriteria.companySize} onValueChange={(value) => 
                    setGenerationCriteria(prev => ({ ...prev, companySize: value }))
                  }>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Toutes tailles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes tailles</SelectItem>
                      <SelectItem value="startup">Startup (1-50)</SelectItem>
                      <SelectItem value="small">PME (51-200)</SelectItem>
                      <SelectItem value="medium">Moyenne (201-500)</SelectItem>
                      <SelectItem value="large">Grande (500+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="count" className="text-sm font-medium">Nombre de leads</Label>
                  <Select value={generationCriteria.count.toString()} onValueChange={(value) => 
                    setGenerationCriteria(prev => ({ ...prev, count: parseInt(value) }))
                  }>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: Math.min(maxLeads, 10) }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1} lead{i > 0 ? 's' : ''}
                        </SelectItem>
                      ))}
                      {maxLeads > 10 && (
                        <>
                          <SelectItem value="15">15 leads</SelectItem>
                          <SelectItem value="20">20 leads</SelectItem>
                          {maxLeads >= 25 && <SelectItem value="25">25 leads</SelectItem>}
                          {maxLeads >= 50 && <SelectItem value="50">50 leads</SelectItem>}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-3">
                  <Label htmlFor="jobTitles" className="text-sm font-medium">Postes ciblés (optionnel)</Label>
                  <Input
                    className="h-10"
                    value={generationCriteria.jobTitles}
                    onChange={(e) => setGenerationCriteria(prev => ({ ...prev, jobTitles: e.target.value }))}
                    placeholder="CEO, Directeur Marketing, CTO... (séparés par des virgules)"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowGenerationForm(false)}>
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleGenerateLeads} 
                    disabled={generateLeadsMutation.isPending || remainingLeads === 0}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {generateLeadsMutation.isPending ? "Génération..." : `Générer ${generationCriteria.count} leads`}
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Tous les Leads ({leads.length})</h3>
          </div>
          <div className="flex space-x-2">{/* Filter components will be here */}</div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-3">Secteur</label>
              <Select value={filters.sector} onValueChange={(value) => setFilters({ ...filters, sector: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les secteurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les secteurs</SelectItem>
                  <SelectItem value="Tech/SaaS">Tech/SaaS</SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-3">Score IA</label>
              <Select value={filters.score} onValueChange={(value) => setFilters({ ...filters, score: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les scores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les scores</SelectItem>
                  <SelectItem value="high">Élevé (80-100)</SelectItem>
                  <SelectItem value="medium">Moyen (60-79)</SelectItem>
                  <SelectItem value="low">Faible (0-59)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-3">Statut</label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="new">Nouveau</SelectItem>
                  <SelectItem value="contacted">Contacté</SelectItem>
                  <SelectItem value="qualified">Qualifié</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Liste des Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Aucun lead trouvé.</p>
              <Button className="mt-4" onClick={() => setShowGenerationForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer votre premier lead
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Entreprise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Score IA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredLeads.map((lead: Lead) => (
                    <tr key={lead.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(lead.firstName, lead.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-card-foreground">
                              {lead.firstName} {lead.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">{lead.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-card-foreground">{lead.company}</div>
                        <div className="text-sm text-muted-foreground">{lead.sector}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-muted rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 rounded-full ${getScoreColor(lead.aiScore || 0)}`} 
                              style={{ width: `${lead.aiScore || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-card-foreground">{lead.aiScore || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteMutation.mutate(lead.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
