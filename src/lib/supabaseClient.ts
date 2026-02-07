import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined

let supabase: SupabaseClient | null = null

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      )
    }
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabase
}
