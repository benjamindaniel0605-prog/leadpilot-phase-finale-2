import { useState } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Crown, Zap, Rocket } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Chargement de Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface Plan {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  icon: React.ReactNode;
  features: string[];
  color: string;
  popular?: boolean;
  trial?: boolean;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    yearlyPrice: 490,
    icon: <Zap className="h-6 w-6" />,
    color: 'from-blue-600 to-purple-600',
    features: [
      '100 leads par mois',
      '5 templates email',
      '100 variations IA par mois',
      'Lien de booking personnalisé',
      'Essai gratuit 14 jours sans engagement',
      'Support email',
      'Statistiques de conversion',
      'Résiliable à tout moment'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    yearlyPrice: 990,
    icon: <Crown className="h-6 w-6" />,
    color: 'from-purple-600 to-pink-600',
    popular: true,
    trial: true,
    features: [
      '400 leads par mois',
      '15 templates email',
      '300 variations IA par mois',
      'Séquences automatisées (3 étapes)',
      'Lien de booking personnalisé',
      'Essai gratuit 14 jours sans engagement',
      'Connexion Gmail OAuth',
      'Analyse détaillée des campagnes',
      'Support prioritaire',
      'Résiliable à tout moment'
    ]
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 299,
    yearlyPrice: 2990,
    icon: <Rocket className="h-6 w-6" />,
    color: 'from-pink-600 to-red-600',
    features: [
      '1500 leads par mois',
      '30 templates email premium',
      '1000 variations IA par mois',
      'Séquences automatisées (5 étapes) + A/B testing',
      'Lien de booking personnalisé',
      'Analyse avancée + prédictions IA',
      'Recommandations automatiques',
      'Support 24/7',
      'Résiliable à tout moment'
    ]
  }
];

const CheckoutForm = ({ selectedPlan, isYearly }: { selectedPlan: Plan; isYearly: boolean }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPrice = isYearly ? selectedPlan.yearlyPrice : selectedPlan.price;
  const period = isYearly ? 'an' : 'mois';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Creer l intention de paiement avec le type de periode
      const response = await apiRequest('POST', '/api/create-subscription', {
        planId: selectedPlan.id,
        isYearly: isYearly
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la creation de l abonnement');
      }
      
      const { clientSecret } = await response.json();
      
      // Confirmer le paiement avec Stripe
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?upgrade=success`,
        },
      });

      if (error) {
        toast({
          title: "Erreur de paiement",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du paiement",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className={`w-full bg-gradient-to-r ${selectedPlan.color} hover:opacity-90`}
      >
        {isProcessing ? "Traitement..." : `Payer ${currentPrice}€/${period}`}
      </Button>
    </form>
  );
};

const PlanCard = ({ 
  plan, 
  isYearly, 
  onDirectPayment,
  isLoading 
}: { 
  plan: Plan; 
  isYearly: boolean; 
  onDirectPayment: (plan: Plan, billing: string) => void;
  isLoading: boolean;
}) => {
  const currentPrice = isYearly ? plan.yearlyPrice : plan.price;
  const period = isYearly ? 'an' : 'mois';
  const monthlyEquivalent = isYearly ? Math.round(plan.yearlyPrice / 10) : plan.price;
  const savings = isYearly ? plan.price * 12 - plan.yearlyPrice : 0;

  return (
    <Card className={`relative ${plan.popular ? 'border-2 border-gradient-to-r border-purple-500' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1">
            <Crown className="h-3 w-3 mr-1" />
            Populaire
          </Badge>
        </div>
      )}
      {isYearly && savings > 0 && (
        <div className="absolute -top-3 right-4">
          <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-2 py-1">
            Économisez {savings}€
          </Badge>
        </div>
      )}
      <CardHeader className="text-center pb-4">
        <div className={`mx-auto p-3 rounded-full bg-gradient-to-r ${plan.color} text-white w-fit`}>
          {plan.icon}
        </div>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <div className="text-3xl font-bold">
          {currentPrice}€
          <span className="text-sm font-normal text-muted-foreground">/{period}</span>
        </div>
        {isYearly && (
          <div className="text-sm text-muted-foreground">
            Soit {monthlyEquivalent}€/mois
          </div>
        )}
        {plan.trial && (
          <div className="text-sm text-green-400 font-medium">
            ✨ Essai gratuit 14 jours sans engagement
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Button 
          onClick={() => onDirectPayment(plan, isYearly ? 'yearly' : 'monthly')}
          disabled={isLoading}
          className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90`}
        >
          {isLoading ? "Chargement..." : `Choisir ${plan.name}`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default function UpgradePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDirectPayment = async (plan: Plan, billing: string) => {
    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/payment/direct-checkout', {
        plan: plan.id,
        billing: billing
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du lien de paiement');
      }

      const data = await response.json();
      
      // Redirection directe vers Stripe dans un nouvel onglet pour éviter les blocages
      if (data.url) {
        // Ouvrir dans un nouvel onglet pour éviter les problèmes de navigation
        window.open(data.url, '_blank');
        
        // Afficher un message de confirmation
        toast({
          title: "Redirection vers Stripe",
          description: "La page de paiement s'ouvre dans un nouvel onglet",
        });
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le lien de paiement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedPlan(null);
    setClientSecret(null);
  };

  if (selectedPlan && clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="mb-4"
            >
              ← Retour aux plans
            </Button>
            <h1 className="text-3xl font-bold mb-2">Finaliser votre abonnement</h1>
            <p className="text-muted-foreground">
              Plan {selectedPlan.name} - {isYearly ? selectedPlan.yearlyPrice : selectedPlan.price}€/{isYearly ? 'an' : 'mois'}
            </p>
            {selectedPlan.trial && (
              <p className="text-green-400 text-sm mt-2">
                ✨ Essai gratuit de 14 jours sans engagement inclus
              </p>
            )}
          </div>

          <Card className="p-6">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm selectedPlan={selectedPlan} isYearly={isYearly} />
            </Elements>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">
            Passez au niveau supérieur avec LeadPilot
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Débloquez toute la puissance de l'automatisation de leads et des séquences intelligentes
          </p>
        </div>

        {/* Toggle mensuel/annuel */}
        <div className="flex items-center justify-center mb-8 space-x-6 bg-slate-700/50 rounded-xl p-4 max-w-md mx-auto">
          <span className={`text-base font-medium transition-colors ${!isYearly ? 'text-white' : 'text-slate-400'}`}>
            Mensuel
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500 scale-125"
          />
          <span className={`text-base font-medium transition-colors ${isYearly ? 'text-white' : 'text-slate-400'}`}>
            Annuel
          </span>
          {isYearly && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium px-3 py-1">
              2 mois offerts
            </Badge>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              isYearly={isYearly}
              onDirectPayment={handleDirectPayment}
              isLoading={isLoading}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-slate-400">
            Paiement sécurisé avec Stripe • Résiliable à tout moment • Support 24/7
          </p>
          
          {/* Lien d'annulation pour les utilisateurs avec plan payant */}
          {user?.plan && user.plan !== 'free' && (
            <div className="mt-8 p-4 bg-slate-700 rounded-lg border border-slate-600 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-white mb-2">Gérer votre abonnement</h3>
              <p className="text-slate-300 text-sm mb-3">
                Besoin d'annuler ou de modifier votre abonnement ?
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation('/cancel-subscription')}
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                Annuler l'abonnement
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}