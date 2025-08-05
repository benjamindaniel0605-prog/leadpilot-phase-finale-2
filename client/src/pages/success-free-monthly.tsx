import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Crown } from "lucide-react";

export default function SuccessFreeMonthly() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Bienvenue dans LeadPilot !
            </h1>
            <p className="text-slate-300">
              Votre compte gratuit a été créé avec succès
            </p>
          </div>

          {/* Plan Details */}
          <div className="bg-white/5 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <Crown className="w-6 h-6 text-blue-400 mr-2" />
              <h2 className="text-xl font-semibold text-white">Plan Gratuit</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">5</div>
                <div className="text-slate-400">Leads par mois</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">1</div>
                <div className="text-slate-400">Template email</div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <p className="text-slate-300 mb-6">
              Vous pouvez maintenant commencer à générer vos premiers leads et créer vos campagnes d'outreach.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => setLocation('/dashboard')}
              >
                Accéder au Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-white/20 text-white hover:bg-white/10"
                onClick={() => setLocation('/upgrade')}
              >
                Découvrir les plans payants
              </Button>
            </div>
          </div>

          <div className="mt-8 text-xs text-slate-400">
            <p>Besoin d'aide ? Contactez notre support à contact@leadpilot.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}