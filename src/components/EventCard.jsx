import { Link } from "react-router-dom";
import { MapPin, CalendarDays, Users, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const EventCard = ({ id, title, date, location, image, seatsLeft, category }) => {
  const soldOut = seatsLeft === 0;

  return (
    <Link to={`/event/${id}`} className="group block">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent" />
          {category && (
            <Badge className="absolute left-3 top-3 rounded-lg border-0 bg-card/90 text-card-foreground backdrop-blur-md text-xs font-medium shadow-md">
              {category}
            </Badge>
          )}
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/60 backdrop-blur-sm">
              <span className="rounded-full bg-destructive px-4 py-1.5 text-sm font-bold text-destructive-foreground shadow-lg">
                Sold Out
              </span>
            </div>
          )}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-lg font-bold text-primary-foreground line-clamp-1 drop-shadow-lg">
              {title}
            </h3>
          </div>
          <div className="absolute right-3 top-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-card/90 backdrop-blur-md text-card-foreground shadow-md"
            >
              <ArrowUpRight className="h-4 w-4" />
            </motion.div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex flex-col gap-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                </div>
                <span>{date}</span>
              </span>
            </div>
            <span className="flex items-center gap-2 text-muted-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-3.5 w-3.5 text-primary" />
              </div>
              <span>{location}</span>
            </span>
            {!soldOut && (
              <span className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className={seatsLeft < 20 ? "font-semibold text-destructive" : "text-muted-foreground"}>
                  {seatsLeft} seats left
                </span>
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default EventCard;
