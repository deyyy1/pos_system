import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY

console.log(
  'Supabase URL:',
  supabaseUrl
)

console.log(
  'Supabase Key exists:',
  !!supabaseAnonKey
)

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      /*
       * Keep the authenticated session
       * available across page reloads
       * and devices when the user logs in.
       */
      persistSession: true,

      /*
       * Automatically refresh the Supabase
       * access token when necessary.
       */
      autoRefreshToken: true,

      /*
       * Allow Supabase to process the
       * OAuth callback after Google redirects
       * the browser back to the application.
       */
      detectSessionInUrl: true,
    },
  }
)