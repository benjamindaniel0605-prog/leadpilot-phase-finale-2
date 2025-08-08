import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour l'authentification
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  profileImageUrl?: string
  plan: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  leadsUsed: number
  aiVariationsUsed: number
  googleEmailConnected: boolean
  outlookEmailConnected: boolean
  connectedEmailAddress?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  loading: boolean
}


