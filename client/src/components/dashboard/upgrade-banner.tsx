import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Zap, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function UpgradeBanner() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Ne pas afficher si l'utilisateur a déjà un plan payant
  if (user?.plan !== "free") return null;

  return (
    <Card className="border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-800 dark:to-slate-700 mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Débloquez tout le potentiel de LeadPilot
              </h3>
              <p className="text-slate-300 text-sm">
                Séquences automatisées, plus de leads, templates premium et bien plus
              </p>
              <p className="text-blue-300 text-xs font-medium mt-1">
                ✨ Essai gratuit 14 jours sans engagement (Plan Pro)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right hidden md:block">
              <div className="text-sm text-slate-300">À partir de</div>
              <div className="text-2xl font-bold text-white">49€</div>
              <div className="text-xs text-slate-300">/mois</div>
            </div>
            <Button 
              onClick={() => setLocation('/upgrade')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Passer Pro
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}