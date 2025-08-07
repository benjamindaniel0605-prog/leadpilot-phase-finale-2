import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Rocket, Users, Mail, Brain, TrendingUp, Calendar, Lock, Target, Clock } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleSignup = () => {
    window.location.href = "/api/login?signup=true";
  };

  const features = [
    {
      icon: Users,
      title: "Génération de Leads",
      description: "Trouvez automatiquement des prospects qualifiés avec filtrage IA avancé.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Mail,
      title: "30 Templates Email",
      description: "Templates optimisés en français avec variations IA pour maximiser les taux de réponse.",
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      icon: Brain,
      title: "Intelligence Artificielle",
      description: "Scoring automatique des leads et génération de variations d'emails personnalisées.",
      color: "bg-amber-100 text-amber-600"
    },
    {
      icon: TrendingUp,
      title: "Séquences Multi-étapes",
      description: "Automatisez vos campagnes avec des séquences intelligentes jusqu'à 5 étapes.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: TrendingUp,
      title: "Statistiques Avancées",
      description: "Suivez les taux d'ouverture, de clic, de réponse et de RDV bookés en temps réel.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Calendar,
      title: "Calendrier Intégré",
      description: "Permettez à vos prospects de réserver des RDV directement via vos emails.",
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      icon: Target,
      title: <span translate="no">Service de Closing</span>,
      description: "Closeurs professionnels pour conclure vos ventes par téléphone avec commission sur résultats.",
      color: "bg-orange-100 text-orange-600",
      comingSoon: true
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "49€",
      description: "par mois",
      features: [
        "100 leads par mois",
        "5 templates email",
        "100 variations par mois",
        "Lien de booking personnalisé",
        "Essai gratuit 14 jours sans engagement",
        "Support email",
        "Statistiques de conversion",
        "Résiliable à tout moment"
      ],
      buttonText: "Choisir Starter",
      buttonVariant: "default" as const
    },
    {
      name: "Pro",
      price: "99€",
      description: "par mois",
      features: [
        "✨ Essai gratuit 14 jours sans engagement",
        "Tout Starter +",
        "400 leads par mois",
        "15 templates email",
        "300 variations par mois",
        "Séquences automatisées (3 étapes)",
        "Connexion Gmail OAuth",
        "Analyse détaillée des campagnes",
        "Service prioritaire"
      ],
      buttonText: "Choisir Pro",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Growth",
      price: "299€",
      description: "par mois",
      features: [
        "Tout Pro +",
        "1500 leads par mois",
        "30 templates email premium",
        "1000 variations par mois",
        "Séquences automatisées (5 étapes)",
        "Analyse avancée des performances",
        "Recommandations automatiques",
        "Support 24/7"
      ],
      buttonText: "Choisir Growth",
      buttonVariant: "secondary" as const
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="relative bg-card shadow-sm border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Rocket className="h-8 w-8 text-primary mr-3" />
                <span className="text-xl font-bold text-foreground" translate="no">LeadPilot</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Tarifs</a>
              <Button variant="ghost" onClick={handleLogin}>Connexion</Button>
              <Button onClick={handleSignup}>S'inscrire</Button>
            </div>
            <div className="md:hidden flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={handleLogin}>Connexion</Button>
              <Button size="sm" onClick={handleSignup}>S'inscrire</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 to-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
                Génération de leads B2B{" "}
                <span className="text-primary">automatisée</span> avec IA
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Trouvez, qualifiez et convertissez vos prospects automatiquement. 
                30 templates d'emails, séquences multi-étapes et IA pour maximiser vos conversions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={handleLogin}>
                  S'inscrire Gratuitement
                </Button>
                <Button variant="outline" size="lg" onClick={handleLogin}>
                  Se Connecter
                </Button>
              </div>
              <div className="mt-8 flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                  Essai gratuit 14 jours
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                  Sans engagement
                </div>
              </div>
            </div>
            <div className="relative">
              <Card className="shadow-2xl">
                <CardContent className="p-6">
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="h-16 w-16 text-primary mx-auto mb-4" />
                      <p className="text-gray-600">Aperçu du Dashboard</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Tout ce dont vous avez besoin pour générer des leads
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Une plateforme complète qui automatise votre prospection de A à Z
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`hover:shadow-lg transition-shadow ${feature.comingSoon ? 'relative overflow-hidden' : ''}`}>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-card-foreground">{feature.title}</h3>
                    {feature.comingSoon && (
                      <div className="flex items-center text-amber-600 bg-amber-100 px-2 py-1 rounded-full text-xs font-semibold">
                        <Clock className="h-3 w-3 mr-1" />
                        Bientôt
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Choisissez votre plan
            </h2>
            <p className="text-xl text-muted-foreground">
              Commencez gratuitement, évoluez selon vos besoins
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`shadow-lg ${plan.popular ? 'border-2 border-primary relative' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Populaire
                    </span>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-card-foreground mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-card-foreground mb-2">{plan.price}</div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        {typeof feature === 'string' ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-emerald-500 mr-3 flex-shrink-0" />
                            <span className="text-card-foreground">{feature}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 text-emerald-500 mr-3 flex-shrink-0" />
                            <span className="text-card-foreground">{feature}</span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.buttonVariant}
                    onClick={handleSignup}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              💡 Facturation annuelle = 2 mois offerts (payer 10 mois au lieu de 12)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
