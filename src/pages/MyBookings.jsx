// ==========================================
// MyBookings.jsx — Attendee ki Booked Events
// ==========================================
// Kya karta hai:
//  1. Logged-in attendee ke saare bookings fetch karo
//  2. Supabase FK join use karo: bookings → events
//     booking.events = related event object (array nahi, object hai)
//  3. BookingCard mein pass karo: eventTitle, date, location, tickets, status
//  4. Booking nahi hai → empty state dikhao
//
// NOTE on JOIN:
//   Supabase implicit FK join karta hai kyunki bookings.event_id → events.id
//   booking.events === null bhi ho sakta hai agar:
//    - Event delete ho gaya ho
//    - RLS ne event block kiya ho
//   Isliye hum null check karte hain rendering mein
// ==========================================

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import BookingCard from "@/components/BookingCard";
import { motion } from "framer-motion";
import { Calendar, Ticket, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const MyBookings = () => {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Bookings fetch karo with FK join ──────────────────────
  // .select("*, events(title, event_date, location)") yeh Supabase FK inference hai
  // events(..) → booking.events object mein milega (array nahi)
  // created_at DESC → latest bookings pehle
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("bookings")
          .select(`
            id,
            tickets,
            status,
            created_at,
            events (
              title,
              event_date,
              location
            )
          `)
          .eq("attendee_id", user.id)  // sirf apni bookings
          .order("created_at", { ascending: false }); // naye pehle

        if (error) throw error;
        setBookings(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  // ── Date format helper ────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "Date unavailable";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your bookings…</p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Ticket className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">My Bookings</h1>
            <p className="mt-1 text-muted-foreground">Track your upcoming and past events</p>
          </div>
        </div>
      </motion.div>

      {/* Error state */}
      {error && (
        <p className="mb-6 text-sm text-destructive font-medium">{error}</p>
      )}

      {/* Bookings list or empty state */}
      {bookings.length > 0 ? (
        <div className="flex flex-col gap-4">
          {bookings.map((booking, i) => {
            // booking.events null ho sakta hai agar event delete ho gaya ho
            // (INNER JOIN assumption safe nahi hai — always check)
            const ev = booking.events;

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <BookingCard
                  eventTitle={ev?.title ?? "Event no longer available"}
                  date={formatDate(ev?.event_date)}
                  location={ev?.location ?? "—"}
                  tickets={booking.tickets}
                  status={booking.status}
                />
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-16 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No bookings yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Start exploring events to make your first booking
          </p>
          <Link
            to="/"
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Browse events →
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default MyBookings;
