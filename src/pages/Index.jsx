// ==========================================
// Index.jsx — Landing Page
// ==========================================
// Lesson 2 Update: Ab yahan se placeholder events hata diye hain.
// Real events Supabase ke 'events' table se fetch hote hain.
//
// New concepts used here:
// - useState: events array aur loading state store karne ke liye
// - useEffect: component mount hone par fetchEvents() call karne ke liye
// - supabase.from('events').select('*'): DB se data lana
// - supabase.storage.getPublicUrl(): image ka public URL nikalna
// ==========================================

import { ArrowRight, Sparkles, Shield, Zap, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EventCard from "@/components/EventCard";
import { motion } from "framer-motion";
// Lesson 2: useState + useEffect for async data fetching
import { useState, useEffect } from "react";
// Lesson 2: Supabase client — poori app mein ek hi client (singleton)
import { supabase } from "@/lib/supabase";

const stats = [
  { value: "10K+", label: "Events Hosted" },
  { value: "50K+", label: "Tickets Sold" },
  { value: "98%", label: "Satisfaction" },
];

const features = [
  {
    icon: Sparkles,
    title: "Curated Experiences",
    description: "Hand-picked events across tech, music, art, wellness, and more.",
  },
  {
    icon: Shield,
    title: "Secure Booking",
    description: "End-to-end encrypted transactions with instant confirmation.",
  },
  {
    icon: Zap,
    title: "Instant Access",
    description: "Digital tickets delivered to your inbox in seconds.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

// ==========================================
// Index Component — ab function body hai (pehle arrow expression tha)
// Isko function body mein convert kiya taaki useState + useEffect use kar sakein
// ==========================================
const Index = () => {
  // "events" mein Supabase se aaye hue events store honge
  const [events, setEvents] = useState([]);
  // "loading" = true jab tak data nahi aaya; spinner / message dikhata hai
  const [loading, setLoading] = useState(true);

  // useEffect — component pehli baar render hone par ek baar chalega
  // [] dependency array = sirf once on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // ==========================================
  // fetchEvents — Supabase se events fetch karta hai
  // ==========================================
  const fetchEvents = async () => {
    // supabase.from('events') — events table select karo
    // .select('*')            — saare columns chahiye
    // .order('event_date', { ascending: true }) — earliest event pehle
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      // Agar koi DB error aaya — console mein dekho kya issue hai
      console.error('Events fetch error:', error.message);
    } else {
      // State update karo — React automatically re-render karega
      setEvents(data);
    }
    // Loading khatam — chahe success ho ya error
    setLoading(false);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-foreground">
        {/* Gradient orbs */}
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary-foreground/90">
                <Sparkles className="h-3 w-3" /> Now with smart recommendations
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-primary-foreground sm:text-6xl lg:text-7xl"
            >
              Where Moments
              <br />
              <span className="bg-gradient-to-r from-primary-foreground via-primary-foreground/80 to-primary-foreground/60 bg-clip-text text-transparent">
                Become Memories
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/60 sm:text-lg"
            >
              Discover extraordinary events, book effortlessly, and create
              experiences that last a lifetime. Your next adventure starts here.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <Link to="/signup">
                <Button size="lg" className="gap-2 rounded-xl px-8 text-base font-semibold shadow-lg shadow-primary/25">
                  Start Exploring <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="rounded-xl border-primary/30 bg-primary/5 px-8 text-base font-semibold text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-200">
                  Host an Event
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="mx-auto mt-14 flex max-w-md justify-center divide-x divide-primary-foreground/15"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="px-6 text-center sm:px-8">
                  <p className="text-2xl font-bold text-primary-foreground sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-primary-foreground/50">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-0 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0 divide-border px-4 sm:px-6 lg:px-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex items-start gap-4 px-2 py-8 sm:px-6"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
                <f.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Search + Events Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Upcoming Events
            </h2>
            <p className="mt-2 text-muted-foreground">
              Handpicked experiences waiting for you
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search events..." className="pl-9 rounded-xl bg-card" />
          </div>
        </div>

        {/* ==========================================
            Events Grid — Lesson 2: Real Supabase data
            Pehle placeholderEvents.map() tha
            Ab 3 states hain: loading → empty → data
        ========================================== */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // State 1: Data aa raha hai — loading spinner text
            <p className="col-span-3 py-20 text-center text-muted-foreground">
              Loading events...
            </p>
          ) : events.length === 0 ? (
            // State 2: Data aaya but koi event nahi — empty message
            // Lesson 3 mein events add karenge, tab yahan dikhenga
            <p className="col-span-3 py-20 text-center text-muted-foreground">
              No events yet. Check back soon!
            </p>
          ) : (
            // State 3: Events hain — render karo
            events.map((event, i) => (
              <motion.div
                key={event.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                {/*
                  DB column name   →  EventCard prop
                  event.title      →  title      (same)
                  event.location   →  location   (same)
                  event.category   →  category   (same)
                  event.seats_left →  seatsLeft  (snake_case → camelCase)
                  event.capacity   →  capacity   (same)
                  event.event_date →  date       (Date object → formatted string)
                  event.image_path →  image      (storage path → public URL)
                */}
                <EventCard
                  id={event.id}
                  title={event.title}
                  location={event.location}
                  category={event.category}
                  seatsLeft={event.seats_left}
                  capacity={event.capacity}
                  date={new Date(event.event_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  image={
                    event.image_path
                      // Supabase Storage se public URL nikalo
                      ? supabase.storage.from('event-images').getPublicUrl(event.image_path).data.publicUrl
                      // Fallback: agar koi image nahi hai event ke liye
                      : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'
                  }
                />
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-accent/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to create something extraordinary?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Whether you're hosting an intimate workshop or a large-scale conference,
              Eventix gives you the tools to make it happen.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link to="/dashboard/create">
                <Button size="lg" className="gap-2 rounded-xl px-8">
                  Create Your Event <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
