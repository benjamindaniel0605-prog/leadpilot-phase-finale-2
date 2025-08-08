# 🗄️ Configuration Supabase pour LeadPilot

## 📋 Étapes de Configuration

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre `Project Reference` et `Database Password`

### 2. Configuration de la Base de Données

#### Variables d'environnement Supabase

Dans votre fichier `.env`, configurez :

```bash
# Base de données Supabase
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# URL Supabase
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co

# Clé anonyme Supabase
SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### Créer les Tables

1. **Via l'interface Supabase** :
   - Allez dans "Table Editor"
   - Créez les tables selon le schéma dans `shared/schema.ts`

2. **Via SQL** :
   ```sql
   -- Copiez et exécutez le SQL généré par Drizzle
   npm run db:push
   ```

### 3. Configuration des RLS (Row Level Security)

Activez RLS sur toutes les tables et configurez les politiques :

```sql
-- Exemple pour la table users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id);
```

### 4. Configuration des Webhooks

Dans Supabase Dashboard > Settings > API :

1. **Webhook URL** : `https://your-domain.vercel.app/api/supabase-webhook`
2. **Events** : `INSERT`, `UPDATE`, `DELETE`
3. **Tables** : `users`, `leads`, `campaigns`

## 🔧 Scripts Utiles

### Vérifier la Connexion

```bash
npm run check-setup
```

### Migrations

```bash
# Générer les migrations
npm run db:generate

# Appliquer les migrations
npm run db:push
```

### Reset de la Base

```bash
# Supprimer toutes les tables
npm run db:drop

# Recréer les tables
npm run db:push
```

## 📊 Monitoring

### Supabase Dashboard

- **Database** : Voir les tables et données
- **Auth** : Gérer les utilisateurs
- **Storage** : Fichiers uploadés
- **Edge Functions** : Fonctions serverless

### Logs

```bash
# Voir les logs Supabase
supabase logs
```

## 🔐 Sécurité

### Variables d'Environnement

- `DATABASE_URL` : URL de connexion PostgreSQL
- `SUPABASE_URL` : URL de votre projet
- `SUPABASE_ANON_KEY` : Clé publique (sécurisée)
- `SUPABASE_SERVICE_ROLE_KEY` : Clé privée (très sécurisée)

### RLS (Row Level Security)

Toutes les tables doivent avoir RLS activé avec des politiques appropriées.

## 🚀 Déploiement

### Variables d'Environnement Vercel

Dans votre projet Vercel, ajoutez ces variables :

```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=[ANON-KEY]
SESSION_SECRET=[SESSION-SECRET]
STRIPE_SECRET_KEY=[STRIPE-KEY]
STRIPE_WEBHOOK_SECRET=[WEBHOOK-SECRET]
GOOGLE_CLIENT_ID=[GOOGLE-CLIENT-ID]
GOOGLE_CLIENT_SECRET=[GOOGLE-CLIENT-SECRET]
```

### URLs pour Google OAuth

Une fois déployé sur Vercel, configurez dans Google Cloud Console :

- **URL JavaScript autorisée** : `https://your-domain.vercel.app`
- **URL de redirection OAuth** : `https://your-domain.vercel.app/api/oauth/google/callback`
- **Webhook Stripe** : `https://your-domain.vercel.app/api/stripe-webhook`

## 📞 Support

- **Documentation Supabase** : [supabase.com/docs](https://supabase.com/docs)
- **Discord Supabase** : [discord.gg/supabase](https://discord.gg/supabase)
- **GitHub Issues** : [github.com/supabase/supabase](https://github.com/supabase/supabase) 