import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const CreateEvent = () => (
  <div className="mx-auto max-w-2xl">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Event</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Fill in the details to publish your event</p>
    </motion.div>

    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Label htmlFor="title" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</Label>
          <Input id="title" placeholder="Event title" className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Label htmlFor="description" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</Label>
          <Textarea id="description" placeholder="Describe your event..." className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary" rows={4} />
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Label htmlFor="date" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</Label>
            <Input id="date" type="date" className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <Label htmlFor="location" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Location</Label>
            <Input id="location" placeholder="City, State" className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary" />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Label htmlFor="capacity" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Capacity</Label>
          <Input id="capacity" type="number" placeholder="100" className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Banner Image</Label>
          <div className="mt-1.5 flex items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-12 transition-all duration-200 hover:border-primary/50 hover:bg-accent/30 cursor-pointer group">
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="mt-2 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Click or drag to upload</p>
              <p className="mt-1 text-xs text-muted-foreground/60">PNG, JPG up to 5MB</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button type="submit" size="lg" className="gap-2 rounded-xl px-8 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
          Create Event <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </form>
  </div>
);

export default CreateEvent;
