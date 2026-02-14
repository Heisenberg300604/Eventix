import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const statusConfig = {
  confirmed: { label: "Confirmed", className: "bg-success/10 text-success border-success/20" },
  pending: { label: "Pending", className: "bg-warning/10 text-warning border-warning/20" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const BookingCard = ({ eventTitle, date, location, tickets, status }) => {
  const s = statusConfig[status];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors duration-200">
            {eventTitle}
          </h3>
          <div className="mt-4 flex flex-col gap-2.5 text-sm">
            <span className="flex items-center gap-2.5 text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>
              <span>{date}</span>
            </span>
            <span className="flex items-center gap-2.5 text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <span>{location}</span>
            </span>
            <span className="flex items-center gap-2.5 text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Ticket className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium text-foreground">{tickets} ticket{tickets > 1 ? "s" : ""}</span>
            </span>
          </div>
        </div>
        <Badge variant="outline" className={`rounded-lg border ${s.className} font-medium px-3 py-1.5`}>
          {s.label}
        </Badge>
      </div>
    </motion.div>
  );
};

export default BookingCard;
