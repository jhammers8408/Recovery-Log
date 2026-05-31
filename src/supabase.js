import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://agwzcqqalhpdedbjkfgw.supabase.co'
const supabaseKey = 'YOUR_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'rl-auth-token',
    storage: {
      getItem: (key) => {
        try {
          const cookies = document.cookie.split(';')
          const cookie = cookies.find(c => c.trim().startsWith(key + '='))
          return cookie ? decodeURIComponent(cookie.split('=')[1]) : null
        } catch {
          return null
        }
      },
      setItem: (key, value) => {
        try {
          const expires = new Date()
          expires.setDate(expires.getDate() + 30)
          document.cookie = `${key}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`
        } catch {}
      },
      removeItem: (key) => {
        try {
          document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
        } catch {}
      }
    }
  }
})