# 🚀 LeadPilot SaaS - Next.js + Vercel

## 📋 Configuration Requise

### Variables d'environnement à configurer dans Vercel :

```bash
# Base de données Supabase
DATABASE_URL=postgresql://postgres.ghuifzsvtjafmykroivw:LeadPilot2025Secure@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
NEXT_PUBLIC_SUPABASE_URL=https://ghuifzsvtjafmykroivw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodWlmenN2dGphZm15a3JvaXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTgxODUsImV4cCI6MjA2OTg3NDE4NX0.ekmuogfgI6VuewDIlGnOWUf_vVWhP0D4fn-Ukfel4rw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodWlmenN2dGphZm15a3JvaXZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDI5ODE4NSwiZXhwIjoyMDY5ODc0MTg1fQ.d9JEFo9cSF0Hfnpf26-rx94qZ176o5MpUoPix3xJtD0

# Stripe
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=[À AJOUTER APRÈS DÉPLOIEMENT]

# Google OAuth
GOOGLE_CLIENT_ID=1013613006859-nttqu2jcmpjq2ukpnu2pb3tqh9ep5vvq.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/api/oauth/google/callback

# Services externes
OPENAI_API_KEY=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
APOLLO_API_KEY=xb2pDLrY3aHyutE1KyGrHw

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

## 🚀 Déploiement

### 1. Installer Vercel CLI
```bash
npm i -g vercel
```

### 2. Se connecter à Vercel
```bash
vercel login
```

### 3. Déployer
```bash
vercel --prod
```

### 4. Configurer les variables d'environnement
- Aller sur [vercel.com/dashboard](https://vercel.com/dashboard)
- Sélectionner votre projet
- Aller dans Settings > Environment Variables
- Ajouter toutes les variables ci-dessus

## 🔧 Configuration Post-Déploiement

### 1. Stripe Webhooks
- Aller sur [stripe.com/dashboard](https://stripe.com/dashboard)
- Webhooks > Add endpoint
- URL : `https://your-domain.vercel.app/api/payments/webhook`
- Events : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Copier le webhook secret et l'ajouter dans `STRIPE_WEBHOOK_SECRET`

### 2. Google OAuth
- Aller sur [console.cloud.google.com](https://console.cloud.google.com)
- Créer un projet (si pas déjà fait)
- Activer l'API Gmail
- Créer des identifiants OAuth 2.0
- URLs autorisées :
  - JavaScript : `https://your-domain.vercel.app`
  - Redirection : `https://your-domain.vercel.app/api/oauth/google/callback`

## 📁 Structure du Projet

```
src/
├── app/                    # App Router Next.js
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentification
│   │   ├── leads/         # Gestion des leads
│   │   ├── payments/      # Paiements Stripe
│   │   └── oauth/         # Google OAuth
│   ├── (auth)/            # Routes protégées
│   ├── globals.css        # Styles globaux
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── lib/                   # Utilitaires
│   ├── supabase.ts        # Configuration Supabase
│   ├── stripe.ts          # Configuration Stripe
│   ├── database.ts        # Configuration DB
│   └── schema.ts          # Schéma DB
└── components/            # Composants réutilisables
```

## 🎯 Fonctionnalités

### ✅ Implémentées
- ✅ Authentification Supabase
- ✅ API Routes Next.js
- ✅ Paiements Stripe
- ✅ Base de données PostgreSQL
- ✅ Page de succès de paiement
- ✅ Design moderne avec Tailwind CSS

### 🔧 À configurer après déploiement
- 🔧 Webhooks Stripe
- 🔧 Google OAuth
- 🔧 Variables d'environnement Vercel

## 🚀 URLs de Redirection Stripe

Après déploiement, configurer dans Stripe Dashboard :

**URLs de succès :**
- Starter Monthly : `https://your-domain.vercel.app/payment-success?plan=starter&yearly=false`
- Starter Yearly : `https://your-domain.vercel.app/payment-success?plan=starter&yearly=true`
- Pro Monthly : `https://your-domain.vercel.app/payment-success?plan=pro&yearly=false`
- Pro Yearly : `https://your-domain.vercel.app/payment-success?plan=pro&yearly=true`
- Growth Monthly : `https://your-domain.vercel.app/payment-success?plan=growth&yearly=false`
- Growth Yearly : `https://your-domain.vercel.app/payment-success?plan=growth&yearly=true`

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs Vercel
2. Vérifier les variables d'environnement
3. Tester les webhooks Stripe
4. Vérifier la configuration Google OAuth

**Le projet est maintenant prêt pour le déploiement !** 🎉 