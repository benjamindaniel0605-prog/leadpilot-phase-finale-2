import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Crown, BarChart3, Sparkles, Brain } from "lucide-react";

export default function SuccessGrowthMonthly() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 flex items-center justify-center p-4">
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
              Bienvenue dans le plan Growth mensuel
            </p>
          </div>

          {/* Plan Details */}
          <div className="bg-white/5 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-yellow-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">Plan Growth</h2>
              <div className="ml-2 px-2 py-1 bg-yellow-500/20 rounded text-xs text-yellow-300">
                149€/mois
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">2000</div>
                <div className="text-slate-400">Leads par mois</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">30</div>
                <div className="text-slate-400">Templates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">∞</div>
                <div className="text-slate-400">Variations IA</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="text-left mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Fonctionnalités Growth incluses :</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                Génération massive de leads (2000/mois)
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                Séquences multi-étapes illimitées
              </li>
              <li className="flex items-center">
                <BarChart3 className="w-4 h-4 text-yellow-400 mr-2 flex-shrink-0" />
                <strong>Statistiques avancées + Insights IA</strong>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                Intégrations API complètes
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                Support dédié + formations personnalisées
              </li>
            </ul>
          </div>

          {/* AI Insights Feature Highlight */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Brain className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="font-semibold text-white">Insights IA Avancés</span>
            </div>
            <p className="text-sm text-slate-300">
              L'IA analyse vos données pour suggérer automatiquement les meilleurs moments d'envoi, 
              optimiser vos messages, prédire les taux de conversion et identifier les leads les plus prometteurs.
            </p>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <p className="text-slate-300 mb-6">
              Votre abonnement Growth est maintenant actif. Exploitez l'IA pour maximiser vos résultats !
            </p>
            
            <Button 
              className="w-full bg-yellow-600 hover:bg-yellow-700"
              onClick={() => setLocation('/dashboard')}
            >
              Découvrir les insights IA
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="mt-8 text-xs text-slate-400">
            <p>Facturé mensuellement • Annulation possible à tout moment</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}