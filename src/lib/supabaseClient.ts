import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as
  | string
  | undefined

let supabase: SupabaseClient | null = null

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    if (!supabaseUrl || !supabaseRoleKey) {
      throw new Error(
        'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY.',
      )
    }
    supabase = createClient(supabaseUrl, supabaseRoleKey)
  }
  return supabase
}
