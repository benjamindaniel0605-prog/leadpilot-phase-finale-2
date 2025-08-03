import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Campaign, Template } from "@shared/schema";

export default function CampaignsSection() {
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    templateId: "",
    status: "draft"
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
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
      setCampaignForm({ name: "", templateId: "", status: "draft" });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la campagne.",
        variant: "destructive",
      });
    },
  });

  const handleCreateCampaign = () => {
    if (!campaignForm.name || !campaignForm.templateId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    createCampaignMutation.mutate(campaignForm);
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
                Template email
              </label>
              <Select 
                value={campaignForm.templateId} 
                onValueChange={(value) => setCampaignForm({ ...campaignForm, templateId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template: Template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leads cibles
              </label>
              <Select defaultValue="qualified">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les leads</SelectItem>
                  <SelectItem value="qualified">Leads qualifiés seulement</SelectItem>
                  <SelectItem value="high-score">Score {'>'}  80%</SelectItem>
                </SelectContent>
              </Select>
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
                        Template: {templates.find((t: Template) => t.id === campaign.templateId)?.name || "Template inconnu"}
                      </p>
                    </div>
                    {getStatusBadge(campaign.status)}
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
                    <span>Créée le {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}</span>
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
