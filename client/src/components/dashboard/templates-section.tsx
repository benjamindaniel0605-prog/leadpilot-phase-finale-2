import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, Plus, Edit, Copy, Lock, RefreshCw, Wand2 } from "lucide-react";
import type { Template } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import CustomEmailEditor from "./custom-email-editor";

export default function TemplatesSection() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [showCustomEmailDialog, setShowCustomEmailDialog] = useState(false);
  const [customSubject, setCustomSubject] = useState("");
  const [customContent, setCustomContent] = useState("");
  const [originalTemplates, setOriginalTemplates] = useState<{[key: string]: Template}>({});
  const [generatingVariation, setGeneratingVariation] = useState<string | null>(null);
  const [selectedTemplateForEdit, setSelectedTemplateForEdit] = useState<Template | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const { user } = useAuth();

  const planHierarchy = {
    free: 1,
    starter: 5,
    pro: 15,
    growth: 30
  };

  const userPlan = (user as any)?.plan || "free";
  const userLimit = planHierarchy[userPlan as keyof typeof planHierarchy];

  // Mutation pour copier dans le presse-papiers
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié !",
        description: `${type} copié dans le presse-papiers`,
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le texte",
        variant: "destructive",
      });
    }
  };

  // Mutation pour utiliser un template
  const useTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch(`/api/templates/${templateId}/use`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template utilisé !",
        description: "Le template a été ajouté à vos campagnes et le compteur d'utilisation mis à jour",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'utiliser ce template",
        variant: "destructive",
      });
    },
  });

  // Mutation pour générer une variation avec IA (modifie le template existant)
  const generateVariationMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const template = templates.find(t => t.id === templateId);
      if (!template) throw new Error("Template not found");
      
      // Sauvegarder l'original s'il n'existe pas
      if (!originalTemplates[templateId]) {
        setOriginalTemplates(prev => ({
          ...prev,
          [templateId]: { ...template }
        }));
      }

      // Utiliser l'IA pour générer une variation complète
      const response = await fetch(`/api/templates/${templateId}/ai-variation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Variation IA appliquée !",
        description: "Le template a été complètement repensé tout en gardant sa structure",
      });
      setGeneratingVariation(null);
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
    },
    onError: () => {
      setGeneratingVariation(null);
      toast({
        title: "Erreur",
        description: "Impossible de générer la variation IA",
        variant: "destructive",
      });
    },
  });

  // Mutation pour restaurer l'original
  const restoreOriginalMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const original = originalTemplates[templateId];
      if (!original) throw new Error("Original not found");

      const response = await fetch(`/api/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: original.subject, content: original.content }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template restauré !",
        description: "Le template original a été restauré",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
    },
  });

  // Mutation pour créer un email personnalisé
  const createCustomEmailMutation = useMutation({
    mutationFn: async ({ subject, content }: { subject: string; content: string }) => {
      const response = await fetch(`/api/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: "Email Personnalisé", 
          subject, 
          content, 
          plan: userPlan,
          category: "personnalise",
          variables: []
        }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email créé !",
        description: "Votre email personnalisé a été ajouté",
      });
      setShowCustomEmailDialog(false);
      setCustomSubject("");
      setCustomContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'email",
        variant: "destructive",
      });
    },
  });

  // Mutation pour éditer un template
  const editTemplateMutation = useMutation({
    mutationFn: async ({ id, subject, content }: { id: string; subject: string; content: string }) => {
      const response = await fetch(`/api/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template modifié !",
        description: "Vos modifications ont été enregistrées",
      });
      setEditingTemplate(null);
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le template",
        variant: "destructive",
      });
    },
  });

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setEditedSubject(template.subject);
    setEditedContent(template.content);
  };

  const handleSaveEdit = () => {
    if (editingTemplate) {
      editTemplateMutation.mutate({
        id: editingTemplate.id,
        subject: editedSubject,
        content: editedContent,
      });
    }
  };

  const handleGenerateVariation = (templateId: string) => {
    setGeneratingVariation(templateId);
    generateVariationMutation.mutate(templateId);
  };

  const categories = [
    { id: "all", label: `Tous (${userLimit}/30)` },
    { id: "free", label: "Free (1/30)" },
    { id: "starter", label: "Starter (5/30)", disabled: userPlan === "free" },
    { id: "pro", label: "Pro (15/30)", disabled: !["pro", "growth"].includes(userPlan) },
    { id: "growth", label: "Growth (30/30)", disabled: userPlan !== "growth" }
  ];

  const filteredTemplates = activeCategory === "all" 
    ? templates 
    : templates.filter((template: Template) => template.plan === activeCategory);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-16 bg-muted rounded"></div>
          <div className="grid lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">Templates d'Emails</h2>
          <p className="text-muted-foreground">30 templates optimisés avec variations IA</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowCustomEmailDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Écrire Email Personnel
          </Button>
        </div>
      </div>

      {/* Template Categories */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex space-x-4 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "ghost"}
                onClick={() => !category.disabled && setActiveCategory(category.id)}
                disabled={category.disabled}
                className={`whitespace-nowrap ${category.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {category.label}
                {category.disabled && <Lock className="h-3 w-3 ml-1" />}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <p className="text-muted-foreground mb-4">Aucun template disponible pour cette catégorie.</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer un template
            </Button>
          </div>
        ) : (
          filteredTemplates.map((template: Template) => {
            const isLocked = !["free", "starter", "pro", "growth"].slice(0, 
              Object.keys(planHierarchy).indexOf(userPlan) + 1
            ).includes(template.plan);

            return (
              <Card 
                key={template.id} 
                className={`${isLocked ? 'opacity-60' : ''} hover:shadow-lg transition-shadow`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">{template.plan}</Badge>
                        {isLocked && <Lock className="h-4 w-4 text-amber-600" />}
                      </div>
                    </div>
                    {!isLocked && (
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleGenerateVariation(template.id)}
                          disabled={generatingVariation === template.id}
                          title="Générer une variation"
                        >
                          {generatingVariation === template.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Wand2 className="h-4 w-4" />
                          )}
                        </Button>
                        {originalTemplates[template.id] && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => restoreOriginalMutation.mutate(template.id)}
                            title="Revenir à l'original"
                            className="text-amber-600 hover:text-amber-700"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(template.content, "Template")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Template Preview */}
                  <div className="bg-muted/50 p-4 rounded-lg mb-4">
                    <div className="text-sm text-card-foreground">
                      <div className="mb-2">
                        <strong>Objet:</strong> {template.subject}
                      </div>
                      <div className="mb-3 border-t border-border pt-3">
                        <div className="whitespace-pre-line text-sm">
                          {isLocked ? (
                            <div className="text-muted-foreground">
                              {template.content.substring(0, 100)}...
                              <p className="mt-2 text-amber-600">Contenu verrouillé</p>
                            </div>
                          ) : (
                            <span>{template.content}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>



                  {/* Template Stats */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    {!isLocked ? (
                      <>
                        <div className="flex space-x-4 text-sm text-gray-600">
                          <span>Utilisé: {template.timesUsed} fois</span>
                          <span>Taux ouverture: {template.openRate || 0}%</span>
                        </div>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTemplateForEdit(template)}
                          title="Créer un email personnalisé à partir de ce template"
                        >
                          <Wand2 className="h-4 w-4 mr-1" />
                          Choisir Template
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-gray-500">
                          Débloque avec le plan {template.plan}
                        </span>
                        <Button size="sm" variant="secondary">
                          Upgrader
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialog d'édition */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Modifier le Template</DialogTitle>
            <DialogDescription>
              Personnalisez l'objet et le contenu de votre template d'email.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div>
              <Label htmlFor="subject">Objet de l'email</Label>
              <Input
                id="subject"
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
                placeholder="Objet de votre email..."
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="content">Contenu de l'email</Label>
              <Textarea
                id="content"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Contenu de votre email..."
                rows={20}
                className="resize-none font-mono text-sm min-h-[400px]"
              />
              <div className="text-xs text-muted-foreground mt-2">
                💡 <strong>Commandes utiles :</strong> [PRENOM], [ENTREPRISE], [POSTE], [SECTEUR]
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={editTemplateMutation.isPending}
            >
              {editTemplateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog email personnalisé */}
      <Dialog open={showCustomEmailDialog} onOpenChange={setShowCustomEmailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Créer un Email Personnalisé</DialogTitle>
            <DialogDescription>
              Rédigez votre propre template d'email. Disponible pour tous les plans.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div>
              <Label htmlFor="customSubject">Objet de l'email</Label>
              <Input
                id="customSubject"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Ex: Collaboration avec [ENTREPRISE]"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="customContent">Contenu de l'email</Label>
              <Textarea
                id="customContent"
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder={`Bonjour [PRENOM],

J'espère que vous allez bien. Je me permets de vous contacter car...

Cordialement,
[EXPEDITEUR]`}
                rows={20}
                className="resize-none font-mono text-sm min-h-[400px]"
              />
              <div className="text-xs text-muted-foreground mt-2">
                💡 <strong>Variables disponibles :</strong> [PRENOM], [ENTREPRISE], [POSTE], [SECTEUR], [EXPEDITEUR]
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCustomEmailDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={() => createCustomEmailMutation.mutate({ subject: customSubject, content: customContent })}
              disabled={createCustomEmailMutation.isPending || !customSubject.trim() || !customContent.trim()}
            >
              {createCustomEmailMutation.isPending ? "Création..." : "Créer l'Email"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Email Editor */}
      {selectedTemplateForEdit && (
        <CustomEmailEditor
          template={selectedTemplateForEdit}
          isOpen={!!selectedTemplateForEdit}
          onClose={() => setSelectedTemplateForEdit(null)}
        />
      )}
    </div>
  );
}
