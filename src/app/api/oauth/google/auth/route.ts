import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification de l'utilisateur
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ error: 'Utilisateur non authentifié' }, { status: 401 })
    }

    // Configuration OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'https://get-leadpilot.vercel.app/api/oauth/google/callback'
    )

    // Scopes nécessaires pour Gmail
    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email'
    ]

    // Générer l'URL d'authentification
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      include_granted_scopes: true,
      state: user.id // Utiliser l'ID utilisateur comme state
    })

    console.log(`🔐 OAuth request for user: ${user.id}`)

    return NextResponse.json({ authUrl })

  } catch (error) {
    console.error('❌ OAuth error:', error)
    return NextResponse.json(
      { error: 'Configuration OAuth échouée' },
      { status: 500 }
    )
  }
}

