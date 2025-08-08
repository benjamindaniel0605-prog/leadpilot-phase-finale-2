# 🚀 Guide de Configuration LeadPilot SaaS

## 📋 Prérequis

### 1. Base de données PostgreSQL
- Créer une base de données PostgreSQL
- Obtenir l'URL de connexion : `postgresql://username:password@host:port/database`

### 2. Compte Stripe (Mode Test)
- Créer un compte Stripe
- Obtenir les clés de test depuis le dashboard Stripe
- Configurer les webhooks

### 3. Google Cloud Console (pour OAuth)
- Créer un projet Google Cloud
- Activer l'API Gmail
- Configurer les identifiants OAuth

## 🔧 Configuration des Variables d'Environnement

### 1. Créer le fichier `.env`

Copiez le contenu de `env.example` et remplissez les valeurs :

```bash
# Base de données
DATABASE_URL=postgresql://username:password@localhost:5432/leadpilot

# Secret de session (générer avec: openssl rand -base64 32)
SESSION_SECRET=votre-secret-de-session-ici

# Port du serveur
PORT=5000

# Configuration Stripe (mode test)
STRIPE_SECRET_KEY=sk_test_votre-cle-secrete-stripe
STRIPE_WEBHOOK_SECRET=whsec_votre-secret-webhook

# Configuration Google OAuth
GOOGLE_CLIENT_ID=votre-client-id-google.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre-client-secret-google

# Services optionnels
OPENAI_API_KEY=sk-votre-cle-openai
APOLLO_API_KEY=votre-cle-apollo
```

### 2. Configuration pour le Développement Local

Pour le développement local, ajoutez :

```bash
NODE_ENV=development
```

## 🗄️ Configuration de la Base de Données

### 1. Créer les tables

```bash
npm run db:push
```

### 2. Vérifier la connexion

```bash
npm run dev
```

## 💳 Configuration Stripe

### 1. Créer les produits et prix dans Stripe

Dans votre dashboard Stripe (mode test) :

1. **Produit Starter**
   - Nom : "LeadPilot Starter"
   - Prix : 49€/mois, 490€/an

2. **Produit Pro**
   - Nom : "LeadPilot Pro"
   - Prix : 99€/mois, 990€/an

3. **Produit Growth**
   - Nom : "LeadPilot Growth"
   - Prix : 299€/mois, 2990€/an

### 2. Mettre à jour les IDs de prix

Dans `server/routes/payments.ts`, remplacez les IDs de prix par les vôtres :

```typescript
const STRIPE_PRICE_IDS = {
  starter_monthly: 'price_votre_id_starter_mensuel',
  starter_yearly: 'price_votre_id_starter_annuel',
  pro_monthly: 'price_votre_id_pro_mensuel',
  pro_yearly: 'price_votre_id_pro_annuel',
  growth_monthly: 'price_votre_id_growth_mensuel',
  growth_yearly: 'price_votre_id_growth_annuel'
};
```

### 3. Configurer le webhook Stripe

1. Dans le dashboard Stripe, allez dans "Developers" > "Webhooks"
2. Créez un endpoint : `https://votre-domaine.com/api/stripe-webhook`
3. Sélectionnez les événements :
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
4. Copiez le secret webhook dans votre `.env`

## 🔐 Configuration Google OAuth

### 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet
3. Activez l'API Gmail

### 2. Configurer les identifiants OAuth

1. Allez dans "APIs & Services" > "Credentials"
2. Cliquez sur "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configurez :
   - **Application type** : Web application
   - **Name** : LeadPilot
   - **Authorized JavaScript origins** :
     - `http://localhost:5000` (développement)
     - `https://votre-domaine.com` (production)
   - **Authorized redirect URIs** :
     - `http://localhost:5000/api/oauth/google/callback` (développement)
     - `https://votre-domaine.com/api/oauth/google/callback` (production)

### 3. Copier les identifiants

Copiez le Client ID et Client Secret dans votre `.env`

## 🚀 Déploiement

### 1. Déploiement sur Replit

1. Créez un nouveau Repl
2. Uploadez votre code
3. Configurez les variables d'environnement dans les secrets
4. Ajoutez une base de données PostgreSQL

### 2. Variables d'environnement pour Replit

```bash
# Configuration Replit
REPLIT_DOMAINS=votre-repl-name.votre-username.repl.co
REPL_ID=votre-repl-id

# Base de données
DATABASE_URL=postgresql://...

# Autres variables (comme dans .env)
```

### 3. URLs pour Google OAuth après déploiement

Une fois déployé, mettez à jour dans Google Cloud Console :

**URLs JavaScript autorisées :**
- `https://votre-repl-name.votre-username.repl.co`

**URLs de redirection autorisées :**
- `https://votre-repl-name.votre-username.repl.co/api/oauth/google/callback`

## 🧪 Test du Système

### 1. Test de l'authentification

1. Lancez le serveur : `npm run dev`
2. Allez sur `http://localhost:5000`
3. Cliquez sur "Se connecter"
4. Vous devriez être automatiquement connecté (mode développement)

### 2. Test des paiements Stripe

1. Connectez-vous
2. Allez dans "Upgrade"
3. Sélectionnez un plan
4. Testez avec les cartes de test Stripe :
   - Succès : `4242 4242 4242 4242`
   - Échec : `4000 0000 0000 0002`

### 3. Test de Google OAuth

1. Configurez Google OAuth
2. Allez dans "Paramètres" > "Connexions OAuth"
3. Cliquez sur "Connecter Google"
4. Autorisez l'application

## 🔧 Dépannage

### Problèmes courants

1. **Erreur de base de données**
   - Vérifiez `DATABASE_URL`
   - Lancez `npm run db:push`

2. **Erreur d'authentification**
   - Vérifiez `SESSION_SECRET`
   - En développement, utilisez `NODE_ENV=development`

3. **Erreur Stripe**
   - Vérifiez les clés Stripe
   - Vérifiez les IDs de prix
   - Vérifiez le webhook secret

4. **Erreur Google OAuth**
   - Vérifiez les URLs autorisées
   - Vérifiez les identifiants OAuth
   - Vérifiez les scopes

### Logs utiles

```bash
# Vérifier les logs du serveur
npm run dev

# Vérifier la base de données
npm run db:push

# Vérifier la configuration
node -e "console.log(process.env)"
```

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs du serveur
2. Vérifiez la configuration des variables d'environnement
3. Testez chaque service individuellement
4. Consultez la documentation des APIs (Stripe, Google)

## 🎯 Prochaines étapes

Une fois configuré :

1. Testez toutes les fonctionnalités
2. Configurez un domaine personnalisé
3. Passez en mode production Stripe
4. Configurez les emails de notification
5. Ajoutez des analytics 