import { google } from 'googleapis';
import { storage } from '../storage';

interface EmailData {
  to: string;
  subject: string;
  content: string;
  fromName?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  async sendEmail(userId: string, emailData: EmailData): Promise<EmailResult> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      // Envoyer via Google Gmail OAuth
      if (user.googleEmailConnected && user.googleEmailToken) {
        return await this.sendViaGoogle(user, emailData);
      } else {
        return { success: false, error: 'Connectez votre compte Gmail dans les paramètres pour envoyer des emails' };
      }
    } catch (error) {
      console.error('Erreur envoi email:', error);
      return { success: false, error: 'Erreur lors de l\'envoi' };
    }
  }

  private async sendViaGoogle(user: any, emailData: EmailData): Promise<EmailResult> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        access_token: user.googleEmailToken,
        refresh_token: user.googleRefreshToken,
      });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      // Créer le message email en format RFC 2822
      const emailLines = [
        `To: ${emailData.to}`,
        `From: ${emailData.fromName || user.firstName || 'LeadPilot'} <${user.connectedEmailAddress}>`,
        `Subject: ${emailData.subject}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        emailData.content
      ];

      const email = emailLines.join('\r\n');
      const encodedMessage = Buffer.from(email).toString('base64url');

      const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      return {
        success: true,
        messageId: result.data.id || undefined
      };
    } catch (error: any) {
      console.error('Erreur Gmail:', error);
      
      // Si le token a expiré, essayer de le renouveler
      if (error.code === 401) {
        try {
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
          );
          
          oauth2Client.setCredentials({
            refresh_token: user.googleRefreshToken,
          });

          const { credentials } = await oauth2Client.refreshAccessToken();
          
          // Mettre à jour le token en base
          await storage.updateUserOAuthTokens(user.id, {
            provider: 'google',
            accessToken: credentials.access_token!,
            refreshToken: credentials.refresh_token || user.googleRefreshToken,
            emailAddress: user.connectedEmailAddress
          });

          // Réessayer l'envoi avec le nouveau token
          const updatedUser = await storage.getUser(user.id);
          return await this.sendViaGoogle(updatedUser!, emailData);
          
        } catch (refreshError) {
          console.error('Erreur renouvellement token Google:', refreshError);
          return { success: false, error: 'Token Google expiré, reconnectez votre compte' };
        }
      }

      return { success: false, error: error.message };
    }
  }



  async sendCampaignEmails(userId: string, campaignId: string, leads: any[], emailContent: string, subject: string): Promise<{ sent: number; failed: number; errors: string[] }> {
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const lead of leads) {
      try {
        // Personnaliser le contenu
        let personalizedContent = emailContent
          .replace(/\[PRENOM\]/g, lead.firstName || lead.name || 'Bonjour')
          .replace(/\[NOM\]/g, lead.lastName || '')
          .replace(/\[ENTREPRISE\]/g, lead.company || '')
          .replace(/\[POSTE\]/g, lead.position || '');

        let personalizedSubject = subject
          .replace(/\[PRENOM\]/g, lead.firstName || lead.name || 'Bonjour')
          .replace(/\[ENTREPRISE\]/g, lead.company || '');

        const result = await this.sendEmail(userId, {
          to: lead.email,
          subject: personalizedSubject,
          content: personalizedContent,
          fromName: await this.getUserDisplayName(userId)
        });

        if (result.success) {
          results.sent++;
          
          // Enregistrer l'email envoyé dans la base
          await storage.createCampaignEmail({
            campaignId,
            leadId: lead.id,
            subject: personalizedSubject,
            content: personalizedContent,
            status: 'sent',
            sentAt: new Date()
          });
        } else {
          results.failed++;
          results.errors.push(`${lead.email}: ${result.error}`);
        }

        // Attendre 1 seconde entre les envois pour éviter les limites de taux
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${lead.email}: ${error.message}`);
      }
    }

    return results;
  }

  private async getUserDisplayName(userId: string): Promise<string> {
    const user = await storage.getUser(userId);
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.firstName || 'LeadPilot';
  }
}

export const emailService = new EmailService();