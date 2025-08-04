import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit3, Trash2, Eye, Copy, Wand2, RotateCcw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { CustomEmail } from "@shared/schema";

export default function CustomEmailsSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [viewingEmail, setViewingEmail] = useState<CustomEmail | null>(null);
  const [editingEmail, setEditingEmail] = useState<CustomEmail | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedSubject, setEditedSubject] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [generatingVariation, setGeneratingVariation] = useState(false);

  const { data: customEmails = [], isLoading } = useQuery<CustomEmail[]>({
    queryKey: ["/api/custom-emails"],
  });

  const deleteEmailMutation = useMutation({
    mutationFn: async (emailId: string) => {
      const response = await apiRequest("DELETE", `/api/custom-emails/${emailId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-emails"] });
      toast({
        title: "Email supprimé",
        description: "L'email personnalisé a été supprimé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'email.",
        variant: "destructive",
      });
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; subject: string; content: string }) => {
      const response = await apiRequest("PATCH", `/api/custom-emails/${data.id}`, {
        name: data.name,
        subject: data.subject,
        content: data.content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-emails"] });
      setEditingEmail(null);
      toast({
        title: "Email mis à jour",
        description: "L'email personnalisé a été modifié avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'email.",
        variant: "destructive",
      });
    },
  });

  const handleCopyEmail = (customEmail: CustomEmail) => {
    const emailText = `Objet: ${customEmail.subject}\n\nContenu:\n${customEmail.content}`;
    navigator.clipboard.writeText(emailText);
    toast({
      title: "Email copié !",
      description: "Le contenu a été copié dans le presse-papier",
    });
  };

  const handleEditEmail = (customEmail: CustomEmail) => {
    setEditingEmail(customEmail);
    setEditedName(customEmail.name);
    setEditedSubject(customEmail.subject);
    setEditedContent(customEmail.content);
    setOriginalContent(customEmail.content); // Sauvegarder le contenu original
  };

  const handleSaveEdit = () => {
    if (!editingEmail) return;
    
    updateEmailMutation.mutate({
      id: editingEmail.id,
      name: editedName,
      subject: editedSubject,
      content: editedContent,
    });
  };

  const generateVariationMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/custom-emails/generate-variation", {
        content: content
      });
      return response.json();
    },
    onSuccess: (data) => {
      setEditedContent(data.variation);
      setGeneratingVariation(false);
      toast({
        title: "Variation générée !",
        description: "Une nouvelle version de votre email a été créée avec l'IA.",
      });
    },
    onError: () => {
      setGeneratingVariation(false);
      toast({
        title: "Erreur",
        description: "Impossible de générer une variation. Réessayez.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateVariation = () => {
    if (!editedContent.trim()) return;
    setGeneratingVariation(true);
    generateVariationMutation.mutate(editedContent);
  };

  const handleResetToOriginal = () => {
    setEditedContent(originalContent);
    toast({
      title: "Contenu restauré",
      description: "Le contenu original a été restauré.",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Mes Emails Personnalisés</h2>
          <p className="text-gray-600">
            Gérez vos emails créés à partir des templates de base
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {customEmails.length} email{customEmails.length > 1 ? 's' : ''} sauvegardé{customEmails.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {customEmails.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun email personnalisé
                </h3>
                <p className="text-gray-600 max-w-md">
                  Créez vos premiers emails personnalisés en utilisant le bouton "Choisir Template" 
                  dans la section Templates.
                </p>
              </div>
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Aller aux Templates
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customEmails.map((customEmail) => (
            <Card key={customEmail.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{customEmail.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Créé le {customEmail.createdAt ? new Date(customEmail.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Objet */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    OBJET
                  </label>
                  <p className="text-sm mt-1 line-clamp-2">{customEmail.subject}</p>
                </div>

                {/* Aperçu contenu */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    APERÇU
                  </label>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                    {customEmail.content.substring(0, 150)}...
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyEmail(customEmail)}
                      title="Copier"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingEmail(customEmail)}
                      title="Aperçu complet"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditEmail(customEmail)}
                      title="Éditer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer l'email</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer l'email "{customEmail.name}" ? 
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteEmailMutation.mutate(customEmail.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de visualisation */}
      <Dialog open={!!viewingEmail} onOpenChange={() => setViewingEmail(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{viewingEmail?.name}</DialogTitle>
            <DialogDescription>
              Aperçu complet de votre email personnalisé
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div>
              <Label>Objet de l'email</Label>
              <div className="mt-1 p-3 bg-muted rounded-md">
                {viewingEmail?.subject}
              </div>
            </div>
            <div>
              <Label>Contenu de l'email</Label>
              <div className="mt-1 p-4 bg-muted rounded-md whitespace-pre-line font-mono text-sm min-h-[300px]">
                {viewingEmail?.content}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setViewingEmail(null)}>
              Fermer
            </Button>
            <Button onClick={() => handleCopyEmail(viewingEmail!)}>
              Copier
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition */}
      <Dialog open={!!editingEmail} onOpenChange={() => setEditingEmail(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Modifier l'Email</DialogTitle>
            <DialogDescription>
              Modifiez le nom, l'objet et le contenu de votre email personnalisé
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div>
              <Label htmlFor="edit-name">Nom de l'email</Label>
              <Input
                id="edit-name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Nom de votre email..."
              />
            </div>
            <div>
              <Label htmlFor="edit-subject">Objet de l'email</Label>
              <Input
                id="edit-subject"
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
                placeholder="Objet de votre email..."
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Contenu de l'email</Label>
              <Textarea
                id="edit-content"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Contenu de votre email..."
                rows={20}
                className="resize-none font-mono text-sm min-h-[400px]"
              />
              <div className="text-xs text-muted-foreground mt-2">
                💡 <strong>Variables disponibles :</strong> [PRENOM], [ENTREPRISE], [POSTE], [SECTEUR], [EXPEDITEUR]
              </div>
            </div>
          </div>
          <div className="flex justify-between pt-4 border-t">
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={handleGenerateVariation}
                disabled={generatingVariation || !editedContent.trim()}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              >
                {generatingVariation ? (
                  <>
                    <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Variation
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleResetToOriginal}
                disabled={editedContent === originalContent}
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Original
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setEditingEmail(null)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSaveEdit}
                disabled={updateEmailMutation.isPending || !editedName.trim() || !editedSubject.trim() || !editedContent.trim()}
              >
                {updateEmailMutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}