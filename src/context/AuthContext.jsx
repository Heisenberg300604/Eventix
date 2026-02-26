// ==========================================
// AuthContext.jsx — Authentication Context
// ==========================================
// This file creates a "context" for authentication.
// Think of context like a global store — any component
// in our app can access the user's login state without
// passing props through every level.
// ==========================================

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../utils/supabase.js";

// Step 1: Create the context (an empty container for now)
const AuthContext = createContext({});

// Step 2: Custom hook — a shortcut so components can easily
// access auth data by just calling useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Step 3: AuthProvider — wraps the entire app and provides
// user, profile, and auth functions to all child components
export const AuthProvider = ({ children }) => {
  // "user" stores the logged-in user's info from Supabase Auth
  const [user, setUser] = useState(null);
  // "profile" stores extra user data from our custom "profiles" table
  const [profile, setProfile] = useState(null);
  // "loading" is true while we check if user is already logged in
  const [loading, setLoading] = useState(true);

  // ---- Helper: Fetch user profile from the "profiles" table ----
  // After login, we need to know the user's role (organizer/attendee)
  // That info is stored in a separate "profiles" table in Supabase
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile might not exist yet (e.g., right after signup)
        console.log("Profile not found for user:", userId);
        return null;
      }
      setProfile(data);
      return data;
    } catch (err) {
      console.error("Error fetching profile:", err);
      return null;
    }
  };

  // ---- useEffect: Listen for auth state and initialize ----
  // We rely ONLY on onAuthStateChange, which fires INITIAL_SESSION
  // on mount. This removes the race condition between getSession()
  // and the listener that was causing the infinite loader.
  useEffect(() => {
    let ignore = false;

    // Safety timeout — if auth never resolves, stop loading after 10s
    const safetyTimer = setTimeout(() => {
      if (!ignore) {
        console.warn('⚠️ Auth initialization timed out after 10s — forcing loading to false');
        setLoading(false);
      }
    }, 10000);

    // onAuthStateChange fires INITIAL_SESSION immediately on subscribe,
    // so we don't need a separate getSession() call.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);

        if (ignore) return;

        try {
          if (session?.user) {
            setUser(session.user);
            // Use setTimeout to defer the Supabase DB call
            // This prevents a deadlock with the auth state change
            // (Supabase client locks during onAuthStateChange callbacks)
            setTimeout(async () => {
              if (!ignore) {
                await fetchProfile(session.user.id);
                if (!ignore) setLoading(false);
              }
            }, 0);
          } else {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          if (!ignore) {
            setLoading(false);
          }
        }
      }
    );

    // Cleanup
    return () => {
      ignore = true;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  // ---- Signup Function ----
  // Creates a new user account in Supabase Auth.
  // The profile row in "profiles" table is created AUTOMATICALLY
  // by a database trigger we set up in Supabase SQL Editor.
  //
  // WHY NOT insert profile here?
  // When email confirmation is ON, Supabase doesn't give the user
  // a session until they confirm their email. Without a session,
  // Row Level Security (RLS) blocks the insert. That's why the
  // profile insert was failing silently and the page was stuck.
  //
  // The solution: A Supabase database trigger automatically creates
  // the profile when a new user signs up. See the SQL in the README.
  const signUp = async (email, password, fullName, userType) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            // This metadata is stored in auth.users -> raw_user_meta_data
            // Our database trigger reads "full_name" and "user_type" from here
            // to create the profile row automatically
            full_name: fullName,
            user_type: userType,  // must be 'attend' or 'organize' (matches the DB enum)
          },
        },
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Signup error:", error);
      return { data: null, error };
    }
  };

  // ---- Login Function ----
  // Signs in an existing user with email + password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // ---- Logout Function ----
  // Signs the user out and clears all stored data
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // ---- Provide all auth data & functions to child components ----
  // Any component wrapped in <AuthProvider> can access these via useAuth()
  return (
    <AuthContext.Provider value={{
      user,           // the logged-in user object (or null)
      profile,        // the user's profile from "profiles" table
      loading,        // true while checking auth status
      signUp,         // function to create a new account
      signIn,         // function to log in (renamed from "signin" for clarity)
      signOut,        // function to log out
      isOrganizer: profile?.user_type === 'organize',  // quick check: is user an organizer?
      isAttendee: profile?.user_type === 'attend',     // quick check: is user an attendee?
    }}>
      {children}
    </AuthContext.Provider>
  );
};