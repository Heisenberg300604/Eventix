import { Link } from "react-router-dom";
import { CalendarDays, Users, DollarSign, PlusCircle, Edit, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { placeholderEvents } from "@/data/placeholders";
import { motion } from "framer-motion";

const stats = [
  { label: "Total Events", value: "6", icon: CalendarDays, change: "+2 this month" },
  { label: "Total Bookings", value: "148", icon: Users, change: "+23 this week" },
  { label: "Revenue", value: "$12,400", icon: DollarSign, change: "+18% growth" },
];

const Dashboard = () => (
  <div>
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

    {/* Stats */}
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

    {/* Events list */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="mb-4 flex items-center justify-between"
    >
      <h2 className="text-xl font-bold text-foreground">Your Events</h2>
    </motion.div>
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="divide-y divide-border">
        {placeholderEvents.slice(0, 4).map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
            whileHover={{ x: 4 }}
            className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-center gap-4">
              <img
                src={event.image}
                alt={event.title}
                className="h-16 w-16 rounded-xl object-cover shadow-sm"
              />
              <div>
                <p className="font-semibold text-card-foreground">{event.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{event.date} · {event.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="rounded-lg border-border text-muted-foreground font-medium">
                {event.seatsLeft} left
              </Badge>
              <Link to={`/dashboard/edit/${event.id}`}>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default Dashboard;
