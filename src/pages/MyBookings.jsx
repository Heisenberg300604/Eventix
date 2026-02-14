import BookingCard from "@/components/BookingCard";
import { placeholderBookings } from "@/data/placeholders";
import { motion } from "framer-motion";
import { Calendar, Ticket } from "lucide-react";

const MyBookings = () => (
  <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
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

    {placeholderBookings.length > 0 ? (
      <div className="flex flex-col gap-4">
        {placeholderBookings.map((booking, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <BookingCard {...booking} />
          </motion.div>
        ))}
      </div>
    ) : (
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
        <p className="mt-1 text-sm text-muted-foreground">Start exploring events to make your first booking</p>
      </motion.div>
    )}
  </div>
);

export default MyBookings;
