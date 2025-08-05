import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication } from '@azure/msal-node';
import type { Express } from 'express';
import { storage } from './storage';

// Configuration Google OAuth
const googleOAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/oauth/google/callback'
);

// Configuration Microsoft OAuth
const msalConfig = process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET ? {
  auth: {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    authority: 'https://login.microsoftonline.com/common'
  }
} : null;

const msalInstance = msalConfig ? new ConfidentialClientApplication(msalConfig) : null;

export function setupOAuthRoutes(app: Express) {
  
  // Google OAuth - Démarrer l'authentification
  app.get('/api/oauth/google/auth', (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

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
      console.error('Erreur Google OAuth:', error);
      res.redirect('/?oauth=google&status=error');
    }
  });

  // Microsoft OAuth - Démarrer l'authentification  
  app.get('/api/oauth/microsoft/auth', async (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    if (!msalInstance) {
      return res.status(500).json({ message: 'Microsoft OAuth non configuré' });
    }

    try {
      const authCodeUrlParameters = {
        scopes: ['https://graph.microsoft.com/Mail.Send', 'https://graph.microsoft.com/User.Read'],
        redirectUri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:5000/api/oauth/microsoft/callback',
        state: req.user.claims.sub
      };

      const response = await msalInstance.getAuthCodeUrl(authCodeUrlParameters);
      res.json({ authUrl: response });
      
    } catch (error) {
      console.error('Erreur Microsoft OAuth:', error);
      res.status(500).json({ message: 'Erreur lors de la génération de l\'URL d\'authentification' });
    }
  });

  // Microsoft OAuth - Callback
  app.get('/api/oauth/microsoft/callback', async (req: any, res) => {
    if (!msalInstance) {
      return res.redirect('/?oauth=microsoft&status=error');
    }

    try {
      const { code, state } = req.query;
      
      if (!code || !state) {
        return res.status(400).json({ message: 'Code ou state manquant' });
      }

      const tokenRequest = {
        code: code,
        scopes: ['https://graph.microsoft.com/Mail.Send', 'https://graph.microsoft.com/User.Read'],
        redirectUri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:5000/api/oauth/microsoft/callback',
      };

      const response = await msalInstance.acquireTokenByCode(tokenRequest);
      
      // Récupérer l'email de l'utilisateur via Microsoft Graph
      const graphClient = Client.init({
        authProvider: {
          getAccessToken: async () => response.accessToken
        }
      });

      const userInfo = await graphClient.api('/me').get();

      // Sauvegarder dans la base de données
      await storage.updateUserOAuthTokens(state, {
        provider: 'microsoft',
        accessToken: response.accessToken,
        refreshToken: response.refreshToken || '',
        emailAddress: userInfo.mail || userInfo.userPrincipalName || ''
      });

      // Rediriger vers l'interface avec succès
      res.redirect('/?oauth=microsoft&status=success');
      
    } catch (error) {
      console.error('Erreur Microsoft OAuth:', error);
      res.redirect('/?oauth=microsoft&status=error');
    }
  });

  // Déconnecter un compte email
  app.delete('/api/oauth/:provider/disconnect', async (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    try {
      const userId = req.user.claims.sub;
      const provider = req.params.provider;

      await storage.disconnectOAuthProvider(userId, provider);
      
      res.json({ message: `Compte ${provider} déconnecté avec succès` });
    } catch (error) {
      console.error('Erreur déconnexion OAuth:', error);
      res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    }
  });

  // Obtenir le statut des connexions OAuth
  app.get('/api/oauth/status', async (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      res.json({
        google: {
          connected: user.googleEmailConnected || false,
          email: user.googleEmailConnected ? user.connectedEmailAddress : null
        },
        microsoft: {
          connected: user.outlookEmailConnected || false,
          email: user.outlookEmailConnected ? user.connectedEmailAddress : null
        }
      });
    } catch (error) {
      console.error('Erreur statut OAuth:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération du statut' });
    }
  });
}

// Services d'envoi d'email
export class EmailService {
  
  static async sendEmailViaGoogle(accessToken: string, refreshToken: string, emailData: {
    to: string;
    subject: string;
    content: string;
    fromEmail: string;
  }) {
    try {
      googleOAuth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      const gmail = google.gmail({ version: 'v1', auth: googleOAuth2Client });
      
      const emailContent = [
        `To: ${emailData.to}`,
        `From: ${emailData.fromEmail}`,
        `Subject: ${emailData.subject}`,
        '',
        emailData.content
      ].join('\n');

      const encodedMessage = Buffer.from(emailContent).toString('base64url');

      const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage
        }
      });

      return { success: true, messageId: result.data.id };
    } catch (error) {
      console.error('Erreur envoi Gmail:', error);
      throw new Error('Échec de l\'envoi via Gmail');
    }
  }

  static async sendEmailViaMicrosoft(accessToken: string, emailData: {
    to: string;
    subject: string;
    content: string;
  }) {
    try {
      const graphClient = Client.init({
        authProvider: {
          getAccessToken: async () => accessToken
        }
      });

      const sendMail = {
        message: {
          subject: emailData.subject,
          body: {
            contentType: 'Text',
            content: emailData.content
          },
          toRecipients: [{
            emailAddress: {
              address: emailData.to
            }
          }]
        }
      };

      await graphClient.api('/me/sendMail').post(sendMail);
      
      return { success: true };
    } catch (error) {
      console.error('Erreur envoi Outlook:', error);
      throw new Error('Échec de l\'envoi via Outlook');
    }
  }
}