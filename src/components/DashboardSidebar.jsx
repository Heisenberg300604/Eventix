// ==========================================
// DashboardSidebar.jsx — Sidebar Navigation for Dashboard
// ==========================================
// This sidebar appears on the LEFT side of the dashboard layout.
//
// How it works:
//  - We use useAuth() to check if the user is an "organizer"
//  - If organizer → show the full sidebar with links:
//    Overview, Create Event, My Events, Profile
//  - If attendee → show a minimal sidebar with:
//    Overview, My Bookings, Profile
//  - The sidebar is hidden on mobile (< lg screens)
//    because DashboardLayout handles mobile navigation
//
// Key concepts:
//  - useLocation(): reads the current URL to highlight the active link
//  - useAuth(): reads user role to conditionally show/hide links
//  - cn(): a utility that merges CSS classes (like classnames library)
//  - Conditional rendering with ternary and spread operator
// ==========================================

import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  CalendarCheck,
  ArrowLeft,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

// ---- Sidebar links for ORGANIZER users ----
// The dashboard is organizer-only; attendees have their own pages at /profile and /my-bookings
const organizerLinks = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/create", label: "Create Event", icon: PlusCircle },
  { to: "/dashboard/my-events", label: "My Events", icon: CalendarCheck },
  { to: "/dashboard/profile", label: "Profile", icon: User },
];

const DashboardSidebar = () => {
  // useLocation gives us the current URL path (e.g., "/dashboard/create")
  // We use it to highlight which link is currently "active"
  const location = useLocation();

  // isOrganizer is a boolean from AuthContext derived from profile.user_type
  // The dashboard is organizer-only, so we always use organizerLinks here
  const { isOrganizer } = useAuth();

  // Always show organizer links — the /dashboard route itself blocks non-organizers
  const links = organizerLinks;

  // Section title
  const sectionTitle = "Organizer Panel";

  return (
    // The sidebar is hidden on screens < lg (1024px)
    // On desktop it takes up 64 units (w-64 = 16rem = 256px)
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
      <div className="flex h-full flex-col px-4 py-6">

        {/* ---- Section Title ---- */}
        {/* Small uppercase label at the top of the sidebar */}
        <h2 className="mb-6 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {sectionTitle}
        </h2>

        {/* ---- Navigation Links ---- */}
        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            // Check if this link matches the current URL
            // This determines whether to use the "active" style
            const active = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  // Base styles — always applied
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  // Conditional styles — "active" (highlighted) vs "inactive"
                  active
                    ? "bg-primary text-primary-foreground"          // Active: solid primary color
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground" // Inactive: subtle on hover
                )}
              >
                {/* Render the icon component dynamically */}
                {/* link.icon is a React component (e.g., LayoutDashboard) */}
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* ---- "Back to site" link at the bottom ---- */}
        {/* mt-auto pushes this to the very bottom of the flex container */}
        <div className="mt-auto">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
