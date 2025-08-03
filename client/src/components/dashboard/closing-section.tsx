import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Clock, CheckCircle, TrendingUp, Users, Award } from "lucide-react";

export default function ClosingSection() {
  const upcomingFeatures = [
    {
      icon: Target,
      title: "Suivi des Opportunités",
      description: "Gérez vos prospects chauds et suivez leur progression dans le tunnel de vente.",
      eta: "Q2 2025"
    },
    {
      icon: CheckCircle,
      title: "Checklist de Closing",
      description: "Listes de vérification personnalisées pour optimiser vos techniques de closing.",
      eta: "Q2 2025"
    },
    {
      icon: TrendingUp,
      title: "Scripts de Closing IA",
      description: "Scripts personnalisés générés par IA selon le profil et les objections du prospect.",
      eta: "Q3 2025"
    },
    {
      icon: Users,
      title: "Gestion des Objections",
      description: "Base de données d'objections avec réponses suggérées et taux de réussite.",
      eta: "Q3 2025"
    },
    {
      icon: Award,
      title: "Analytics de Closing",
      description: "Analyse détaillée de vos performances de closing et recommandations d'amélioration.",
      eta: "Q4 2025"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <Target className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Module Closing
        </h1>
        <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
          Transformez vos prospects en clients avec des outils de closing avancés et des techniques d'IA.
        </p>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 inline-block">
          <div className="flex items-center text-primary">
            <Clock className="h-5 w-5 mr-2" />
            <span className="font-semibold">Bientôt disponible - En développement</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {upcomingFeatures.map((feature, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center`}>
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  {feature.eta}
                </span>
              </div>
              <CardTitle className="text-lg text-card-foreground">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
            <div className="absolute inset-0 bg-card/50 backdrop-blur-[1px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="bg-primary/20 text-primary px-4 py-2 rounded-lg font-semibold">
                En développement
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-semibold text-card-foreground mb-4">
            Soyez les premiers informés
          </h3>
          <p className="text-muted-foreground mb-6">
            Inscrivez-vous pour être notifié dès que le module Closing sera disponible et bénéficier d'un accès anticipé.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Votre email"
              className="form-input flex-1"
            />
            <Button>
              Me notifier
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Nous respectons votre vie privée. Pas de spam, juste les updates importantes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}