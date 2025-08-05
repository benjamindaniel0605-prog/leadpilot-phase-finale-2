import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Vérification du paiement en cours...');
  const { toast } = useToast();

  useEffect(() => {
    const updatePaymentStatus = async () => {
      try {
        // Récupérer les paramètres de l'URL pour identifier le paiement
        const urlParams = new URLSearchParams(window.location.search);
        const planType = urlParams.get('plan');
        const billing = urlParams.get('billing');

        console.log('🔍 Paramètres de retour:', { planType, billing });

        if (!planType || !billing) {
          throw new Error('Paramètres de paiement manquants');
        }

        // Attendre un peu pour que la session soit correctement établie
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Vérifier d'abord l'authentification
        const authResponse = await apiRequest('GET', '/api/auth/user');
        
        if (!authResponse.ok) {
          throw new Error('Utilisateur non authentifié');
        }

        // Appeler l'API pour mettre à jour le statut de paiement
        const response = await apiRequest('POST', '/api/payment/verify-success', {
          planType,
          billing
        });

        if (response.ok) {
          const data = await response.json();
          
          setStatus('success');
          setMessage(`Paiement confirmé ! Votre plan ${data.planName} est maintenant actif.`);
          
          toast({
            title: "Paiement réussi !",
            description: `Bienvenue dans le plan ${data.planName}. Vos quotas ont été mis à jour.`,
          });

          // Invalider le cache utilisateur pour actualiser les données
          // Note: Le queryClient sera rechargé lors du retour au dashboard
          
          // Redirection après 3 secondes
          setTimeout(() => {
            setLocation('/');
            // Forcer le rechargement de la page pour actualiser toutes les données utilisateur
            window.location.reload();
          }, 3000);
        } else {
          throw new Error('Erreur lors de la vérification du paiement');
        }
      } catch (error: any) {
        console.error('Erreur vérification paiement:', error);
        setStatus('error');
        setMessage('Une erreur s\'est produite lors de la vérification du paiement.');
        
        toast({
          title: "Erreur de vérification",
          description: "Veuillez contacter le support si le problème persiste.",
          variant: "destructive",
        });

        // Redirection vers la page principale après 5 secondes même en cas d'erreur
        setTimeout(() => {
          setLocation('/');
          window.location.reload();
        }, 5000);
      }
    };

    updatePaymentStatus();
  }, [setLocation, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 text-center bg-slate-800 border-slate-700">
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-6">
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Traitement du paiement
            </h1>
            <p className="text-slate-400 mb-6">
              {message}
            </p>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Paiement confirmé !
            </h1>
            <p className="text-slate-300 mb-6">
              {message}
            </p>
            <p className="text-sm text-slate-400">
              Redirection vers votre dashboard dans quelques secondes...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-red-500 text-2xl">⚠</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Erreur de vérification
            </h1>
            <p className="text-slate-300 mb-6">
              {message}
            </p>
            <p className="text-sm text-slate-400">
              Redirection vers votre dashboard...
            </p>
          </>
        )}
      </Card>
    </div>
  );
}