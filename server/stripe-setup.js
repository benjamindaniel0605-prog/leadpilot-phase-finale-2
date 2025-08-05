// Script pour créer les produits et prix Stripe
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY manquant');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createProducts() {
  try {
    console.log('🚀 Création des produits Stripe (mensuel + annuel)...');

    // Plan Starter
    const starterProduct = await stripe.products.create({
      name: 'LeadPilot Starter',
      description: '100 leads/mois, 5 templates, 100 variations IA, essai 14 jours'
    });

    const starterMonthly = await stripe.prices.create({
      unit_amount: 4900, // 49€ en centimes
      currency: 'eur',
      recurring: { interval: 'month' },
      product: starterProduct.id,
    });

    const starterYearly = await stripe.prices.create({
      unit_amount: 49000, // 490€ (10 mois au lieu de 12)
      currency: 'eur',
      recurring: { interval: 'year' },
      product: starterProduct.id,
    });

    console.log('✅ Starter mensuel:', starterMonthly.id);
    console.log('✅ Starter annuel:', starterYearly.id);

    // Plan Pro
    const proProduct = await stripe.products.create({
      name: 'LeadPilot Pro',
      description: '400 leads/mois, 15 templates, 300 variations IA, séquences 3 étapes, essai 14 jours'
    });

    const proMonthly = await stripe.prices.create({
      unit_amount: 9900, // 99€ en centimes
      currency: 'eur',
      recurring: { interval: 'month' },
      product: proProduct.id,
    });

    const proYearly = await stripe.prices.create({
      unit_amount: 99000, // 990€ (10 mois au lieu de 12)
      currency: 'eur',
      recurring: { interval: 'year' },
      product: proProduct.id,
    });

    console.log('✅ Pro mensuel:', proMonthly.id);
    console.log('✅ Pro annuel:', proYearly.id);

    // Plan Growth
    const growthProduct = await stripe.products.create({
      name: 'LeadPilot Growth',
      description: '1500 leads/mois, 30 templates, 1000 variations IA, séquences 5 étapes'
    });

    const growthMonthly = await stripe.prices.create({
      unit_amount: 29900, // 299€ en centimes
      currency: 'eur',
      recurring: { interval: 'month' },
      product: growthProduct.id,
    });

    const growthYearly = await stripe.prices.create({
      unit_amount: 299000, // 2990€ (10 mois au lieu de 12)
      currency: 'eur',
      recurring: { interval: 'year' },
      product: growthProduct.id,
    });

    console.log('✅ Growth mensuel:', growthMonthly.id);
    console.log('✅ Growth annuel:', growthYearly.id);

    console.log('\n📋 IDs des prix à utiliser:');
    console.log(`STRIPE_STARTER_MONTHLY_PRICE_ID=${starterMonthly.id}`);
    console.log(`STRIPE_STARTER_YEARLY_PRICE_ID=${starterYearly.id}`);
    console.log(`STRIPE_PRO_MONTHLY_PRICE_ID=${proMonthly.id}`);
    console.log(`STRIPE_PRO_YEARLY_PRICE_ID=${proYearly.id}`);
    console.log(`STRIPE_GROWTH_MONTHLY_PRICE_ID=${growthMonthly.id}`);
    console.log(`STRIPE_GROWTH_YEARLY_PRICE_ID=${growthYearly.id}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createProducts();