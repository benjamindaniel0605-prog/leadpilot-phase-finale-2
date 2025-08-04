import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit3, Trash2, Eye, Copy } from "lucide-react";
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
import type { CustomEmail } from "@shared/schema";

export default function CustomEmailsSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const handleCopyEmail = (customEmail: CustomEmail) => {
    const emailText = `Objet: ${customEmail.subject}\n\nContenu:\n${customEmail.content}`;
    navigator.clipboard.writeText(emailText);
    toast({
      title: "Email copié !",
      description: "Le contenu a été copié dans le presse-papier",
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
                      title="Aperçu complet"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
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
    </div>
  );
}