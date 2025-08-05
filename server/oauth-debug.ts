import type { Express } from 'express';
import { isAuthenticated } from './replitAuth';

export function setupOAuthDebug(app: Express) {
  // Route de diagnostic OAuth
  app.get('/api/oauth/debug', isAuthenticated, (req: any, res) => {
    const domain = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
    const redirectUri = `https://${domain}/api/oauth/google/callback`;
    
    const debugInfo = {
      domain,
      redirectUri,
      clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
      clientSecretConfigured: !!process.env.GOOGLE_CLIENT_SECRET,
      manualOAuthUrl: `https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.send%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&prompt=consent&include_granted_scopes=true&response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${req.user.claims.sub}`,
      googleCloudConsoleSteps: [
        '1. Allez sur console.cloud.google.com',
        '2. APIs & Services > Credentials',
        '3. Modifiez votre OAuth 2.0 Client ID',
        `4. Ajoutez dans "Authorized JavaScript origins": https://${domain}`,
        `5. Ajoutez dans "Authorized redirect URIs": ${redirectUri}`,
        '6. Sauvegardez et attendez 5-10 minutes'
      ]
    };
    
    res.json(debugInfo);
  });

  // Route de test manuel OAuth
  app.get('/api/oauth/manual-test', isAuthenticated, (req: any, res) => {
    const domain = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
    const redirectUri = `https://${domain}/api/oauth/google/callback`;
    
    const manualUrl = `https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.send%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&prompt=consent&include_granted_scopes=true&response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${req.user.claims.sub}`;
    
    res.redirect(manualUrl);
  });
}