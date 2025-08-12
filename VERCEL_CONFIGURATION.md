# 🚀 Configuration LeadPilot - Déploiement Vercel

## ✅ Informations de Déploiement

**URL de votre application :** `https://get-leadpilot.vercel.app`

## 🔧 Configuration des Variables d'Environnement Vercel

### 1. Aller dans le Dashboard Vercel
- Connectez-vous sur [vercel.com/dashboard](https://vercel.com/dashboard)
- Sélectionnez votre projet LeadPilot
- Allez dans **Settings** > **Environment Variables**

### 2. Ajouter les Variables d'Environnement

```bash
# Base de données Supabase
DATABASE_URL=postgresql://postgres.ghuifzsvtjafmykroivw:LeadPilot2025Secure@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
NEXT_PUBLIC_SUPABASE_URL=https://ghuifzsvtjafmykroivw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodWlmenN2dGphZm15a3JvaXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTgxODUsImV4cCI6MjA2OTg3NDE4NX0.ekmuogfgI6VuewDIlGnOWUf_vVWhP0D4fn-Ukfel4rw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodWlmenN2dGphZm15a3JvaXZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDI5ODE4NSwiZXhwIjoyMDY5ODc0MTg1fQ.d9JEFo9cSF0Hfnpf26-rx94qZ176o5MpUoPix3xJtD0

# Stripe
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=whsec_C8DcHXN1lhUaK6sq7BMNcgQmq482auJW

# Google OAuth
GOOGLE_CLIENT_ID=1013613006859-nttqu2jcmpjq2ukpnu2pb3tqh9ep5vvq.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://get-leadpilot.vercel.app/api/oauth/google/callback

# Services externes
OPENAI_API_KEY=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
APOLLO_API_KEY=xb2pDLrY3aHyutE1KyGrHw

# Application
NEXT_PUBLIC_APP_URL=https://get-leadpilot.vercel.app
NODE_ENV=production
```

## 🔐 Configuration Google OAuth

### 1. Aller dans Google Cloud Console
- Allez sur [console.cloud.google.com](https://console.cloud.google.com)
- Sélectionnez votre projet LeadPilot

### 2. Configurer les URLs Autorisées

Dans **APIs & Services** > **Credentials** > **OAuth 2.0 Client IDs** :

#### **Authorized JavaScript origins :**
```
https://get-leadpilot.vercel.app
```

#### **Authorized redirect URIs :**
```
https://get-leadpilot.vercel.app/api/oauth/google/callback
```

### 3. Vérifier les APIs Activées
- **Gmail API** ✅
- **Google+ API** (ou People API) ✅

## 💳 Configuration Stripe Webhooks

### 1. Aller dans le Dashboard Stripe
- Connectez-vous sur [stripe.com/dashboard](https://stripe.com/dashboard)
- Allez dans **Developers** > **Webhooks**

### 2. Créer le Webhook
- Cliquez sur **Add endpoint**
- **Endpoint URL :** `https://get-leadpilot.vercel.app/api/payments/webhook`

### 3. Sélectionner les Événements
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`

### 4. Webhook Secret
- **Secret déjà configuré :** `whsec_C8DcHXN1lhUaK6sq7BMNcgQmq482auJW`
- Ce secret est déjà ajouté dans les variables d'environnement Vercel

## 🎯 URLs de Redirection Stripe

### URLs de Succès de Paiement
Dans votre dashboard Stripe, configurez ces URLs de redirection :

- **Starter Monthly :** `https://get-leadpilot.vercel.app/payment-success?plan=starter&yearly=false`
- **Starter Yearly :** `https://get-leadpilot.vercel.app/payment-success?plan=starter&yearly=true`
- **Pro Monthly :** `https://get-leadpilot.vercel.app/payment-success?plan=pro&yearly=false`
- **Pro Yearly :** `https://get-leadpilot.vercel.app/payment-success?plan=pro&yearly=true`
- **Growth Monthly :** `https://get-leadpilot.vercel.app/payment-success?plan=growth&yearly=false`
- **Growth Yearly :** `https://get-leadpilot.vercel.app/payment-success?plan=growth&yearly=true`

## 🧪 Test de la Configuration

### 1. Test de l'Application
- Allez sur : `https://get-leadpilot.vercel.app`
- Testez l'inscription/connexion
- Vérifiez que l'interface se charge correctement

### 2. Test de Google OAuth
- Connectez-vous à l'application
- Allez dans **Paramètres** > **Connexions Email**
- Cliquez sur **Connecter avec Google**
- Vérifiez que l'authentification fonctionne

### 3. Test des Paiements Stripe
- Connectez-vous à l'application
- Allez dans **Upgrade**
- Sélectionnez un plan
- Testez avec les cartes de test Stripe :
  - **Succès :** `4242 4242 4242 4242`
  - **Échec :** `4000 0000 0000 0002`

## 🔍 Vérification des Logs

### Logs Vercel
- Allez dans votre dashboard Vercel
- **Functions** > Sélectionnez votre projet
- Vérifiez les logs des API routes

### Logs Stripe
- Dashboard Stripe > **Developers** > **Webhooks**
- Cliquez sur votre webhook
- Vérifiez les tentatives de livraison

## ✅ Checklist de Configuration

- [ ] Variables d'environnement configurées dans Vercel
- [ ] URLs Google OAuth mises à jour
- [ ] Webhook Stripe configuré
- [ ] URLs de redirection Stripe configurées
- [ ] Test de l'application réussi
- [ ] Test de Google OAuth réussi
- [ ] Test des paiements réussi

## 🆘 Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs Vercel** dans le dashboard
2. **Vérifiez les logs Stripe** dans le dashboard webhooks
3. **Vérifiez la configuration Google OAuth** dans Google Cloud Console
4. **Testez les variables d'environnement** en redéployant

**Votre application LeadPilot est maintenant configurée et prête à être utilisée !** 🎉

