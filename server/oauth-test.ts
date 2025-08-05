// Test direct OAuth pour diagnostic
import { google } from 'googleapis';

export function testOAuthConfig() {
  const redirectUri = process.env.REPLIT_DOMAINS 
    ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/api/oauth/google/callback`
    : 'http://localhost:5000/api/oauth/google/callback';

  console.log('🔧 Test OAuth Configuration:');
  console.log('- Client ID:', process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...');
  console.log('- Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Configuré ✅' : 'Manquant ❌');
  console.log('- Redirect URI:', redirectUri);
  
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const testUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/userinfo.email'],
      prompt: 'consent',
      state: 'test-123'
    });

    console.log('✅ OAuth URL générée avec succès');
    console.log('🔗 URL de test:', testUrl);
    return testUrl;
  } catch (error) {
    console.error('❌ Erreur génération OAuth:', error);
    return null;
  }
}