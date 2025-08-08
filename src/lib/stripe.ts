import Stripe from 'stripe'

// Configuration Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// IDs des produits Stripe (fournis par l'utilisateur)
export const STRIPE_PRODUCT_IDS = {
  starter_monthly: 'prod_SpCbKLQ1sZ6H6Z',
  starter_yearly: 'prod_SpCcxIOKwQWk13',
  pro_monthly: 'prod_SpCfDKSrwoD1Ps',
  pro_yearly: 'prod_SpCghZUmmJzWJ9',
  growth_monthly: 'prod_SpChKR7EbDQJ7C',
  growth_yearly: 'prod_SpCiuTrFalDd34'
}

// Mapping des plans vers les produits
export const PLAN_TO_PRODUCT_MAPPING = {
  'starter': {
    monthly: STRIPE_PRODUCT_IDS.starter_monthly,
    yearly: STRIPE_PRODUCT_IDS.starter_yearly,
    price: { monthly: 49, yearly: 490 },
    features: [
      'Jusqu\'à 100 leads par mois',
      'Scoring IA basique',
      'Templates d\'emails',
      'Support email'
    ]
  },
  'pro': {
    monthly: STRIPE_PRODUCT_IDS.pro_monthly,
    yearly: STRIPE_PRODUCT_IDS.pro_yearly,
    price: { monthly: 99, yearly: 990 },
    features: [
      'Jusqu\'à 500 leads par mois',
      'Scoring IA avancé',
      'Intégration Gmail',
      'Analytics détaillés',
      'Support prioritaire'
    ]
  },
  'growth': {
    monthly: STRIPE_PRODUCT_IDS.growth_monthly,
    yearly: STRIPE_PRODUCT_IDS.growth_yearly,
    price: { monthly: 299, yearly: 2990 },
    features: [
      'Leads illimités',
      'Scoring IA premium',
      'Intégrations avancées',
      'API personnalisée',
      'Manager de compte dédié',
      'Formation personnalisée'
    ]
  }
}

// Fonction pour créer un checkout session
export async function createCheckoutSession({
  plan,
  isYearly,
  userId,
  successUrl,
  cancelUrl
}: {
  plan: string
  isYearly: boolean
  userId: string
  successUrl: string
  cancelUrl: string
}) {
  const productId = isYearly 
    ? PLAN_TO_PRODUCT_MAPPING[plan as keyof typeof PLAN_TO_PRODUCT_MAPPING]?.yearly
    : PLAN_TO_PRODUCT_MAPPING[plan as keyof typeof PLAN_TO_PRODUCT_MAPPING]?.monthly

  if (!productId) {
    throw new Error(`Plan ${plan} non trouvé`)
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product: productId,
          unit_amount: isYearly 
            ? PLAN_TO_PRODUCT_MAPPING[plan as keyof typeof PLAN_TO_PRODUCT_MAPPING]?.price.yearly! * 100
            : PLAN_TO_PRODUCT_MAPPING[plan as keyof typeof PLAN_TO_PRODUCT_MAPPING]?.price.monthly! * 100,
          recurring: {
            interval: isYearly ? 'year' : 'month',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      plan,
      isYearly: isYearly.toString(),
    },
  })

  return session
}


