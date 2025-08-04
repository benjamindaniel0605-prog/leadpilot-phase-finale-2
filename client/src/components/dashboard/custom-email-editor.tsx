import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, Save, X, RotateCcw, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Template } from "@shared/schema";

interface CustomEmailEditorProps {
  template: Template;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomEmailEditor({ template, isOpen, onClose }: CustomEmailEditorProps) {
  const [emailName, setEmailName] = useState("");
  const [subject, setSubject] = useState(template.subject);
  const [content, setContent] = useState(template.content);
  const [originalSubject] = useState(template.subject);
  const [originalContent] = useState(template.content);
  const [isGeneratingVariation, setIsGeneratingVariation] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Vérification du plan pour le booking
  const userPlan = (user as any)?.plan || "free";
  const canUseBooking = ['starter', 'pro', 'growth'].includes(userPlan);

  // Fonction pour ajouter le lien de booking
  const handleAddBookingLink = () => {
    if (!canUseBooking) {
      toast({
        title: "Fonctionnalité réservée",
        description: "Les liens de RDV sont disponibles à partir du plan Starter.",
        variant: "destructive",
      });
      return;
    }

    const userId = (user as any)?.id;
    const bookingText = `\n\nPour programmer un RDV, cliquez ici :\nhttps://leadpilot.com/book/${userId}\n\nOu répondez à cet email pour convenir d'un autre créneau.`;
    
    // Ajouter le texte à la fin du contenu existant
    setContent(prevContent => prevContent + bookingText);
    
    toast({
      title: "Lien de RDV ajouté !",
      description: "Le texte de proposition de rendez-vous a été inséré à la fin de votre email.",
    });
  };

  // Mutation pour générer une variation IA
  const generateVariationMutation = useMutation({
    mutationFn: async () => {
      setIsGeneratingVariation(true);
      const response = await fetch(`/api/templates/${template.id}/ai-variation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    },
    onSuccess: (data) => {
      // Les variations sont appliquées au template temporairement pour cet éditeur
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      // Recharger le template modifié
      const updatedTemplate = queryClient.getQueryData<Template[]>(["/api/templates"])?.find(t => t.id === template.id);
      if (updatedTemplate) {
        setSubject(updatedTemplate.subject);
        setContent(updatedTemplate.content);
      }
      setIsGeneratingVariation(false);
      toast({
        title: "Variation générée !",
        description: "L'IA a créé une nouvelle version du contenu",
      });
    },
    onError: () => {
      setIsGeneratingVariation(false);
      toast({
        title: "Erreur",
        description: "Impossible de générer la variation",
        variant: "destructive",
      });
    },
  });

  // Mutation pour sauvegarder l'email personnalisé
  const saveCustomEmailMutation = useMutation({
    mutationFn: async () => {
      if (!emailName.trim()) {
        throw new Error("Le nom de l'email est obligatoire");
      }
      
      const response = await apiRequest("POST", "/api/custom-emails", {
        name: emailName,
        subject: subject,
        content: content,
        baseTemplateId: template.id,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-emails"] });
      toast({
        title: "Email sauvegardé !",
        description: "Votre email personnalisé a été enregistré avec succès",
      });
      onClose();
      // Reset
      setEmailName("");
      setSubject(originalSubject);
      setContent(originalContent);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder l'email",
        variant: "destructive",
      });
    },
  });

  const handleResetToOriginal = () => {
    setSubject(originalSubject);
    setContent(originalContent);
    toast({
      title: "Contenu restauré",
      description: "Le template a été remis à sa version originale",
    });
  };

  const handleCancel = () => {
    setEmailName("");
    setSubject(originalSubject);
    setContent(originalContent);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Créer un Email Personnalisé</span>
            <Badge variant="outline">{template.name}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Nom de l'email */}
          <div>
            <Label htmlFor="emailName">Nom de votre email personnalisé *</Label>
            <Input
              id="emailName"
              value={emailName}
              onChange={(e) => setEmailName(e.target.value)}
              placeholder="Ex: Email intro secteur tech, Relance prospect qualified..."
              className="mt-1"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Aperçu Template Original */}
            <div>
              <h3 className="text-lg font-medium mb-3">📋 Template de Base</h3>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    {template.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">OBJET ORIGINAL</Label>
                    <div className="text-sm bg-muted p-2 rounded text-muted-foreground">
                      {originalSubject}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">CONTENU ORIGINAL</Label>
                    <div className="text-sm bg-muted p-3 rounded max-h-40 overflow-y-auto text-muted-foreground whitespace-pre-wrap">
                      {originalContent}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Éditeur Email Personnalisé */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">✏️ Votre Version</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateVariationMutation.mutate()}
                    disabled={isGeneratingVariation}
                  >
                    {isGeneratingVariation ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-1" />
                    )}
                    {isGeneratingVariation ? "Génération..." : "Variation IA"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddBookingLink}
                    disabled={!canUseBooking}
                    title={!canUseBooking ? "Disponible à partir du plan Starter" : "Ajouter un lien de prise de RDV"}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Proposer RDV
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetToOriginal}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Original
                  </Button>
                </div>
              </div>

              <Card className="border-blue-200">
                <CardContent className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="customSubject">Objet de l'email</Label>
                    <Input
                      id="customSubject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Personnalisez l'objet..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="customContent">Contenu de l'email</Label>
                    <Textarea
                      id="customContent"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Personnalisez le contenu..."
                      rows={15}
                      className="resize-none font-mono text-sm"
                    />
                    <div className="text-xs text-muted-foreground mt-2">
                      💡 <strong>Variables :</strong> [PRENOM], [ENTREPRISE], [POSTE], [SECTEUR]
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="ghost" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button 
            onClick={() => saveCustomEmailMutation.mutate()}
            disabled={saveCustomEmailMutation.isPending || !emailName.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveCustomEmailMutation.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}