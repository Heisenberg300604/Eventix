import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card/50">
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Calendar className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">Eventix</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The modern way to discover, book, and manage unforgettable events.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Platform</h4>
          <div className="flex flex-col gap-2">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browse Events</Link>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Organizer Dashboard</Link>
            <Link to="/dashboard/create" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Create Event</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Account</h4>
          <div className="flex flex-col gap-2">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
            <Link to="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign up</Link>
            <Link to="/my-bookings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">My Bookings</Link>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-border pt-6">
        <p className="text-xs text-muted-foreground">© 2026 Eventix. Crafted with precision.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
