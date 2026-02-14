import { useParams, Link } from "react-router-dom";
import { CalendarDays, MapPin, Users, ArrowLeft, Minus, Plus, Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { placeholderEvents } from "@/data/placeholders";
import { useState } from "react";
import { motion } from "framer-motion";

const EventDetails = () => {
  const { id } = useParams();
  const event = placeholderEvents.find((e) => e.id === id);
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Event not found</h1>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">Back to events</Link>
      </div>
    );
  }

  const soldOut = event.seatsLeft === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to events
        </Link>
      </motion.div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        {/* Banner */}
        <div className="relative aspect-[21/9] w-full overflow-hidden">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
            src={event.image}
            alt={event.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            {event.category && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
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
          <div className="absolute right-4 top-4 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLiked(!liked)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-card/90 backdrop-blur-md text-card-foreground transition-colors shadow-md hover:bg-card ${
                liked ? "text-destructive" : ""
              }`}
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
          {/* Meta */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3 text-sm"
          >
            <span className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-medium text-accent-foreground">
              <CalendarDays className="h-4 w-4" /> {event.date}
            </span>
            <span className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-medium text-accent-foreground">
              <MapPin className="h-4 w-4" /> {event.location}
            </span>
            <span className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-medium text-accent-foreground">
              <Users className="h-4 w-4" /> {event.capacity} capacity · {event.seatsLeft} left
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 border-t border-border pt-6"
          >
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">About</h3>
            <p className="leading-relaxed text-muted-foreground">{event.description}</p>
          </motion.div>

          {/* Booking */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 rounded-2xl border border-border bg-gradient-to-br from-muted/50 to-muted/30 p-6 shadow-sm"
          >
            <h3 className="mb-4 text-lg font-bold text-card-foreground">Book Tickets</h3>
            {soldOut ? (
              <p className="text-sm font-medium text-destructive">This event is sold out.</p>
            ) : (
              <div className="flex flex-wrap items-center gap-4">
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
                    onClick={() => setQty(Math.min(event.seatsLeft, qty + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="gap-2 rounded-xl px-8 shadow-lg shadow-primary/20">
                    Book Now
                  </Button>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventDetails;
