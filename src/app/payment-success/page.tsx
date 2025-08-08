'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Star, Zap, TrendingUp, ArrowRight } from 'lucide-react'

interface PlanDetails {
  name: string
  price: string
  features: string[]
  icon: React.ReactNode
  color: string
}

const planDetails: Record<string, PlanDetails> = {
  starter: {
    name: 'LeadPilot Starter',
    price: '49€/mois',
    features: [
      'Jusqu\'à 100 leads par mois',
      'Scoring IA basique',
      'Templates d\'emails',
      'Support email'
    ],
    icon: <Star className="w-8 h-8" />,
    color: 'bg-blue-500'
  },
  pro: {
    name: 'LeadPilot Pro',
    price: '99€/mois',
    features: [
      'Jusqu\'à 500 leads par mois',
      'Scoring IA avancé',
      'Intégration Gmail',
      'Analytics détaillés',
      'Support prioritaire'
    ],
    icon: <Zap className="w-8 h-8" />,
    color: 'bg-purple-500'
  },
  growth: {
    name: 'LeadPilot Growth',
    price: '299€/mois',
    features: [
      'Leads illimités',
      'Scoring IA premium',
      'Intégrations avancées',
      'API personnalisée',
      'Manager de compte dédié',
      'Formation personnalisée'
    ],
    icon: <TrendingUp className="w-8 h-8" />,
    color: 'bg-green-500'
  }
}

export default function PaymentSuccess() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const [plan, setPlan] = useState<string>('starter')
  const [isYearly, setIsYearly] = useState(false)

  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const planParam = searchParams.get('plan') || 'starter'
    const yearlyParam = searchParams.get('yearly') === 'true'
    
    setPlan(planParam)
    setIsYearly(yearlyParam)

    // Compte à rebours pour redirection automatique
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [searchParams, router])

  const planInfo = planDetails[plan] || planDetails.starter
  const price = isYearly ? planInfo.price.replace('/mois', '/an') : planInfo.price

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header avec animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Paiement réussi !
          </h1>
          <p className="text-gray-600 text-lg">
            Votre abonnement a été activé avec succès
          </p>
        </div>

        {/* Détails de l'abonnement */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${planInfo.color} text-white`}>
                {planInfo.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {planInfo.name}
                </h2>
                <p className="text-gray-600">
                  {isYearly ? 'Abonnement annuel' : 'Abonnement mensuel'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{price}</p>
              {isYearly && (
                <p className="text-sm text-green-600 font-medium">
                  Économisez 2 mois !
                </p>
              )}
            </div>
          </div>

          {/* Fonctionnalités incluses */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">
              Fonctionnalités incluses :
            </h3>
            {planInfo.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>Accéder à mon dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <p className="text-center text-gray-500 text-sm">
            Redirection automatique dans {countdown} seconde{countdown > 1 ? 's' : ''}...
          </p>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Support</h4>
              <p className="text-sm text-gray-600">
                Notre équipe est là pour vous aider
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Sécurité</h4>
              <p className="text-sm text-gray-600">
                Vos données sont protégées
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Facturation</h4>
              <p className="text-sm text-gray-600">
                Prochaine facturation dans {isYearly ? '12 mois' : '1 mois'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


