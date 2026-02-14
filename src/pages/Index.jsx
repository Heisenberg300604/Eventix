import { ArrowRight, Sparkles, Shield, Zap, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EventCard from "@/components/EventCard";
import { placeholderEvents } from "@/data/placeholders";
import { motion } from "framer-motion";

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

const Index = () => (
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {placeholderEvents.map((event, i) => (
          <motion.div
            key={event.id}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <EventCard {...event} />
          </motion.div>
        ))}
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

export default Index;
