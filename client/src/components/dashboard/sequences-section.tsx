import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, CheckCircle, Crown, Plus, Play, Pause, Edit, Trash2, Clock, Mail, Users, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SequenceStep {
  id?: string;
  stepNumber: number;
  name: string;
  emailId?: string;
  delayDays: number;
  delayHours: number;
  isActive: boolean;
}

interface SequenceConfig {
  selectedLeads: string[];
}

export default function SequencesSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSequence, setNewSequence] = useState({
    name: "",
    description: ""
  });
  const [selectedSequence, setSelectedSequence] = useState<string | null>(null);
  const [isEditingSteps, setIsEditingSteps] = useState(false);
  const [sequenceSteps, setSequenceSteps] = useState<SequenceStep[]>([]);
  const [sequenceConfig, setSequenceConfig] = useState<SequenceConfig>({
    selectedLeads: []
  });

  // TEMPORAIRE : Autoriser les séquences pour le plan Free pour les tests
  const canUseSequences = true; // user?.plan === "pro" || user?.plan === "growth";
  const maxSteps = user?.plan === "growth" ? 5 : user?.plan === "pro" ? 3 : user?.plan === "free" ? 2 : 0;

  // Récupération des séquences
  const { data: sequences = [], isLoading } = useQuery({
    queryKey: ["/api/sequences"],
    enabled: canUseSequences,
  });

  // Récupération des emails personnalisés
  const { data: customEmails = [] } = useQuery({
    queryKey: ["/api/custom-emails"],
    enabled: canUseSequences,
  });

  // Récupération des leads
  const { data: leads = [] } = useQuery({
    queryKey: ["/api/leads"],
    enabled: canUseSequences,
  });

  // Création de séquence
  const createSequenceMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      return await apiRequest("POST", "/api/sequences", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sequences"] });
      setIsCreateDialogOpen(false);
      setNewSequence({ name: "", description: "" });
      toast({
        title: "Séquence créée",
        description: "Votre nouvelle séquence a été créée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la séquence",
        variant: "destructive",
      });
    },
  });

  // Suppression de séquence
  const deleteSequenceMutation = useMutation({
    mutationFn: async (sequenceId: string) => {
      return await apiRequest("DELETE", `/api/sequences/${sequenceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sequences"] });
      toast({
        title: "Séquence supprimée",
        description: "La séquence a été supprimée avec succès",
      });
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la séquence",
        variant: "destructive",
      });
    },
  });

  // Toggle statut de séquence
  const toggleSequenceMutation = useMutation({
    mutationFn: async ({ sequenceId, isActive }: { sequenceId: string; isActive: boolean }) => {
      return await apiRequest("PATCH", `/api/sequences/${sequenceId}/toggle`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sequences"] });
      toast({
        title: "Statut modifié",
        description: "Le statut de la séquence a été mis à jour",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    },
  });

  if (!canUseSequences) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Séquences</h2>
            <p className="text-muted-foreground">
              Automatisez vos relances avec des séquences multi-étapes
            </p>
          </div>
        </div>

        <Card className="border-2 border-dashed border-muted">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Fonctionnalité Pro & Growth
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              Les séquences automatisées sont disponibles uniquement avec les plans Pro et Growth.
              Créez des campagnes multi-étapes intelligentes qui s'adaptent aux réactions de vos prospects.
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Crown className="h-4 w-4 mr-2" />
              Passer à Pro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Séquences</h2>
          <p className="text-muted-foreground">
            Automatisez vos relances avec des séquences multi-étapes
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Crown className="h-3 w-3 mr-1" />
            {user?.plan === "growth" ? "Growth" : user?.plan === "pro" ? "Pro" : "Free (Test)"}
          </Badge>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Séquence
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle séquence automatisée</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nom de la séquence</label>
                  <Input
                    value={newSequence.name}
                    onChange={(e) => setNewSequence(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Prospection SaaS B2B"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newSequence.description}
                    onChange={(e) => setNewSequence(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez l'objectif de cette séquence..."
                    rows={3}
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">Comment ça marche ?</h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <div>• Après création, vous pourrez ajouter jusqu'à {maxSteps} étapes</div>
                    <div>• Chaque étape peut avoir un email et un délai d'attente personnalisé</div>
                    <div>• Les emails s'envoient automatiquement si le prospect ne répond pas</div>
                    <div>• La séquence s'arrête automatiquement dès qu'un prospect répond</div>
                    <div>• Vous pourrez sélectionner précisément quels leads cibler</div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => createSequenceMutation.mutate(newSequence)}
                    disabled={!newSequence.name || createSequenceMutation.isPending}
                  >
                    {createSequenceMutation.isPending ? "Création..." : "Créer"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dialog pour éditer les étapes d'une séquence */}
      <Dialog open={isEditingSteps} onOpenChange={setIsEditingSteps}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurer les étapes de votre séquence</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            
            {/* Sélection des leads */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Sélectionner les leads ({sequenceConfig.selectedLeads.length} sélectionné{sequenceConfig.selectedLeads.length !== 1 ? 's' : ''})
              </h4>
              <div className="mb-4">
                <div className="flex space-x-2 mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSequenceConfig(prev => ({
                        ...prev,
                        selectedLeads: leads.map((lead: any) => lead.id)
                      }));
                    }}
                  >
                    Tous les leads
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSequenceConfig(prev => ({
                        ...prev,
                        selectedLeads: leads.filter((lead: any) => lead.score && lead.score > 80).map((lead: any) => lead.id)
                      }));
                    }}
                  >
                    Score &gt; 80%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSequenceConfig(prev => ({
                        ...prev,
                        selectedLeads: []
                      }));
                    }}
                  >
                    Désélectionner tout
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-40 overflow-y-auto border rounded p-3">
                {leads.map((lead: any) => (
                  <label key={lead.id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sequenceConfig.selectedLeads.includes(lead.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSequenceConfig(prev => ({
                            ...prev,
                            selectedLeads: [...prev.selectedLeads, lead.id]
                          }));
                        } else {
                          setSequenceConfig(prev => ({
                            ...prev,
                            selectedLeads: prev.selectedLeads.filter(id => id !== lead.id)
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {lead.company} • {lead.email}
                      </div>
                    </div>
                    {lead.score && (
                      <Badge variant={lead.score >= 80 ? "default" : "secondary"} className="text-xs">
                        {lead.score}%
                      </Badge>
                    )}
                  </label>
                ))}
              </div>
              {leads.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun lead disponible. Générez d'abord des leads dans la section "Leads".
                </p>
              )}
            </div>
            {/* Ajouter des étapes */}
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Étapes de la séquence ({sequenceSteps.length}/{maxSteps})</h4>
                <p className="text-sm text-muted-foreground">
                  Chaque étape enverra un email automatiquement selon le délai configuré
                </p>
              </div>
              <Button
                onClick={() => {
                  if (sequenceSteps.length < maxSteps) {
                    setSequenceSteps(prev => [...prev, {
                      stepNumber: prev.length + 1,
                      name: `Étape ${prev.length + 1}`,
                      delayDays: prev.length === 0 ? 0 : 3,
                      delayHours: 0,
                      isActive: true
                    }]);
                  }
                }}
                disabled={sequenceSteps.length >= maxSteps}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une étape
              </Button>
            </div>

            {/* Liste des étapes configurables */}
            <div className="space-y-4">
              {sequenceSteps.map((step, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {step.stepNumber}
                      </div>
                      <Input
                        value={step.name}
                        onChange={(e) => {
                          setSequenceSteps(prev => prev.map((s, i) => 
                            i === index ? { ...s, name: e.target.value } : s
                          ));
                        }}
                        placeholder="Nom de l'étape"
                        className="max-w-xs"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSequenceSteps(prev => prev.filter((_, i) => i !== index));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Sélection de l'email */}
                    <div>
                      <label className="text-sm font-medium">Email à envoyer</label>
                      <Select 
                        value={step.emailId || ""}
                        onValueChange={(value) => {
                          setSequenceSteps(prev => prev.map((s, i) => 
                            i === index ? { ...s, emailId: value } : s
                          ));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un email" />
                        </SelectTrigger>
                        <SelectContent>
                          {customEmails.length === 0 ? (
                            <SelectItem value="none" disabled>
                              Aucun email personnalisé
                            </SelectItem>
                          ) : (
                            customEmails.map((email: any) => (
                              <SelectItem key={email.id} value={email.id}>
                                {email.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Délai en jours */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Délai {index === 0 ? "(envoi immédiat)" : "(après étape précédente)"}
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="0"
                          value={step.delayDays}
                          onChange={(e) => {
                            setSequenceSteps(prev => prev.map((s, i) => 
                              i === index ? { ...s, delayDays: parseInt(e.target.value) || 0 } : s
                            ));
                          }}
                          disabled={index === 0}
                          className="w-16"
                        />
                        <span className="text-xs text-muted-foreground min-w-[28px]">jours</span>
                        <Input
                          type="number"
                          min="0"
                          max="23"
                          value={step.delayHours}
                          onChange={(e) => {
                            setSequenceSteps(prev => prev.map((s, i) => 
                              i === index ? { ...s, delayHours: parseInt(e.target.value) || 0 } : s
                            ));
                          }}
                          disabled={index === 0}
                          className="w-16"
                        />
                        <span className="text-xs text-muted-foreground">heures</span>
                      </div>
                    </div>

                    {/* Statut */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Statut</label>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSequenceSteps(prev => prev.map((s, i) => 
                              i === index ? { ...s, isActive: !s.isActive } : s
                            ));
                          }}
                          className={`${step.isActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                        >
                          {step.isActive ? "Active" : "Inactive"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Aperçu du timing */}
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                    <Clock className="h-4 w-4 inline mr-2" />
                    {index === 0 
                      ? "Envoyé immédiatement à l'inscription dans la séquence"
                      : `Envoyé ${step.delayDays} jour(s) ${step.delayHours > 0 ? `et ${step.delayHours} heure(s)` : ''} après l'étape précédente si pas de réponse`
                    }
                  </div>
                </div>
              ))}
            </div>

            {sequenceSteps.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                <Mail className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Aucune étape configurée</p>
                <p className="text-xs text-gray-400">Cliquez sur "Ajouter une étape" pour commencer</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditingSteps(false)}>
                Annuler
              </Button>
              <Button 
                onClick={async () => {
                  if (selectedSequence && sequenceConfig.selectedLeads.length > 0) {
                    try {
                      await apiRequest("POST", `/api/sequences/${selectedSequence}/steps`, { 
                        steps: sequenceSteps,
                        selectedLeads: sequenceConfig.selectedLeads 
                      });
                      setIsEditingSteps(false);
                      toast({
                        title: "Séquence configurée",
                        description: `${sequenceSteps.length} étape(s) configurée(s) pour ${sequenceConfig.selectedLeads.length} lead(s)`,
                      });
                    } catch (error) {
                      toast({
                        title: "Erreur",
                        description: "Impossible de sauvegarder la configuration",
                        variant: "destructive",
                      });
                    }
                  }
                }}
                disabled={sequenceSteps.length === 0 || sequenceConfig.selectedLeads.length === 0}
              >
                Sauvegarder la séquence
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Liste des séquences existantes */}
      {sequences.length > 0 ? (
        <div className="grid gap-6">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex items-center p-4">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground truncate">Séquences Actives</p>
                  <p className="text-xl font-bold text-foreground">{sequences.filter((s: any) => s.isActive).length}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-4">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground truncate">Leads Inscrits</p>
                  <p className="text-xl font-bold text-foreground">0</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-4">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground truncate">Emails Planifiés</p>
                  <p className="text-xl font-bold text-foreground">0</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-4">
                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground truncate">Taux de Réponse</p>
                  <p className="text-xl font-bold text-foreground">--</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des séquences */}
          <Card>
            <CardHeader>
              <CardTitle>Mes Séquences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sequences.map((sequence: any) => (
                  <div key={sequence.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${sequence.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <div>
                        <h4 className="font-medium text-foreground">{sequence.name}</h4>
                        <p className="text-sm text-muted-foreground">{sequence.description || "Aucune description"}</p>
                        <p className="text-xs text-muted-foreground mt-1">0 étapes configurées • 0 leads inscrits</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={sequence.isActive ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"}>
                        {sequence.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedSequence(sequence.id);
                          setIsEditingSteps(true);
                          setSequenceSteps([]);
                          setSequenceConfig({ selectedLeads: [] });
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toggleSequenceMutation.mutate({
                            sequenceId: sequence.id,
                            isActive: !sequence.isActive
                          });
                        }}
                        disabled={toggleSequenceMutation.isPending}
                      >
                        {sequence.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm("Êtes-vous sûr de vouloir supprimer cette séquence ?")) {
                            deleteSequenceMutation.mutate(sequence.id);
                          }
                        }}
                        disabled={deleteSequenceMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-2 border-dashed border-muted">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Aucune séquence créée
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              Créez votre première séquence automatisée pour commencer à nurturing vos prospects avec des emails programmés.
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer ma première séquence
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}