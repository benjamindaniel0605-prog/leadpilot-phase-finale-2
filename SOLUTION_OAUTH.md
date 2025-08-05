# Solution OAuth Google - Configuration Complète

## Problème identifié
L'erreur "accounts.google.com n'autorise pas la connexion" indique que votre projet Google Cloud Console actuel a des restrictions de domaine.

## SOLUTION RECOMMANDÉE : Créer un nouveau projet

### Étape 1 : Créer un nouveau projet Google
1. Allez sur [console.cloud.google.com](https://console.cloud.google.com)
2. Cliquez sur le sélecteur de projet (en haut)
3. Cliquez sur "NEW PROJECT"
4. Nom : "LeadPilot OAuth"
5. Cliquez sur "CREATE"

### Étape 2 : Activer les APIs nécessaires
1. Dans le nouveau projet, allez dans "APIs & Services" > "Library"
2. Cherchez et activez :
   - **Gmail API**
   - **Google+ API** (ou People API)

### Étape 3 : Configurer l'écran de consentement OAuth
1. Allez dans "APIs & Services" > "OAuth consent screen"
2. Choisissez "External" et cliquez "CREATE"
3. Remplissez :
   - App name: "LeadPilot"
   - User support email: votre email
   - Developer contact: votre email
4. Cliquez "SAVE AND CONTINUE"
5. Scopes : Cliquez "SAVE AND CONTINUE" (on ajoutera plus tard)
6. Test users : Ajoutez votre email Gmail
7. Cliquez "SAVE AND CONTINUE"

### Étape 4 : Créer les identifiants OAuth
1. Allez dans "APIs & Services" > "Credentials"
2. Cliquez "CREATE CREDENTIALS" > "OAuth 2.0 Client ID"
3. Type d'application : "Web application"
4. Nom : "LeadPilot Web Client"
5. **Authorized JavaScript origins** :
   ```
   https://92767425-60c5-42e8-8376-473b6077814a-00-3qeysuo8dr2t9.kirk.replit.dev
   ```
6. **Authorized redirect URIs** :
   ```
   https://92767425-60c5-42e8-8376-473b6077814a-00-3qeysuo8dr2t9.kirk.replit.dev/api/oauth/google/callback
   ```
7. Cliquez "CREATE"

### Étape 5 : Copier les nouvelles clés
1. Copiez le **Client ID** (commence par des chiffres, finit par .apps.googleusercontent.com)
2. Copiez le **Client Secret** (chaîne alphanumérique)
3. **IMPORTANT** : Fournissez ces deux clés à l'agent qui les configurera automatiquement

**Format des clés attendu :**
- GOOGLE_CLIENT_ID : `123456789-abc123def456.apps.googleusercontent.com`
- GOOGLE_CLIENT_SECRET : `GOCSPX-abc123def456ghi789`

### Étape 6 : Test
Une fois les nouvelles clés configurées, la connexion Gmail devrait fonctionner immédiatement !

## Alternative : Vérification projet existant
Si vous préférez garder votre projet existant :

1. Vérifiez que ces URLs EXACTES sont dans votre configuration :
   - JavaScript origins: `https://92767425-60c5-42e8-8376-473b6077814a-00-3qeysuo8dr2t9.kirk.replit.dev`
   - Redirect URIs: `https://92767425-60c5-42e8-8376-473b6077814a-00-3qeysuo8dr2t9.kirk.replit.dev/api/oauth/google/callback`

2. Attendez 10-15 minutes après modification pour que les changements se propagent

3. Vérifiez que Gmail API et Google+ API sont activées

## Vérification finale
Une fois configuré, testez sur : https://92767425-60c5-42e8-8376-473b6077814a-00-3qeysuo8dr2t9.kirk.replit.dev