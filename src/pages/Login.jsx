import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => (
  <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-sm"
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
            Welcome back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-1.5 text-sm text-muted-foreground"
          >
            Log in to continue to Eventix
          </motion.p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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
              transition={{ delay: 0.25 }}
            >
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <button type="button" className="text-xs font-medium text-primary hover:underline transition-colors">
                  Forgot?
                </button>
              </div>
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
              transition={{ delay: 0.3 }}
            >
              <Button className="w-full gap-2 rounded-xl text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200" type="submit">
                Log in <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground">or</span>
            </div>
          </div>

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

export default Login;
