import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/database'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Signature manquante' },
      { status: 400 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Erreur webhook:', error)
    return NextResponse.json(
      { error: 'Signature invalide' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as any
        
        // Mettre à jour l'utilisateur avec les informations Stripe
        await db.update(users)
          .set({
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            plan: session.metadata.plan,
            updatedAt: new Date(),
          })
          .where(eq(users.id, session.metadata.userId))

        console.log(`✅ Abonnement créé pour l'utilisateur ${session.metadata.userId}`)
        break

      case 'customer.subscription.updated':
        const subscription = event.data.object as any
        
        // Mettre à jour le plan de l'utilisateur
        await db.update(users)
          .set({
            plan: subscription.metadata.plan || 'pro',
            updatedAt: new Date(),
          })
          .where(eq(users.stripeSubscriptionId, subscription.id))

        console.log(`✅ Abonnement mis à jour: ${subscription.id}`)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as any
        
        // Réinitialiser le plan de l'utilisateur
        await db.update(users)
          .set({
            plan: 'free',
            stripeSubscriptionId: null,
            updatedAt: new Date(),
          })
          .where(eq(users.stripeSubscriptionId, deletedSubscription.id))

        console.log(`✅ Abonnement supprimé: ${deletedSubscription.id}`)
        break

      default:
        console.log(`⚠️ Événement non géré: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erreur traitement webhook:', error)
    return NextResponse.json(
      { error: 'Erreur traitement webhook' },
      { status: 500 }
    )
  }
}


