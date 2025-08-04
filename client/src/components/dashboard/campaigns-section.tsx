import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Campaign, Template, CustomEmail, Lead } from "@shared/schema";

export default function CampaignsSection() {
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    emailId: "",
    selectedLeads: [] as string[],
    status: "draft"
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const { data: customEmails = [] } = useQuery<CustomEmail[]>({
    queryKey: ["/api/custom-emails"],
  });

  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: typeof campaignForm) => {
      const response = await apiRequest("POST", "/api/campaigns", campaignData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campagne créée",
        description: "Votre campagne a été créée avec succès.",
      });
      setCampaignForm({ name: "", emailId: "", selectedLeads: [], status: "draft" });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la campagne.",
        variant: "destructive",
      });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await apiRequest("DELETE", `/api/campaigns/${campaignId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campagne supprimée",
        description: "La campagne a été supprimée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la campagne.",
        variant: "destructive",
      });
    },
  });

  const handleCreateCampaign = () => {
    if (!campaignForm.name || !campaignForm.emailId || campaignForm.selectedLeads.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs et sélectionner au moins un lead.",
        variant: "destructive",
      });
      return;
    }

    const { selectedLeads, ...formData } = campaignForm;
    createCampaignMutation.mutate({
      ...formData,
      leadTargets: selectedLeads.join(',')
    });
  };

  const handleLeadSelection = (leadId: string, checked: boolean) => {
    if (checked) {
      setCampaignForm(prev => ({
        ...prev,
        selectedLeads: [...prev.selectedLeads, leadId]
      }));
    } else {
      setCampaignForm(prev => ({
        ...prev,
        selectedLeads: prev.selectedLeads.filter(id => id !== leadId)
      }));
    }
  };

  const handleSelectAllLeads = () => {
    setCampaignForm(prev => ({
      ...prev,
      selectedLeads: leads.map(lead => lead.id)
    }));
  };

  const handleSelectHighScoreLeads = () => {
    const highScoreLeads = leads.filter(lead => (lead.aiScore || 0) > 80);
    setCampaignForm(prev => ({
      ...prev,
      selectedLeads: highScoreLeads.map(lead => lead.id)
    }));
  };

  const handleDeselectAll = () => {
    setCampaignForm(prev => ({
      ...prev,
      selectedLeads: []
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Brouillon", variant: "secondary" as const },
      sent: { label: "Envoyée", variant: "default" as const },
      scheduled: { label: "Programmée", variant: "outline" as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (campaignsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campagnes Email</h2>
          <p className="text-gray-600">Créez et gérez vos campagnes d'emailing</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Campagne
        </Button>
      </div>

      {/* Campaign Creation Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Créer une Campagne</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la campagne
              </label>
              <Input
                type="text"
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                placeholder="Ex: Prospection Q1 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Select 
                value={campaignForm.emailId} 
                onValueChange={(value) => setCampaignForm({ ...campaignForm, emailId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un email" />
                </SelectTrigger>
                <SelectContent>
                  {customEmails.map((email: CustomEmail) => (
                    <SelectItem key={email.id} value={email.id}>
                      {email.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sélection des leads cibles
              </label>
              
              {/* Actions rapides */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleSelectAllLeads}
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  ✓ Tous les leads ({leads.length})
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleSelectHighScoreLeads}
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  ⭐ Score {'>'} 80% ({leads.filter(lead => (lead.aiScore || 0) > 80).length})
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleDeselectAll}
                  className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                >
                  ✗ Désélectionner tout
                </Button>
                <div className="ml-auto bg-blue-100 px-3 py-1 rounded-full text-sm font-medium text-blue-800">
                  {campaignForm.selectedLeads.length} sélectionnés
                </div>
              </div>

              {/* Liste des leads avec cases à cocher */}
              <div className="border rounded-lg bg-white">
                <div className="p-3 bg-gray-50 border-b font-medium text-sm text-gray-700">
                  Vos leads disponibles
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {leads.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <p>Aucun lead disponible</p>
                      <p className="text-xs mt-1">Ajoutez des leads dans l'onglet "Leads" pour créer une campagne</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {leads.map((lead: Lead) => (
                        <div key={lead.id} className="p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={`lead-${lead.id}`}
                              checked={campaignForm.selectedLeads.includes(lead.id)}
                              onCheckedChange={(checked) => handleLeadSelection(lead.id, checked as boolean)}
                              className="flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900 text-sm">
                                    {lead.firstName} {lead.lastName}
                                  </h4>
                                  <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                                    <span className="font-medium">{lead.company}</span>
                                    {lead.position && (
                                      <>
                                        <span>•</span>
                                        <span>{lead.position}</span>
                                      </>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {lead.email}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {lead.aiScore && (
                                    <Badge 
                                      variant={lead.aiScore > 80 ? "default" : lead.aiScore > 60 ? "secondary" : "outline"}
                                      className="text-xs"
                                    >
                                      {Math.round(lead.aiScore)}%
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {lead.status || 'nouveau'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programmation
              </label>
              <Select defaultValue="now">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">Envoyer maintenant</SelectItem>
                  <SelectItem value="later">Programmer plus tard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleCreateCampaign}
              disabled={createCampaignMutation.isPending}
            >
              {createCampaignMutation.isPending ? "Création..." : "Créer Campagne"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>Campagnes Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Aucune campagne créée pour le moment.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer votre première campagne
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign: Campaign) => (
                <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{campaign.name}</h4>
                      <p className="text-sm text-gray-600">
                        Email: {customEmails.find((e: CustomEmail) => e.id === campaign.emailId)?.name || "Email inconnu"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(campaign.status)}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer la campagne</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer la campagne "{campaign.name}" ? 
                              Cette action est irréversible et supprimera toutes les données associées.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{campaign.totalSent}</div>
                      <div className="text-sm text-gray-600">Envoyés</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">{campaign.totalOpened}</div>
                      <div className="text-sm text-gray-600">Ouverts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{campaign.totalClicked}</div>
                      <div className="text-sm text-gray-600">Clics</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{campaign.totalReplied}</div>
                      <div className="text-sm text-gray-600">Réponses</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Créée le {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}</span>
                    <div className="space-x-3">
                      <Button variant="ghost" size="sm">Voir détails</Button>
                      <Button variant="ghost" size="sm">Dupliquer</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
