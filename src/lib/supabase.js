// ==========================================
// supabase.js — Supabase Client Setup
// ==========================================
// Yahan hum apna Supabase client banate hain.
// Ye ek "singleton" hai — matlab poori app mein
// ek hi client use hoga, baar baar naya nahi banega.
//
// createClient() ko 2 cheezein chahiye:
//  1. Your Supabase project URL
//  2. Your anon (public) key
//
// Dono .env file mein store hain aur
// import.meta.env se access hote hain (Vite ka tarika).
// ==========================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Hum yahan ek single client export karte hain.
// Baaki saare files isse import karenge.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
