// ==========================================
// EditEvent.jsx — Event Edit + Update
// ==========================================
// Kya karta hai:
//  1. Event ID se Supabase se existing data fetch karo
//  2. Form pre-fill karo existing values se
//  3. Changes save karo → Supabase .update() call
//  4. Naya image upload ho sakta hai (optional)
// ==========================================

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";   // ← needed for user.id in upload
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Loader2, Upload, X } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = ["Technology", "Music", "Business", "Art", "Wellness", "Food", "Sports", "Other"];

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Hidden file input trigger
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ── Fetch existing event data on mount ────────────────────

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          // Pre-fill form with existing values
          // event_date comes as ISO string — slice to "YYYY-MM-DDTHH:mm" for datetime-local input
          setForm({
            title: data.title || "",
            description: data.description || "",
            event_date: data.event_date ? data.event_date.slice(0, 16) : "",
            location: data.location || "",
            capacity: data.capacity || "",
            category: data.category || "",
          });

          // Load existing banner preview from Supabase Storage
          if (data.image_path) {
            const { data: fileData } = supabase.storage
              .from("event-images")
              .getPublicUrl(data.image_path);
            setImagePreview(fileData.publicUrl);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  // ── Handlers ──────────────────────────────────────────────

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      let imagePath = undefined; // undefined = don't overwrite existing path in DB

      // Upload new image if user selected one
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("event-images")
          .upload(fileName, imageFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;
        imagePath = fileName;
      }

      // Build update payload — only include image_path if a new one was uploaded
      const updatePayload = {
        title: form.title,
        description: form.description,
        event_date: form.event_date,
        location: form.location,
        capacity: parseInt(form.capacity),
        category: form.category || null,
      };
      if (imagePath !== undefined) updatePayload.image_path = imagePath;

      const { error: updateError } = await supabase
        .from("events")
        .update(updatePayload)
        .eq("id", id);

      if (updateError) throw updateError;

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Loading / not-found states ────────────────────────────

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-2 text-muted-foreground">Loading event...</p>
      </div>
    );
  }

  if (!form.title) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Event not found</h1>
        <Link to="/dashboard" className="mt-4 inline-block text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back link */}
      <Link
        to="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Event</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Update your event details below</p>
      </motion.div>

      {/* Form — onSubmit wired to handleSubmit */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5"
        >
          {/* Title */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <Label htmlFor="title" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Title
            </Label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </motion.div>

          {/* Description */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Label htmlFor="description" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </motion.div>

          {/* Date + Location */}
          <div className="grid gap-4 sm:grid-cols-2">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              <Label htmlFor="event_date" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Date & Time
              </Label>
              <Input
                id="event_date"
                name="event_date"
                type="datetime-local"
                value={form.event_date}
                onChange={handleChange}
                required
                className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
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
                required
                className="mt-1.5 rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}>
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

          {/* Banner Image */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}>
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
              /* Show current / newly selected image with remove button */
              <div className="relative mt-1.5 overflow-hidden rounded-2xl border border-border">
                <img
                  src={imagePreview}
                  alt="Banner preview"
                  className="h-48 w-full object-cover"
                />
                {/* Button to clear and pick a different image */}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-foreground backdrop-blur hover:bg-background transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                {/* Overlay hint to replace */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg bg-background/80 px-3 py-1.5 text-xs font-medium backdrop-blur hover:bg-background transition-colors"
                >
                  <Upload className="h-3 w-3" /> Replace
                </button>
              </div>
            ) : (
              /* Clickable upload zone when no image */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-1.5 flex items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-12 transition-all duration-200 hover:border-primary/50 hover:bg-accent/30 cursor-pointer group"
              >
                <div className="text-center">
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="mt-2 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    Click to upload a new banner
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

        {/* Save button */}
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
            disabled={saving}
            className="gap-2 rounded-xl px-8 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                Save Changes <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
};

export default EditEvent;
