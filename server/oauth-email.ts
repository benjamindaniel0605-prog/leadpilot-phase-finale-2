import { google } from 'googleapis';
import type { Express } from 'express';
import { storage } from './storage';
import { isAuthenticated } from './replitAuth';

// Configuration Google OAuth
const getRedirectUri = () => {
  // En production Replit, utiliser l'URL replit
  if (process.env.REPLIT_DOMAINS) {
    const domain = process.env.REPLIT_DOMAINS.split(',')[0];
    return `https://${domain}/api/oauth/google/callback`;
  }
  // En développement local
  return process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/oauth/google/callback';
};

const googleOAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,  
  process.env.GOOGLE_CLIENT_SECRET,
  getRedirectUri()
);

export function setupOAuthRoutes(app: Express) {
  
  // Google OAuth - Démarrer l'authentification
  app.get('/api/oauth/google/auth', isAuthenticated, (req: any, res) => {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    const authUrl = googleOAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: req.user.claims.sub // ID utilisateur pour sécurité
    });

    res.json({ authUrl });
  });

  // Google OAuth - Callback
  app.get('/api/oauth/google/callback', async (req: any, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code || !state) {
        return res.status(400).json({ message: 'Code ou state manquant' });
      }

      // Récupérer les tokens
      const { tokens } = await googleOAuth2Client.getToken(code);
      googleOAuth2Client.setCredentials(tokens);

      // Récupérer l'email de l'utilisateur
      const oauth2 = google.oauth2({ version: 'v2', auth: googleOAuth2Client });
      const userInfo = await oauth2.userinfo.get();

      // Sauvegarder dans la base de données
      await storage.updateUserOAuthTokens(state, {
        provider: 'google',
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token || '',
        emailAddress: userInfo.data.email || ''
      });

      // Rediriger vers l'interface avec succès
      res.redirect('/?oauth=google&status=success');
      
    } catch (error) {
      console.error('Erreur OAuth Google callback:', error);
      res.redirect('/?oauth=google&status=error');
    }
  });

  // Déconnecter Google OAuth
  app.delete('/api/oauth/google/disconnect', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      await storage.updateUserOAuthTokens(userId, {
        provider: 'google',
        accessToken: '',
        refreshToken: '',
        emailAddress: ''
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Erreur déconnexion Google:', error);
      res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    }
  });

  // Statut des connexions OAuth
  app.get('/api/oauth/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const status = {
        google: {
          connected: !!(user?.googleEmailConnected && user?.googleEmailToken),
          email: user?.connectedEmailAddress || null
        }
      };

      res.json(status);
    } catch (error) {
      console.error('Erreur récupération statut OAuth:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération du statut' });
    }
  });
}

// Fonction helper pour obtenir un client Google authentifié
export async function getGoogleAuthClient(userId: string) {
  const user = await storage.getUser(userId);
  
  if (!user?.googleEmailToken || !user?.googleRefreshToken) {
    throw new Error('Utilisateur non connecté à Google');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getRedirectUri()
  );

  oauth2Client.setCredentials({
    access_token: user.googleEmailToken,
    refresh_token: user.googleRefreshToken
  });

  // Vérifier et renouveler le token si nécessaire
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);
    
    // Sauvegarder le nouveau token
    if (credentials.access_token) {
      await storage.updateUserOAuthTokens(userId, {
        provider: 'google',
        accessToken: credentials.access_token,
        refreshToken: credentials.refresh_token || user.googleRefreshToken,
        emailAddress: user.connectedEmailAddress || ''
      });
    }
  } catch (error) {
    console.error('Erreur renouvellement token Google:', error);
  }

  return oauth2Client;
}