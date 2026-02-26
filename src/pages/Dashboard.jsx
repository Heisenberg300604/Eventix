// ==========================================
// Dashboard.jsx — Organizer ka Main Control Panel
// ==========================================
// Kya karta hai:
//  1. Supabase se logged-in organizer ke events fetch karo
//  2. Stats cards dikhao (total events, bookings, seats)
//  3. Har event ke saath Edit + Delete button do
//  4. Delete karne se pehle Confirm Modal dikhao
//  5. Confirm hone pe event DB se delete karo
// ==========================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Users,
  Ticket,
  PlusCircle,
  Edit,
  Trash2,
  Loader2,
  TrendingUp,
  ImageIcon,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Delete Confirm Modal ───────────────────────────────────────────────────────
// Ek simple overlay modal jो confirm karta hai delete action ko
const DeleteModal = ({ eventTitle, onConfirm, onCancel, deleting }) => (
  // AnimatePresence ke andar render hota hai taaki smooth animation ho
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 20 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
    >
      {/* Warning icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 mx-auto">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>

      {/* Title & message */}
      <h2 className="mt-4 text-center text-lg font-bold text-foreground">Delete Event?</h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-foreground">"{eventTitle}"</span>?
        This action cannot be undone.
      </p>

      {/* Action buttons */}
      <div className="mt-6 flex gap-3">
        {/* Cancel — modal band karo */}
        <Button
          variant="outline"
          className="flex-1 rounded-xl"
          onClick={onCancel}
          disabled={deleting}
        >
          Cancel
        </Button>

        {/* Confirm delete — actual delete trigger */}
        <Button
          variant="destructive"
          className="flex-1 rounded-xl gap-2"
          onClick={onConfirm}
          disabled={deleting}
        >
          {deleting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Deleting…
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Delete
            </>
          )}
        </Button>
      </div>
    </motion.div>
  </motion.div>
);

// ── Main Dashboard Component ───────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth(); // logged-in organizer ka user object

  // Events list jo DB se aayegi
  const [events, setEvents] = useState([]);
  // Loading state — pehli baar fetch ho raha hai
  const [loading, setLoading] = useState(true);
  // Error message agar fetch fail ho
  const [fetchError, setFetchError] = useState("");

  // Delete modal ke liye — konsa event delete karna hai
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
  // Delete in-progress spinner
  const [deleting, setDeleting] = useState(false);

  // ── Events Fetch ──────────────────────────────────────────
  // Sirf logged-in organizer ke events do → organizer_id filter
  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_id", user.id) // sirf apne events
        .order("event_date", { ascending: true }); // date ke order mein

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Component mount hone pe events load karo
  useEffect(() => {
    if (user) fetchEvents();
  }, [user]);

  // ── Stats Cards — DB se calculated ──────────────────────
  const totalBookings = events.reduce(
    (sum, e) => sum + ((e.capacity || 0) - (e.seats_left || 0)),
    0
  );
  const totalSeatsLeft = events.reduce((sum, e) => sum + (e.seats_left || 0), 0);

  const stats = [
    { label: "Total Events", value: events.length.toString(), icon: CalendarDays, change: "Your active events" },
    { label: "Total Bookings", value: totalBookings.toString(), icon: Users, change: "Across all events" },
    { label: "Seats Available", value: totalSeatsLeft.toString(), icon: Ticket, change: "Remaining capacity" },
  ];

  // ── Delete Handlers ───────────────────────────────────────

  // Delete button click pe modal open karo
  const handleDeleteClick = (event) => {
    setDeleteTarget({ id: event.id, title: event.title });
  };

  // Modal ka "Cancel" — sirf modal band karo
  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  // Modal ka "Delete Confirm" — DB se delete karo
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", deleteTarget.id); // sirf usi event ko delete karo

      if (error) throw error;

      // Local state update karo — re-fetch ke bina UI update
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null); // modal band karo
    } catch (err) {
      alert("Delete failed: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // ── Helper: image URL banana ──────────────────────────────
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const { data } = supabase.storage.from("event-images").getPublicUrl(imagePath);
    return data.publicUrl;
  };

  // ── Date format helper ────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div>
      {/* Delete Confirm Modal — sirf tab dikhao jab deleteTarget set ho */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            eventTitle={deleteTarget.title}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
            deleting={deleting}
          />
        )}
      </AnimatePresence>

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Manage your events and track performance</p>
        </div>
        <Link to="/dashboard/create">
          <Button className="gap-2 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
            <PlusCircle className="h-4 w-4" /> Create Event
          </Button>
        </Link>
      </motion.div>

      {/* Stats cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            whileHover={{ y: -2 }}
            className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                <TrendingUp className="h-3 w-3" /> {stat.change}
              </div>
            </div>
            <p className="mt-5 text-3xl font-bold text-card-foreground">{stat.value}</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Your Events heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mb-4 flex items-center justify-between"
      >
        <h2 className="text-xl font-bold text-foreground">Your Events</h2>
      </motion.div>

      {/* Events list — loading / empty / populated */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {loading ? (
          // Pehli baar fetch ho raha hai — spinner dikhao
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your events…</p>
          </div>
        ) : fetchError ? (
          // Fetch fail hua — error message dikhao
          <div className="py-16 text-center text-sm text-destructive">{fetchError}</div>
        ) : events.length === 0 ? (
          // Koi event nahi hai — empty state
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-foreground">No events yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Create your first event to get started</p>
            </div>
            <Link to="/dashboard/create">
              <Button size="sm" className="gap-2 rounded-xl">
                <PlusCircle className="h-4 w-4" /> Create Event
              </Button>
            </Link>
          </div>
        ) : (
          // Events list — har event ka row
          <div className="divide-y divide-border">
            {events.map((event, i) => {
              const imageUrl = getImageUrl(event.image_path);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-muted/30"
                >
                  {/* Left: image + event info */}
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Event banner thumbnail */}
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={event.title}
                        className="h-16 w-16 flex-shrink-0 rounded-xl object-cover shadow-sm"
                      />
                    ) : (
                      // Image nahi hai — placeholder icon dikhao
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-muted">
                        <ImageIcon className="h-7 w-7 text-muted-foreground" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="font-semibold text-card-foreground truncate">{event.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground truncate">
                        {formatDate(event.event_date)} · {event.location}
                      </p>
                      {event.category && (
                        <Badge variant="secondary" className="mt-1.5 rounded-lg text-xs">
                          {event.category}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Right: seats badge + action buttons */}
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-lg border-border text-muted-foreground font-medium hidden sm:flex"
                    >
                      {event.seats_left ?? event.capacity} left
                    </Badge>

                    {/* Edit button — EditEvent page pe le jaao */}
                    <Link to={`/dashboard/edit/${event.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Edit event"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>

                    {/* Delete button — confirm modal open karo */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Delete event"
                      onClick={() => handleDeleteClick(event)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
