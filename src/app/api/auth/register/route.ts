import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../../lib/database'
import { users } from '../../../../lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()
    const cookieStore = cookies()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (authData.user) {
      // Créer l'utilisateur dans notre base de données
      const [user] = await db.insert(users).values({
        id: authData.user.id,
        email: authData.user.email!,
        firstName,
        lastName,
        plan: 'free',
      }).returning()

      return NextResponse.json({
        user,
        session: authData.session,
      })
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}


