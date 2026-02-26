// ==========================================
// EventDetails.jsx — Public Event Detail Page
// ==========================================
// Kya karta hai:
//  1. URL se event ID lo (:id param)
//  2. Supabase se us event ka data fetch karo
//  3. Banner, title, date, location, description dikhao
//  4. Ticket booking section:
//     a. Attendee check (isAttendee guard)
//     b. Duplicate booking check (.maybeSingle())
//     c. Supabase insert with status: "confirmed"
//     d. DB trigger seats_left reduce karta hai (race-condition safe)
//     e. Optimistic UI update → seats_left locally update karo
// ==========================================

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  CalendarDays, MapPin, Users, ArrowLeft, Minus, Plus,
  Share2, Heart, Loader2, ImageIcon, CheckCircle2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAttendee } = useAuth(); // isAttendee = user_type === "attend"

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Ticket quantity selector
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);

  // Booking states
  const [booking, setBooking] = useState(false);       // submit in progress
  const [alreadyBooked, setAlreadyBooked] = useState(false); // duplicate check
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // ── Supabase se event fetch karo ──────────────────────────
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setEvent(data);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // ── Agar user logged in hai toh check karo already booked hai kya ────
  // .maybeSingle() use karo — .single() error deta hai jab row nahi milti
  // .maybeSingle() null return karta hai without error = correct semantics
  useEffect(() => {
    const checkExistingBooking = async () => {
      if (!user || !id) return;

      const { data } = await supabase
        .from("bookings")
        .select("id")
        .eq("event_id", id)
        .eq("attendee_id", user.id)
        .maybeSingle(); // null if not found — no error thrown ✅

      if (data) setAlreadyBooked(true);
    };

    checkExistingBooking();
  }, [user, id]);

  // ── Helpers ───────────────────────────────────────────────

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const { data } = supabase.storage.from("event-images").getPublicUrl(imagePath);
    return data.publicUrl;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ── Booking handler ───────────────────────────────────────
  const handleBooking = async () => {
    // Frontend guard — attendees only
    // NOTE: RLS on the bookings table is the REAL security layer
    // This is just a UX guard, not security
    if (!user) {
      navigate("/login");
      return;
    }
    if (!isAttendee) {
      setBookingError("Only attendees can book events.");
      return;
    }

    setBooking(true);
    setBookingError("");

    try {
      // Safety clamp: qty should never exceed current seats_left
      // This prevents the user from booking more than available
      // even if they somehow race with another user's UI update
      const safeQty = Math.min(qty, event.seats_left);

      // Insert booking row with status: "confirmed"
      // The DB trigger on bookings table will:
      //   UPDATE events SET seats_left = seats_left - qty
      //   This is atomic — no client-side race condition
      const { error } = await supabase.from("bookings").insert({
        event_id: event.id,
        attendee_id: user.id,
        tickets: safeQty,
        status: "confirmed", // trigger yeh value dekh ke seats_left reduce karta hai
      });

      if (error) {
        // Log the REAL error to console so we can debug it properly
        console.error("Booking insert error:", error);

        // Only match the exact DB trigger phrase — don't use broad "seats" match
        // A broad match was hiding the real error (e.g. RLS violation, missing column)
        if (error.message.includes("Not enough seats")) {
          setBookingError("Not enough seats available. Please reduce quantity.");
        } else if (
          error.message.includes("unique") ||
          error.message.includes("duplicate") ||
          error.code === "23505" // PostgreSQL unique violation code
        ) {
          setAlreadyBooked(true);
          setBookingError("You have already booked this event.");
        } else {
          // Show the real Supabase / DB error directly
          setBookingError(error.message || "Booking failed. Please try again.");
        }
        return;
      }

      // Optimistic UI update — locally reduce seats_left
      // Hum DB pe rely karte hain for truth, but UI smooth rakhne ke liye
      // yeh immediately update kar dete hain bina re-fetch ke
      setEvent((prev) => ({
        ...prev,
        seats_left: prev.seats_left - safeQty,
      }));

      setAlreadyBooked(true);
      setBookingSuccess(true);
    } catch (err) {
      setBookingError(err.message || "Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading event…</p>
      </div>
    );
  }

  // ── Error / not found ─────────────────────────────────────
  if (fetchError || !event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Event not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {fetchError || "This event may have been deleted."}
        </p>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">
          Back to events
        </Link>
      </div>
    );
  }

  const imageUrl = getImageUrl(event.image_path);
  const soldOut = (event.seats_left ?? 0) === 0;

  // ── Render ────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
    >
      {/* Back link */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to events
        </Link>
      </motion.div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        {/* Banner */}
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
              src={imageUrl}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />

          {/* Category badge + title */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            {event.category && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Badge className="mb-3 rounded-lg border-0 bg-card/90 text-card-foreground backdrop-blur-md shadow-md">
                  {event.category}
                </Badge>
              </motion.div>
            )}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-primary-foreground drop-shadow-lg sm:text-4xl"
            >
              {event.title}
            </motion.h1>
          </div>

          {/* Like + Share */}
          <div className="absolute right-4 top-4 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLiked(!liked)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-card/90 backdrop-blur-md text-card-foreground transition-colors shadow-md hover:bg-card ${liked ? "text-destructive" : ""}`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/90 backdrop-blur-md text-card-foreground transition-colors shadow-md hover:bg-card"
            >
              <Share2 className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Meta chips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3 text-sm"
          >
            <span className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-medium text-accent-foreground">
              <CalendarDays className="h-4 w-4" /> {formatDate(event.event_date)}
            </span>
            <span className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-medium text-accent-foreground">
              <MapPin className="h-4 w-4" /> {event.location}
            </span>
            <span className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-medium text-accent-foreground">
              <Users className="h-4 w-4" /> {event.capacity} capacity · {event.seats_left} left
            </span>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 border-t border-border pt-6"
          >
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">About</h3>
            <p className="leading-relaxed text-muted-foreground">
              {event.description || "No description provided."}
            </p>
          </motion.div>

          {/* ── Booking Section ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 rounded-2xl border border-border bg-gradient-to-br from-muted/50 to-muted/30 p-6 shadow-sm"
          >
            <h3 className="mb-4 text-lg font-bold text-card-foreground">Book Tickets</h3>

            {/* Success state — booking confirmed */}
            <AnimatePresence>
              {bookingSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success font-medium"
                >
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  Booking confirmed! Check "My Bookings" for details.
                </motion.div>
              )}
            </AnimatePresence>

            {/* Already booked (detected on load or after booking) */}
            {alreadyBooked && !bookingSuccess && (
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                You've already booked this event.
              </p>
            )}

            {/* Sold out */}
            {soldOut && !alreadyBooked && (
              <p className="text-sm font-medium text-destructive">This event is sold out.</p>
            )}

            {/* Booking form — attend nahi hai toh different message */}
            {!soldOut && !alreadyBooked && !bookingSuccess && (
              <>
                {/* Not logged in */}
                {!user && (
                  <div className="flex flex-wrap items-center gap-4">
                    <p className="text-sm text-muted-foreground">Login to book tickets</p>
                    <Link to="/login">
                      <Button size="lg" className="gap-2 rounded-xl px-8 shadow-lg shadow-primary/20">
                        Login to Book
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Logged in but organizer — can't book own events */}
                {user && !isAttendee && (
                  <p className="text-sm text-muted-foreground">
                    Organizers cannot book events. Switch to an attendee account.
                  </p>
                )}

                {/* Attendee — show qty selector + Book Now */}
                {user && isAttendee && (
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Qty capped at seats_left — prevents selecting more than available */}
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-1 shadow-sm">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
                      >
                        <Minus className="h-4 w-4" />
                      </motion.button>
                      <span className="w-12 text-center text-base font-bold text-foreground">{qty}</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        // Max qty = seats_left — client-side clamp
                        onClick={() => setQty(Math.min(event.seats_left, qty + 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
                      >
                        <Plus className="h-4 w-4" />
                      </motion.button>
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size="lg"
                        onClick={handleBooking}
                        disabled={booking}
                        className="gap-2 rounded-xl px-8 shadow-lg shadow-primary/20"
                      >
                        {booking ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Booking…
                          </>
                        ) : (
                          "Book Now"
                        )}
                      </Button>
                    </motion.div>
                  </div>
                )}
              </>
            )}

            {/* Booking error message */}
            <AnimatePresence>
              {bookingError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-2 text-sm font-medium text-destructive"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {bookingError}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventDetails;
