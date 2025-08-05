import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function CancelSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [skipReason, setSkipReason] = useState(false);

  const handleCancel = async () => {
    if (!skipReason && !reason.trim()) {
      toast({
        title: "Raison requise",
        description: "Veuillez indiquer la raison de l'annulation ou cliquer sur 'Ignorer'.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await apiRequest('POST', '/api/cancel-subscription', {
        reason: skipReason ? 'Raison non précisée' : reason.trim(),
        userEmail: user?.email,
        userName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email
      });

      if (response.ok) {
        setIsCancelled(true);
        toast({
          title: "Abonnement annulé",
          description: "Votre abonnement a été annulé avec succès.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'annuler l'abonnement.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isCancelled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Abonnement Annulé</h2>
            <p className="text-slate-300 mb-4">
              Votre abonnement a été annulé avec succès. Vous conservez l'accès jusqu'à la fin de votre période de facturation actuelle.
            </p>
            <div className="bg-slate-700 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-white mb-2">Ce qui se passe maintenant :</h3>
              <ul className="text-slate-300 text-sm space-y-1">
                <li>• Votre plan reste actif jusqu'à la fin du cycle</li>
                <li>• Aucun renouvellement automatique</li>
                <li>• Vos données sont conservées 30 jours</li>
                <li>• Vous pouvez vous réabonner à tout moment</li>
              </ul>
            </div>
            <Button 
              onClick={() => setLocation('/dashboard')}
              className="bg-slate-600 hover:bg-slate-700"
            >
              Retour au dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Annuler l'abonnement</CardTitle>
            <p className="text-slate-300">
              Nous sommes désolés de vous voir partir. Votre avis nous aide à nous améliorer.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan actuel */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Plan actuel</h3>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 capitalize">{user?.plan || 'Free'}</span>
                <span className="text-slate-300">
                  {user?.plan !== 'free' ? 'Payant' : 'Gratuit'}
                </span>
              </div>
            </div>

            {/* Raison de l'annulation */}
            <div>
              <Label htmlFor="reason" className="text-white">
                Pourquoi annulez-vous votre abonnement ? *
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Partagez-nous votre expérience : tarif, fonctionnalités manquantes, problèmes techniques, service client..."
                className="mt-2 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                rows={4}
                required
              />
              <p className="text-sm text-slate-400 mt-1">
                Votre retour nous aide à améliorer LeadPilot pour tous nos utilisateurs.
              </p>
            </div>

            {/* Alternatives */}
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-200 mb-2">Avant d'annuler...</h3>
              <ul className="text-yellow-100 text-sm space-y-1">
                <li>• Avez-vous essayé de contacter notre support ?</li>
                <li>• Un plan moins cher pourrait-il vous convenir ?</li>
                <li>• Voulez-vous mettre votre compte en pause temporairement ?</li>
              </ul>
              <div className="mt-3 flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open('mailto:support@leadpilot.com', '_blank')}
                >
                  Contacter le support
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setLocation('/upgrade')}
                >
                  Voir les plans
                </Button>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3">
              {!skipReason && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSkipReason(true)}
                >
                  Ignorer - Ne pas donner de raison
                </Button>
              )}
              
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setLocation('/dashboard')}
                >
                  Conserver l'abonnement
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleCancel}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Annulation...' : 'Confirmer l\'annulation'}
                </Button>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center">
              L'annulation prend effet à la fin de votre période de facturation actuelle.
              Aucun remboursement ne sera effectué pour la période en cours.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}