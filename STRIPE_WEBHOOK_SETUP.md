# Configuration des Webhooks Stripe pour LeadPilot

## Pourquoi configurer les webhooks ?

Les webhooks Stripe permettent à votre application de recevoir automatiquement des notifications lorsque des événements se produisent dans Stripe (paiements réussis, abonnements créés, etc.). C'est essentiel pour mettre à jour automatiquement le plan d'abonnement de l'utilisateur après un paiement.

## Étapes de configuration

### 1. Déployer d'abord votre application
- Cliquez sur "Deploy" dans Replit pour obtenir votre URL de production
- Notez l'URL de votre application déployée (ex: `https://votre-app.replit.app`)

### 2. Configurer le webhook dans Stripe Dashboard

1. **Aller dans le Dashboard Stripe** : https://dashboard.stripe.com/webhooks
2. **Cliquer sur "Add endpoint"**
3. **URL du endpoint** : `https://votre-app.replit.app/api/stripe/webhook`
4. **Événements à écouter** :
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 3. Récupérer la clé secrète du webhook
1. Après avoir créé le webhook, cliquez dessus
2. Dans la section "Signing secret", cliquez sur "Reveal"
3. Copiez cette clé (commence par `whsec_`)
4. **Important** : Ajoutez cette clé comme secret dans Replit avec le nom `STRIPE_WEBHOOK_SECRET`

### 4. Test du webhook
- Stripe fournit un outil de test dans le dashboard
- Vous pouvez également tester avec un vrai paiement en mode test

## Configuration OAuth Google (après déploiement)

Une fois l'application déployée :

1. **Google Cloud Console** : https://console.cloud.google.com/
2. **APIs & Services > Credentials**
3. **Modifier votre OAuth client ID**
4. **Authorized redirect URIs** : Ajouter `https://votre-app.replit.app/auth/google/callback`

## Vérification

Après configuration :
- ✅ Les paiements Stripe mettent automatiquement à jour le plan utilisateur
- ✅ L'authentification Google fonctionne en production
- ✅ Les utilisateurs sont automatiquement redirigés vers la bonne page de succès

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans le dashboard Stripe (section Webhooks)
2. Vérifiez que l'URL du webhook est correcte
3. Assurez-vous que `STRIPE_WEBHOOK_SECRET` est bien configuré dans les secrets Replit