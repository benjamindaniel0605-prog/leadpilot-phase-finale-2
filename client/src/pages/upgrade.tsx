import { useState } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  icon: React.ReactNode;
  features: string[];
  color: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    icon: <Crown className="h-6 w-6" />,
    color: 'from-purple-600 to-blue-600',
    features: [
      '400 leads par mois',
      '15 templates email',
      '300 variations IA par mois',
      'Séquences automatisées (3 étapes)',
      'Connexion Gmail OAuth',
      'Analytics avancés',
      'Support prioritaire'
    ]
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 59,
    icon: <Rocket className="h-6 w-6" />,
    color: 'from-green-600 to-teal-600',
    popular: true,
    features: [
      '1500 leads par mois',
      '30 templates email premium',
      '1000 variations IA par mois',
      'Séquences automatisées (5 étapes)',
      'Connexion multi-comptes',
      'Analytics avancés + IA insights',
      'Service de closing humain',
      'Support 24/7'
    ]
  }
];

const CheckoutForm = ({ selectedPlan }: { selectedPlan: Plan }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast({
          title: "Erreur de paiement",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du paiement",
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
        {isProcessing ? "Traitement..." : `Payer ${selectedPlan.price}€/mois`}
      </Button>
    </form>
  );
};

const PlanCard = ({ plan, onSelect }: { plan: Plan; onSelect: () => void }) => (
  <Card className={`relative ${plan.popular ? 'border-2 border-gradient-to-r border-green-500' : ''}`}>
    {plan.popular && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <Badge className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-3 py-1">
          <Zap className="h-3 w-3 mr-1" />
          Populaire
        </Badge>
      </div>
    )}
    <CardHeader className="text-center pb-4">
      <div className={`mx-auto p-3 rounded-full bg-gradient-to-r ${plan.color} text-white w-fit`}>
        {plan.icon}
      </div>
      <CardTitle className="text-2xl">{plan.name}</CardTitle>
      <div className="text-3xl font-bold">
        {plan.price}€
        <span className="text-sm font-normal text-muted-foreground">/mois</span>
      </div>
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
        onClick={onSelect}
        className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90`}
      >
        Choisir {plan.name}
      </Button>
    </CardContent>
  </Card>
);

export default function UpgradePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanSelect = async (plan: Plan) => {
    setIsLoading(true);
    setSelectedPlan(plan);

    try {
      const response = await apiRequest("POST", "/api/create-subscription", {
        planId: plan.id,
        priceId: plan.id === 'pro' ? 'price_pro_monthly' : 'price_growth_monthly'
      });
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'abonnement",
        variant: "destructive",
      });
      setSelectedPlan(null);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
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
              Plan {selectedPlan.name} - {selectedPlan.price}€/mois
            </p>
          </div>

          <Card className="p-6">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm selectedPlan={selectedPlan} />
            </Elements>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Passez au niveau supérieur avec LeadPilot
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Débloquez toute la puissance de l'automatisation de leads et des séquences intelligentes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              onSelect={() => handlePlanSelect(plan)}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Paiement sécurisé avec Stripe • Annulation à tout moment • Support 24/7
          </p>
        </div>
      </div>
    </div>
  );
}