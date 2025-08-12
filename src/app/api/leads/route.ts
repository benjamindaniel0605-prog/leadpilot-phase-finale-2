import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/database'
import { leads } from '../../../lib/schema'
import { eq } from 'drizzle-orm'

// GET - Récupérer les leads de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer les leads de l'utilisateur
    const userLeads = await db.select().from(leads).where(eq(leads.userId, user.id))

    return NextResponse.json({ leads: userLeads })
  } catch (error) {
    console.error('Erreur récupération leads:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des leads' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau lead
export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, company, sector, position, notes } = await request.json()
    const cookieStore = cookies()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Créer le lead
    const [newLead] = await db.insert(leads).values({
      userId: user.id,
      firstName,
      lastName,
      email,
      company,
      sector,
      position,
      notes,
      status: 'new',
      source: 'manual',
    }).returning()

    return NextResponse.json({ lead: newLead })
  } catch (error) {
    console.error('Erreur création lead:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du lead' },
      { status: 500 }
    )
  }
}


