import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://agwzcqqalhpdedbjkfgw.supabase.co'
const supabaseKey = 'YOUR_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  }
})
