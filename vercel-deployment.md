# 🚀 Déploiement LeadPilot sur Vercel

## 📋 Prérequis

1. **Compte Vercel** : [vercel.com](https://vercel.com)
2. **Projet Supabase** configuré
3. **Compte Stripe** (mode test)
4. **Projet Google Cloud** pour OAuth

## 🔧 Configuration du Projet

### 1. Préparer le Projet

```bash
# Installer les dépendances
npm install

# Vérifier la configuration
npm run check-setup

# Build du projet
npm run build
```

### 2. Configuration Vercel

#### A. Créer un Projet Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur "New Project"
3. Importez votre repository GitHub
4. Configurez les paramètres :

```json
{
  "frameworkPreset": "node",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

#### B. Variables d'Environnement

Dans votre projet Vercel, ajoutez ces variables :

```bash
# Base de données Supabase
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=[ANON-KEY]

# Session
SESSION_SECRET=[GENERATED-SESSION-SECRET]

# Stripe
STRIPE_SECRET_KEY=sk_test_[YOUR-STRIPE-KEY]
STRIPE_WEBHOOK_SECRET=whsec_[YOUR-WEBHOOK-SECRET]

# Google OAuth
GOOGLE_CLIENT_ID=[GOOGLE-CLIENT-ID]
GOOGLE_CLIENT_SECRET=[GOOGLE-CLIENT-SECRET]

# Services optionnels
OPENAI_API_KEY=sk-[YOUR-OPENAI-KEY]
APOLLO_API_KEY=[YOUR-APOLLO-KEY]

# Environnement
NODE_ENV=production
```

### 3. Configuration des Domaines

#### A. Domaine Vercel

Votre projet sera accessible sur : `https://your-project.vercel.app`

#### B. Domaine Personnalisé (Optionnel)

1. Dans Vercel Dashboard > Settings > Domains
2. Ajoutez votre domaine personnalisé
3. Configurez les DNS selon les instructions

## 🔐 Configuration Post-Déploiement

### 1. Google OAuth

Une fois déployé, mettez à jour dans Google Cloud Console :

**URLs JavaScript autorisées :**
- `https://your-project.vercel.app`
- `https://your-domain.com` (si domaine personnalisé)

**URLs de redirection autorisées :**
- `https://your-project.vercel.app/api/oauth/google/callback`
- `https://your-domain.com/api/oauth/google/callback` (si domaine personnalisé)

### 2. Stripe Webhooks

Dans votre dashboard Stripe :

1. Allez dans "Developers" > "Webhooks"
2. Créez un endpoint : `https://your-project.vercel.app/api/stripe-webhook`
3. Sélectionnez les événements :
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
   - `checkout.session.completed`

### 3. Supabase Webhooks

Dans Supabase Dashboard > Settings > API :

1. **Webhook URL** : `https://your-project.vercel.app/api/supabase-webhook`
2. **Events** : `INSERT`, `UPDATE`, `DELETE`
3. **Tables** : `users`, `leads`, `campaigns`

## 🧪 Test du Déploiement

### 1. Test de l'Application

1. Allez sur votre URL Vercel
2. Testez l'inscription/connexion
3. Vérifiez les fonctionnalités principales

### 2. Test des Paiements

1. Connectez-vous
2. Allez dans "Upgrade"
3. Testez avec les cartes Stripe :
   - Succès : `4242 4242 4242 4242`
   - Échec : `4000 0000 0000 0002`

### 3. Test de Google OAuth

1. Configurez Google OAuth
2. Testez la connexion Gmail
3. Vérifiez l'envoi d'emails

## 📊 Monitoring

### Vercel Dashboard

- **Analytics** : Performance et utilisation
- **Functions** : Logs des API routes
- **Deployments** : Historique des déploiements

### Logs

```bash
# Voir les logs Vercel
vercel logs

# Logs en temps réel
vercel logs --follow
```

## 🔧 Scripts de Déploiement

### Déploiement Manuel

```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Déployer
vercel

# Déployer en production
vercel --prod
```

### Déploiement Automatique

1. Connectez votre repository GitHub à Vercel
2. Chaque push sur `main` déclenche un déploiement
3. Les pull requests créent des previews

## 🚀 Optimisations

### Performance

1. **Edge Functions** : Pour les API critiques
2. **CDN** : Images et assets statiques
3. **Caching** : Redis ou Vercel KV

### Sécurité

1. **CORS** : Configuré automatiquement
2. **Rate Limiting** : Via Vercel Edge Functions
3. **Environment Variables** : Sécurisées dans Vercel

## 📞 Support

### Vercel

- **Documentation** : [vercel.com/docs](https://vercel.com/docs)
- **Discord** : [discord.gg/vercel](https://discord.gg/vercel)
- **GitHub** : [github.com/vercel/vercel](https://github.com/vercel/vercel)

### Problèmes Courants

1. **Build Errors** : Vérifiez les logs de build
2. **Environment Variables** : Vérifiez dans Vercel Dashboard
3. **Database Connection** : Vérifiez `DATABASE_URL`
4. **CORS Errors** : Vérifiez les domaines autorisés

## 🎯 Prochaines Étapes

1. **Monitoring** : Configurez des alertes
2. **Analytics** : Intégrez Google Analytics
3. **SEO** : Optimisez pour les moteurs de recherche
4. **Performance** : Optimisez les temps de chargement
5. **Sécurité** : Audit de sécurité complet 