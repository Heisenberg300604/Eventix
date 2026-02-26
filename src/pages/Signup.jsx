// ==========================================
// Signup.jsx — User Registration Page
// ==========================================
// This page allows new users to create an account.
// They can choose to be an "attendee" (someone who
// attends events) or an "organizer" (someone who
// creates and manages events).
//
// How it works:
// 1. User fills in the form (name, email, password)
// 2. User picks their role (attend or organize)
// 3. On submit, we call signUp() from our AuthContext
// 4. Supabase creates the account + sends confirmation email
// 5. User is redirected to the login page
// ==========================================

// --- Imports ---
// Link & useNavigate: for navigation between pages
import { Link, useNavigate } from "react-router-dom";
// UI Components: pre-built styled components (Button, Input, Label)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Icons from lucide-react: Calendar icon, Arrow, Users, CalendarDays
import { Calendar, ArrowRight, Users, CalendarDays } from "lucide-react";
// motion: adds smooth animations to our components
import { motion } from "framer-motion";
// useState: React hook to store and update data within this component
import { useState } from "react";
// useAuth: our custom hook to access the signUp function
import { useAuth } from "../context/AuthContext.jsx";

// ==========================================
// Signup Component
// ==========================================
const Signup = () => {
  // --- State Variables ---
  // "userType" tracks which card is selected (attend or organize)
  // This is used for the visual highlight on the role selection cards
  const [userType, setUserType] = useState("attend");

  // "formData" stores all the form field values as one object
  // When user types in any field, we update the relevant property
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'attend', // default type is "attend" (matches DB enum: 'attend' or 'organize')
  });

  // "formError" stores any error message to display to the user
  // (e.g., "Passwords do not match")
  // NOTE: We renamed this from "error" to "formError" to avoid
  // a bug called "variable shadowing" — where a variable inside
  // handleSubmit had the same name and caused confusion.
  const [formError, setFormError] = useState('');

  // "loading" is true while the signup request is being processed
  // We use it to disable the button and show "Creating Account..."
  const [loading, setLoading] = useState(false);

  // Get the signUp function from our AuthContext
  const { signUp } = useAuth();
  // useNavigate lets us redirect the user to another page programmatically
  const navigate = useNavigate();

  // --- Form Submit Handler ---
  // This function runs when the user clicks "Create Account"
  const handleSubmit = async (e) => {
    // Prevent the browser's default form behavior (page reload)
    e.preventDefault();
    // Clear any previous error messages
    setFormError('');

    // Validation Step 1: Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return; // Stop here, don't proceed with signup
    }

    // Validation Step 2: Check password length (Supabase requires >= 6)
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return; // Stop here
    }

    // All validations passed — start the signup process
    setLoading(true);

    try {
      // Call the signUp function from AuthContext
      // It returns { data, error } — we rename "error" to "signUpError"
      // to avoid conflicting with our "formError" state variable
      const { data, error: signUpError } = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.userType
      );

      if (signUpError) {
        // Signup failed — show the error message from Supabase
        setFormError(signUpError.message);
      } else {
        // Signup succeeded! Redirect user to the login page
        // We pass a success message via React Router's "state" feature
        navigate('/login', {
          state: { message: 'Account created! Please check your email to confirm, then sign in.' }
        });
      }
    } catch (err) {
      // Catch any unexpected errors
      console.error("Unexpected signup error:", err);
      setFormError('Something went wrong. Please try again.');
    } finally {
      // ALWAYS stop loading — even if something crashes
      // "finally" runs no matter what (success, error, or crash)
      // This prevents the button from being stuck on "Creating Account..."
      setLoading(false);
    }
  };

  // --- Render the Component ---
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      {/* Animated wrapper — fades in and slides up when page loads */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card container with rounded corners, border, and shadow */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-primary/5">

          {/* ========== HEADER SECTION ========== */}
          {/* Gradient background with icon, title, and subtitle */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-8 text-center">
            {/* Calendar icon with spring animation (bounces in) */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25"
            >
              <Calendar className="h-7 w-7 text-primary-foreground" />
            </motion.div>
            {/* Page title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-foreground"
            >
              Create your account
            </motion.h1>
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-1.5 text-sm text-muted-foreground"
            >
              Start discovering amazing events
            </motion.p>
          </div>

          {/* ========== FORM SECTION ========== */}
          <div className="p-6">

            {/* --- Role Selection Cards --- */}
            {/* User picks "Attend Events" or "Organize Events" */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <Label className="mb-3 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                I want to
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {/* ATTEND EVENTS card */}
                <button
                  type="button"
                  onClick={() => {
                    setUserType("attend");
                    // Update the userType in formData when card is clicked
                    setFormData({ ...formData, userType: 'attend' });
                  }}
                  className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200 ${userType === "attend"
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                    : "border-border bg-muted/30 hover:border-primary/30"
                    }`}
                >
                  <Users className={`mb-2 h-5 w-5 transition-colors ${userType === "attend" ? "text-primary" : "text-muted-foreground"}`} />
                  <div className={`text-sm font-semibold ${userType === "attend" ? "text-primary" : "text-foreground"}`}>
                    Attend Events
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Browse and book events
                  </div>
                  {/* Animated highlight background when selected */}
                  {userType === "attend" && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 rounded-xl bg-primary/5"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>

                {/* ORGANIZE EVENTS card */}
                <button
                  type="button"
                  onClick={() => {
                    setUserType("organize");
                    setFormData({ ...formData, userType: 'organize' });
                  }}
                  className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200 ${userType === "organize"
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                    : "border-border bg-muted/30 hover:border-primary/30"
                    }`}
                >
                  <CalendarDays className={`mb-2 h-5 w-5 transition-colors ${userType === "organize" ? "text-primary" : "text-muted-foreground"}`} />
                  <div className={`text-sm font-semibold ${userType === "organize" ? "text-primary" : "text-foreground"}`}>
                    Organize Events
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Create and manage events
                  </div>
                  {userType === "organize" && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 rounded-xl bg-primary/5"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              </div>
            </motion.div>

            {/* --- Error Message Display --- */}
            {/* Only shows when formError has a value */}
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700"
              >
                {formError}
              </motion.div>
            )}

            {/* --- The Actual Form --- */}
            {/* onSubmit={handleSubmit} runs our handler when form is submitted */}
            <form className="space-y-4" onSubmit={handleSubmit}>

              {/* Full Name Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.fullName}
                  // Spread operator (...formData) keeps all other fields,
                  // only updates "fullName" with the new typed value
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </motion.div>

              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <Label htmlFor="confirmPassword" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  className="w-full gap-2 rounded-xl text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
                  type="submit"
                  disabled={loading}
                >
                  {/* Show different text while loading */}
                  {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            </form>

            {/* Terms & Privacy links */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 text-center text-xs text-muted-foreground"
            >
              By signing up, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">Terms</a> &{" "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            </motion.p>

            {/* Divider line with "or" text */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground">or</span>
              </div>
            </div>

            {/* Link to Login page for existing users */}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
