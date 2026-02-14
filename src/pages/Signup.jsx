import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, ArrowRight, Users, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const Signup = () => {
  const [userType, setUserType] = useState("attend");

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-primary/5">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25"
            >
              <Calendar className="h-7 w-7 text-primary-foreground" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-foreground"
            >
              Create your account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-1.5 text-sm text-muted-foreground"
            >
              Start discovering amazing events
            </motion.p>
          </div>

          {/* Form */}
          <div className="p-6">
            {/* User Type Selection */}
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
                <button
                  type="button"
                  onClick={() => setUserType("attend")}
                  className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                    userType === "attend"
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
                  {userType === "attend" && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 rounded-xl bg-primary/5"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("organize")}
                  className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                    userType === "organize"
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

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
                  placeholder="John Doe"
                  className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </motion.div>
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
                  placeholder="you@example.com"
                  className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </motion.div>
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
                  placeholder="••••••••"
                  className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </motion.div>
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
                  placeholder="••••••••"
                  className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button className="w-full gap-2 rounded-xl text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200" type="submit">
                  Create Account <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            </form>

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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground">or</span>
              </div>
            </div>

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
