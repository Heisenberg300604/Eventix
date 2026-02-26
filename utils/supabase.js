
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Debug: Check if environment variables are loaded
console.log('🔍 Supabase Config Check:');
console.log('URL:', supabaseUrl);
console.log('Key (first 20 chars):', supabaseKey?.substring(0, 20));
console.log('Key starts with eyJ (correct format):', supabaseKey?.startsWith('eyJ'));

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Supabase credentials are missing!');
  console.error('Make sure .env file exists and dev server is restarted');
}

if (supabaseKey && !supabaseKey.startsWith('eyJ')) {
  console.error('❌ ERROR: Invalid Supabase key format!');
  console.error('The anon key should start with "eyJ" and be a JWT token');
  console.error('Current key format:', supabaseKey?.substring(0, 30));
}

export const supabase = createClient(supabaseUrl, supabaseKey);