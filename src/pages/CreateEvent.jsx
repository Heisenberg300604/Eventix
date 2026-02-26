// ==========================================
// CreateEvent.jsx — Organizer Event Banata Hai
// ==========================================
// Kya karta hai:
//  1. Form se title, desc, date, location, capacity, category lo
//  2. Image file lo → Supabase Storage mein upload karo
//  3. Event ka row → public.events table mein insert karo
//  4. Redirect karo /dashboard pe
// ==========================================

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, ArrowRight, Loader2, ImageIcon, X } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = ["Technology", "Music", "Business", "Art", "Wellness", "Food", "Sports", "Other"];

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Hidden file input ref — clicking the upload zone will trigger it
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    capacity: "",
    category: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Handlers ──────────────────────────────────────────────

  // Generic change handler: updates the matching key in form state
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Image picker: validate type + size, then show a local preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  // Clear selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Main submit: upload image → insert event row → redirect
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let imagePath = null;

      // 1. Upload image to Supabase Storage (if one was chosen)
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("event-images")
          .upload(fileName, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        imagePath = fileName;
      }

      // 2. Insert the event record into the database
      const { error: insertError } = await supabase
        .from("events")
        .insert({
          organizer_id: user.id,
          title: form.title,
          description: form.description,
          event_date: form.event_date,
          location: form.location,
          capacity: parseInt(form.capacity),
          seats_left: parseInt(form.capacity),
          category: form.category || null,
          image_path: imagePath,
        });

      if (insertError) throw insertError;

      // 3. Go back to dashboard on success
      navigate("/dashboard");

    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── UI ────────────────────────────────────────────────────

  return (
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

      {/* onSubmit now wired to handleSubmit */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5"
        >
          {/* Title */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Label htmlFor="title" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Title
            </Label>
            <Input
              id="title"
              name="title"               // ← name matches form key
              value={form.title}         // ← controlled
              onChange={handleChange}    // ← wired
              placeholder="Event title"
              required
              className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </motion.div>

          {/* Description */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            <Label htmlFor="description" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your event..."
              rows={4}
              className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </motion.div>

          {/* Date + Location */}
          <div className="grid gap-4 sm:grid-cols-2">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <Label htmlFor="event_date" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Date
              </Label>
              <Input
                id="event_date"
                name="event_date"
                type="datetime-local"       // supports both date & time
                value={form.event_date}
                onChange={handleChange}
                required
                className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
              <Label htmlFor="location" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Location
              </Label>
              <Input
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="City, State"
                required
                className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </motion.div>
          </div>

          {/* Capacity + Category */}
          <div className="grid gap-4 sm:grid-cols-2">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <Label htmlFor="capacity" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Capacity
              </Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                value={form.capacity}
                onChange={handleChange}
                placeholder="100"
                required
                className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </motion.div>

            {/* Category dropdown */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}>
              <Label htmlFor="category" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Category
              </Label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-xl bg-muted/50 border-0 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </motion.div>
          </div>

          {/* Banner Image upload zone */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Banner Image
            </Label>

            {/* Hidden real file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {imagePreview ? (
              /* Show preview once an image is chosen */
              <div className="relative mt-1.5 overflow-hidden rounded-2xl border border-border">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-48 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-foreground backdrop-blur hover:bg-background"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              /* Clickable upload zone */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-1.5 flex items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-12 transition-all duration-200 hover:border-primary/50 hover:bg-accent/30 cursor-pointer group"
              >
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="mt-2 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    Click or drag to upload
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">PNG, JPG up to 5MB</p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-destructive font-medium"
          >
            {error}
          </motion.p>
        )}

        {/* Submit button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="gap-2 rounded-xl px-8 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                Create Event <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
};

export default CreateEvent;
