import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Clock, CheckCircle, Phone, Users, Award, Calendar, TrendingUp } from "lucide-react";

export default function ClosingSection() {
  const upcomingFeatures = [
    {
      icon: Calendar,
      title: "Prise de RDV Closing",
      description: "Permettez à vos leads qualifiés de booker un RDV téléphonique directement avec un closeur professionnel.",
      eta: "Q2 2025"
    },
    {
      icon: Phone,
      title: "Closeurs Professionnels",
      description: "Équipe de closeurs expérimentés pour conclure vos ventes par téléphone avec commission sur résultats.",
      eta: "Q2 2025"
    },
    {
      icon: Target,
      title: "Suivi des Opportunités",
      description: "Gérez vos prospects chauds et suivez leur progression vers la conclusion de vente.",
      eta: "Q3 2025"
    },
    {
      icon: Users,
      title: "Gestion des Commissions",
      description: "Système automatisé de calcul et versement des commissions aux closeurs selon les ventes réalisées.",
      eta: "Q3 2025"
    },
    {
      icon: Award,
      title: "Analytics de Performance",
      description: "Statistiques détaillées sur les taux de conversion et performances des closeurs.",
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
          Service Closing
        </h1>
        <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
          Transformez vos prospects qualifiés en clients grâce à nos closeurs professionnels. Ils concluent vos ventes par téléphone avec commission sur résultats.
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

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <Card>
          <CardContent className="p-8">
            <h3 className="text-2xl font-semibold text-card-foreground mb-4">
              Comment ça fonctionne
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <span className="text-primary font-semibold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-card-foreground">Sélectionnez vos leads qualifiés</h4>
                  <p className="text-muted-foreground text-sm">Choisissez les prospects les plus prometteurs de votre pipeline</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <span className="text-primary font-semibold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-card-foreground">Bookez un RDV closing</h4>
                  <p className="text-muted-foreground text-sm">Le lead reçoit un lien pour prendre RDV avec un closeur</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <span className="text-primary font-semibold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-card-foreground">Closing professionnel</h4>
                  <p className="text-muted-foreground text-sm">Notre closeur appelle et conclut la vente</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <span className="text-primary font-semibold text-sm">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-card-foreground">Commission partagée</h4>
                  <p className="text-muted-foreground text-sm">Le closeur touche sa commission, vous gardez le reste</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <h3 className="text-2xl font-semibold text-card-foreground mb-4">
              Intéressé par le service ?
            </h3>
            <p className="text-muted-foreground mb-6">
              Rejoignez la liste d'attente pour être notifié dès le lancement du service de closing.
            </p>
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Votre email"
                className="form-input w-full"
              />
              <Button className="w-full">
                Rejoindre la liste d'attente
              </Button>
            </div>
            <div className="mt-6 p-4 bg-primary/5 rounded-lg">
              <h4 className="font-semibold text-card-foreground mb-2">Avantages exclusifs :</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Accès prioritaire au service</li>
                <li>• Tarifs préférentiels early bird</li>
                <li>• Formation gratuite aux techniques de closing</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}