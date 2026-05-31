import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://agwzcqqalhpdedbjkfgw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnd3pjcXFhbGhwZGVkYmprZmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5OTczOTcsImV4cCI6MjA5NTU3MzM5N30.WFum2jf9JTs4036El4z3ajxteNrdoWW0LuOn-9LcsgY'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
})