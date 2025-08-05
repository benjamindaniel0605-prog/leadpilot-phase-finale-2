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

export default function SequencesSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSequence, setNewSequence] = useState({
    name: "",
    description: ""
  });

  const canUseSequences = user?.plan === "pro" || user?.plan === "growth";
  const maxSteps = user?.plan === "growth" ? 5 : user?.plan === "pro" ? 3 : 0;

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

  // Création de séquence
  const createSequenceMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      return await apiRequest("/api/sequences", {
        method: "POST",
        body: JSON.stringify(data),
      });
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

  const sequenceSteps = [
    {
      step: 1,
      title: "Email Initial",
      template: "Découverte simple",
      timing: "Immédiatement",
      color: "bg-emerald-500"
    },
    {
      step: 2,
      title: "Follow-up 1",
      template: "Petit rappel",
      timing: "3 jours après si pas de réponse",
      color: maxSteps >= 2 ? "bg-blue-500" : "bg-gray-600"
    },
    {
      step: 3,
      title: "Follow-up Final",
      template: "Dernier message",
      timing: "7 jours après si pas de réponse",
      color: maxSteps >= 3 ? "bg-purple-500" : "bg-gray-600"
    },
    {
      step: 4,
      title: "Social Proof",
      template: "Étude de cas",
      timing: "14 jours après si pas de réponse",
      color: maxSteps >= 4 ? "bg-orange-500" : "bg-gray-600"
    },
    {
      step: 5,
      title: "Offre Spéciale",
      template: "Proposition commerciale",
      timing: "21 jours après si pas de réponse",
      color: maxSteps >= 5 ? "bg-red-500" : "bg-gray-600"
    }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Séquences Multi-étapes</h2>
          <p className="text-muted-foreground">Automatisez vos follow-ups avec des séquences intelligentes</p>
        </div>
        <Button disabled={!canUseSequences} className="relative">
          {!canUseSequences && <Lock className="h-4 w-4 mr-2" />}
          Nouvelle Séquence {!canUseSequences && "(Plan Pro)"}
        </Button>
      </div>

      {!canUseSequences && (
        <Card className="mb-6 bg-gradient-to-r from-primary/5 to-purple/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Débloque les Séquences Multi-étapes
                </h3>
                <p className="text-muted-foreground mb-4">
                  Automatisez vos follow-ups avec jusqu'à 3 étapes (Pro) ou 5 étapes (Growth)
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Relances automatiques personnalisées
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Délais configurables entre chaque étape
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                    Arrêt automatique en cas de réponse
                  </li>
                </ul>
              </div>
              <div className="text-center">
                <Button className="mb-2">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrader vers Pro
                </Button>
                <p className="text-sm text-muted-foreground">À partir de 99€/mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sequence Preview */}
      <Card>
        <CardHeader>
          <CardTitle>
            {canUseSequences 
              ? `Créer une Séquence (${maxSteps} étapes max)`
              : "Aperçu: Séquence de Prospection Type"
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sequenceSteps.map((step, index) => (
              <div key={step.step}>
                <div className={`flex items-start space-x-4 ${!canUseSequences ? 'opacity-60' : ''}`}>
                  <div className={`w-8 h-8 ${step.color} text-white rounded-full flex items-center justify-center font-semibold`}>
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className="bg-card border border-border p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">{step.title}</h4>
                        {step.step > maxSteps && canUseSequences && (
                          <Badge variant="secondary">
                            <Lock className="h-3 w-3 mr-1" />
                            Growth
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Template: {step.template}</p>
                      <p className="text-xs text-muted-foreground">Envoi: {step.timing}</p>
                    </div>
                  </div>
                </div>

                {/* Arrow between steps */}
                {index < sequenceSteps.length - 1 && (
                  <div className={`flex justify-center my-4 ${!canUseSequences ? 'opacity-60' : ''}`}>
                    <div className="w-px h-8 bg-gray-300"></div>
                    <div className="absolute w-2 h-2 bg-gray-300 rounded-full mt-3"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {canUseSequences && (
            <div className="mt-8 pt-6 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Paramètres Avancés</h4>
                  <p className="text-sm text-muted-foreground">
                    Personnalisez les délais, conditions d'arrêt et A/B testing
                  </p>
                </div>
                <div className="space-x-3">
                  <Button variant="outline">Sauvegarder comme Template</Button>
                  <Button>Créer Séquence</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
