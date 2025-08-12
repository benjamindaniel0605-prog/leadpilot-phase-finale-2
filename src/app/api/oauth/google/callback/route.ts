export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { db } from '@/lib/database'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  console.log(`📥 OAuth callback received - Code: ${!!code}, State: ${state}, Error: ${error}`)

  if (error) {
    console.error('❌ OAuth error from Google:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?oauth=google&status=error&reason=access_denied`
    )
  }

  if (!code || !state) {
    console.error('❌ Missing code or state in callback')
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?oauth=google&status=error&reason=missing_params`
    )
  }

  try {
    // Configuration OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'https://get-leadpilot.vercel.app/api/oauth/google/callback'
    )

    // Échanger le code contre des tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Récupérer les informations de l'utilisateur
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const userInfo = await oauth2.userinfo.get()

    console.log(`✅ OAuth success for user: ${state}, email: ${userInfo.data.email}`)

    // Mettre à jour l'utilisateur dans la base de données
    await db.update(users)
      .set({
        googleEmailToken: tokens.access_token || '',
        googleRefreshToken: tokens.refresh_token || '',
        connectedEmailAddress: userInfo.data.email || '',
        googleEmailConnected: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, state))

    // Rediriger vers le dashboard avec succès
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?oauth=google&status=success`
    )

  } catch (error) {
    console.error('❌ OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?oauth=google&status=error&reason=server_error`
    )
  }
}
