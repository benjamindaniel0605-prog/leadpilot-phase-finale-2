# Configuration Google OAuth pour LeadPilot

## Problème actuel
L'erreur 403 "You do not have access to this page" indique que votre projet Google Cloud Console n'autorise pas l'URL de redirection Replit.

## URL de redirection requise
```
https://92767425-60c5-42e8-8376-473b6077814a-00-3qeysuo8dr2t9.kirk.replit.dev/api/oauth/google/callback
```

## Étapes de configuration

### 1. Créer/Configurer le projet Google Cloud Console

1. Allez sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez les APIs nécessaires :
   - Gmail API
   - Google+ API (pour les informations utilisateur)

### 2. Configurer les identifiants OAuth

1. Allez dans "APIs & Services" > "Credentials"
2. Cliquez sur "Create Credentials" > "OAuth 2.0 Client ID"
3. Choisissez "Web application"
4. Ajoutez dans "Authorized redirect URIs" :
   ```
   https://92767425-60c5-42e8-8376-473b6077814a-00-3qeysuo8dr2t9.kirk.replit.dev/api/oauth/google/callback
   ```
5. Copiez le Client ID et Client Secret

### 3. Mettre à jour les secrets Replit

Les secrets sont déjà configurés dans Replit :
- GOOGLE_CLIENT_ID : ✅ Configuré
- GOOGLE_CLIENT_SECRET : ✅ Configuré

### 4. Test de fonctionnement

Une fois configuré :
1. Allez dans Paramètres > Connexions Email
2. Cliquez sur "Connecter avec Google"
3. Autorisez l'accès Gmail
4. Créez une campagne et testez l'envoi

## Notes importantes

- L'URL de redirection change si le domaine Replit change
- Les APIs Gmail et Google+ doivent être activées
- Le projet doit être en mode "En production" pour éviter les limitations