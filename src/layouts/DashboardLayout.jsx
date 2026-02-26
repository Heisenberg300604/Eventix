// ==========================================
// DashboardLayout.jsx — Layout for Dashboard Pages
// ==========================================
// This layout wraps ALL dashboard routes (/dashboard, /dashboard/create, etc.)
//
// Structure:
//  ┌────────────────────────────────────────┐
//  │ Sidebar (desktop)  │  Main Content     │
//  │ - Overview          │                   │
//  │ - Create Event      │   <Outlet />      │
//  │ - My Events         │   (child routes)  │
//  │ - Profile           │                   │
//  │ - Back to site      │                   │
//  └────────────────────────────────────────┘
//
// On mobile (< 1024px), the sidebar is hidden and replaced
// with a hamburger menu at the top.
//
// Key concepts:
//  - <Outlet />: renders the matched child route component
//    (Dashboard.jsx, CreateEvent.jsx, Profile.jsx, etc.)
//  - DashboardSidebar: the actual sidebar component (separate file)
//  - useAuth(): to check user role for mobile menu links
//  - cn(): merges CSS classes conditionally
// ==========================================

import { Outlet, Link, useLocation } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  Calendar,
  LayoutDashboard,
  PlusCircle,
  ArrowLeft,
  Menu,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const DashboardLayout = () => {
  // Controls the mobile hamburger menu
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { profile, user, isOrganizer } = useAuth();

  // ---- Build mobile nav links for ORGANIZER ----
  // The dashboard is organizer-only; attendees access /my-bookings and /profile separately
  const mobileLinks = [
    // "Overview" is always shown
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },

    // Organizer-only links
    ...(isOrganizer
      ? [{ to: "/dashboard/create", label: "Create", icon: PlusCircle }]
      : []),

    // Profile is always shown (both roles can access it via the dashboard)
    { to: "/dashboard/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="flex min-h-screen">
      {/* ---- Desktop Sidebar ---- */}
      {/* This component renders the full sidebar (hidden on mobile) */}
      <DashboardSidebar />

      {/* ---- Main Content Area ---- */}
      <div className="flex flex-1 flex-col">

        {/* ---- Mobile Header (visible only on screens < lg) ---- */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            Eventix
          </Link>
          {/* Hamburger button toggles mobile nav */}
          <button onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* ---- Mobile Navigation Dropdown ---- */}
        {/* Only visible when hamburger is toggled open on small screens */}
        {mobileOpen && (
          <div className="border-b border-border bg-card px-4 py-3 lg:hidden">
            {mobileLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)} // Close menu after clicking
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                  // Highlight active link
                  location.pathname === link.to
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            {/* "Back to site" link */}
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to site
            </Link>
          </div>
        )}

        {/* ---- Page Content ---- */}
        {/* <Outlet /> renders whatever child route is currently matched */}
        {/* e.g., /dashboard → Dashboard.jsx, /dashboard/profile → Profile.jsx */}
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
