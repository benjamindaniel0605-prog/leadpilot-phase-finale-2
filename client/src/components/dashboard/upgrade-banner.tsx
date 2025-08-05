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
    <Card className="border-2 border-gradient-to-r from-purple-200 to-blue-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Débloquez tout le potentiel de LeadPilot
              </h3>
              <p className="text-muted-foreground text-sm">
                Séquences automatisées, plus de leads, templates premium et bien plus
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right hidden md:block">
              <div className="text-sm text-muted-foreground">À partir de</div>
              <div className="text-2xl font-bold text-purple-600">49€</div>
              <div className="text-xs text-muted-foreground">/mois</div>
            </div>
            <Button 
              onClick={() => setLocation('/upgrade')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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