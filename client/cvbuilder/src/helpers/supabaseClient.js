import { createClient } from '@supabase/supabase-js';

/**
 * WHAT: Initializes Supabase client for authentication and database operations
 * INPUT: None (reads from environment variables)
 * OUTPUT: Configured Supabase client instance
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
