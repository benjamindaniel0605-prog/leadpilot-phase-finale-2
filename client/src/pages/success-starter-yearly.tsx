import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Crown, Zap, Gift } from "lucide-react";

export default function SuccessStarterYearly() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Paiement confirmé !
            </h1>
            <p className="text-slate-300">
              Bienvenue dans le plan Starter annuel
            </p>
          </div>

          {/* Plan Details */}
          <div className="bg-white/5 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">Plan Starter Annuel</h2>
              <div className="ml-2 px-2 py-1 bg-green-500/20 rounded text-xs text-green-300 flex items-center">
                <Gift className="w-3 h-3 mr-1" />
                2 mois offerts
              </div>
            </div>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-purple-400">290€/an</div>
              <div className="text-sm text-slate-400">au lieu de 348€ (économie de 58€)</div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">100</div>
                <div className="text-slate-400">Leads par mois</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">30</div>
                <div className="text-slate-400">Templates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">50</div>
                <div className="text-slate-400">Variations IA</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="text-left mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Fonctionnalités incluses :</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                Génération automatique de leads
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                Campagnes email personnalisées
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                Système de booking intégré
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                Support client prioritaire
              </li>
            </ul>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <p className="text-slate-300 mb-6">
              Votre abonnement annuel est maintenant actif. Profitez de vos 2 mois gratuits !
            </p>
            
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => setLocation('/dashboard')}
            >
              Commencer maintenant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="mt-8 text-xs text-slate-400">
            <p>Facturé annuellement • Économie de 58€ par rapport au mensuel</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}