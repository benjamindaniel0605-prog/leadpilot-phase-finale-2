import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Rocket, Users, Mail, Brain, TrendingUp, Calendar, Lock } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
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
    }
  ];

  const plans = [
    {
      name: "Free",
      price: "0€",
      description: "Pour tester",
      features: [
        "5 leads/mois",
        "1 template accessible",
        "5 variations IA/mois",
        { text: "Pas de séquences", disabled: true }
      ],
      buttonText: "Commencer Gratuitement",
      buttonVariant: "outline" as const
    },
    {
      name: "Starter",
      price: "49€",
      description: "par mois",
      features: [
        "100 leads/mois",
        "5 templates accessibles",
        "100 variations IA/mois",
        "Essai gratuit 14 jours"
      ],
      buttonText: "Essai Gratuit",
      buttonVariant: "default" as const
    },
    {
      name: "Pro",
      price: "99€",
      description: "par mois",
      features: [
        "400 leads/mois",
        "15 templates accessibles",
        "300 variations IA/mois",
        "Séquences 3 étapes"
      ],
      buttonText: "Commencer Pro",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Growth",
      price: "299€",
      description: "par mois",
      features: [
        "1500 leads/mois",
        "30 templates accessibles",
        "1000 variations IA/mois",
        "Séquences 5 étapes + A/B testing"
      ],
      buttonText: "Commencer Growth",
      buttonVariant: "secondary" as const
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Rocket className="h-8 w-8 text-primary mr-3" />
                <span className="text-xl font-bold text-gray-900">LeadPilot</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Tarifs</a>
              <Button variant="ghost" onClick={handleLogin}>Connexion</Button>
              <Button onClick={handleLogin}>Essai Gratuit</Button>
            </div>
            <div className="md:hidden">
              <Button variant="ghost" size="sm">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 to-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Génération de leads B2B{" "}
                <span className="text-primary">automatisée</span> avec IA
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Trouvez, qualifiez et convertissez vos prospects automatiquement. 
                30 templates d'emails, séquences multi-étapes et IA pour maximiser vos conversions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={handleLogin}>
                  Commencer Gratuitement
                </Button>
                <Button variant="outline" size="lg">
                  Voir la Démo
                </Button>
              </div>
              <div className="mt-8 flex items-center space-x-6 text-sm text-gray-600">
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
      <section id="features" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin pour générer des leads
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une plateforme complète qui automatise votre prospection de A à Z
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choisissez votre plan
            </h2>
            <p className="text-xl text-gray-600">
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-gray-900 mb-2">{plan.price}</div>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        {typeof feature === 'string' ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-emerald-500 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </>
                        ) : feature.disabled ? (
                          <>
                            <Lock className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                            <span className="text-gray-400">{feature.text}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 text-emerald-500 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{feature.text}</span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.buttonVariant}
                    onClick={handleLogin}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-600">
              💡 Facturation annuelle = 2 mois offerts (payer 10 mois au lieu de 12)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
