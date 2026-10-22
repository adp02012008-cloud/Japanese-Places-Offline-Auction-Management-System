import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function isSupabaseReady(): boolean {
  return Boolean(supabaseUrl && supabaseServiceKey && supabaseUrl.startsWith('https://'));
}

/**
 * Returns a privileged Supabase client with the service role key.
 * Used exclusively by server-side route handlers and database queries.
 */
export function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Supabase credentials missing! Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.'
    );
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}
