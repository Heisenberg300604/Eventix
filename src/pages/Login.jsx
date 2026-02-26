// ==========================================
// Login.jsx — User Login Page
// ==========================================
// This page allows existing users to log into their account.
//
// How it works:
// 1. User enters their email and password
// 2. On submit, we call signIn() from our AuthContext
// 3. Supabase checks if the credentials are valid
// 4. If valid → user is redirected to the home page
// 5. If invalid → we show an error message
//
// Key concepts used:
// - useState: to store form data, errors, and loading state
// - useAuth: our custom hook to access the signIn function
// - useNavigate: to redirect user after successful login
// - useLocation: to read success messages (e.g., from signup redirect)
// - motion (framer-motion): for smooth entrance animations
// ==========================================

// --- Imports ---
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

// ==========================================
// Login Component
// ==========================================
const Login = () => {
  // --- State Variables ---
  // "email" and "password" store what the user types in the form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // "formError" stores any error message to display
  // (e.g., "Invalid login credentials")
  const [formError, setFormError] = useState('');

  // "loading" is true while the login request is being processed
  // Used to disable the button and show a spinner
  const [loading, setLoading] = useState(false);

  // --- Hooks ---
  // signIn: the login function from our AuthContext
  const { signIn } = useAuth();

  // useNavigate: lets us redirect the user programmatically
  const navigate = useNavigate();

  // useLocation: lets us read data passed from other pages
  // When user signs up, we redirect them here with a success message
  const location = useLocation();
  const successMessage = location.state?.message || '';

  // --- Form Submit Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const { data, error: loginError } = await signIn(email, password);

      if (loginError) {
        setFormError(loginError.message);
      } else {
        // Route based on user role:
        //  - Organizers go to the dashboard
        //  - Attendees go to /my-bookings (they have no dashboard)
        const userType = data?.user?.user_metadata?.user_type;
        if (userType === 'attend') {
          navigate('/my-bookings');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      setFormError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Render the Component ---
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      {/* Animated wrapper — the whole card fades in and slides up */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Card container with border, rounded corners, and shadow */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-primary/5">

          {/* ========== HEADER SECTION ========== */}
          {/* Gradient background with the app icon and welcome text */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-8 text-center">

            {/* Calendar icon — uses a "spring" animation to bounce in */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25"
            >
              <Calendar className="h-7 w-7 text-primary-foreground" />
            </motion.div>

            {/* Page title — "Welcome back" */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-foreground"
            >
              Welcome back
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-1.5 text-sm text-muted-foreground"
            >
              Log in to continue to Eventix
            </motion.p>
          </div>

          {/* ========== FORM SECTION ========== */}
          <div className="p-6">

            {/* --- Success Message --- */}
            {/* This shows when user is redirected here after signup */}
            {/* The message is passed via React Router's state feature */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700"
              >
                ✅ {successMessage}
              </motion.div>
            )}

            {/* --- Error Message Display --- */}
            {/* Only renders when formError has a value */}
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700"
              >
                {formError}
              </motion.div>
            )}

            {/* --- The Login Form --- */}
            {/* onSubmit calls our handleSubmit function */}
            <form className="space-y-4" onSubmit={handleSubmit}>

              {/* Email Input Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label htmlFor="login-email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  // Update the email state whenever user types
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </motion.div>

              {/* Password Input Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                {/* Row with "Password" label and "Forgot?" link */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Password
                  </Label>
                  {/* Forgot password link (placeholder for now) */}
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline transition-colors"
                  >
                    Forgot?
                  </button>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  className="w-full gap-2 rounded-xl text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
                  type="submit"
                  disabled={loading}
                >
                  {/* Show spinner + "Logging in..." while loading */}
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Log in <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* ========== DIVIDER ========== */}
            {/* A horizontal line with "or" in the middle */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground">or</span>
              </div>
            </div>

            {/* ========== SIGNUP LINK ========== */}
            {/* For users who don't have an account yet */}
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-primary hover:underline transition-colors">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
