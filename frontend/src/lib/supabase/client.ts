/**
 * Supabase Browser Client
 * For use in client components
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton instance for client-side usage
let clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseClient() {
  if (!clientInstance) {
    clientInstance = createClient()
  }
  return clientInstance
}

// Export for convenience
export const supabase = typeof window !== 'undefined' ? createClient() : null
