import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos do banco de dados
export interface User {
  id: string
  email: string
  created_at: string
  full_name?: string
  avatar_url?: string
}

export interface GameSession {
  id: string
  user_id: string
  game_id: string
  score: number
  duration: number
  accuracy: number
  created_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  total_points: number
  games_played: number
  level: number
  streak: number
  achievements: string[]
  updated_at: string
}

export interface WeeklyChallenge {
  id: string
  user_id: string
  title: string
  description: string
  completed: boolean
  completed_at?: string
  created_at: string
}
