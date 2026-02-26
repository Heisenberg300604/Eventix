// ==========================================
// Navbar.jsx — Top Navigation Bar
// ==========================================
// The Navbar appears on all public pages (via MainLayout).
//
// It adapts based on authentication state:
//  - Logged OUT → Shows "Log in" and "Get Started" buttons
//  - Logged IN  → Shows user avatar with a dropdown menu
//    (Dashboard, Profile, My Bookings, Sign Out)
//
// Key concepts:
//  - useAuth(): our custom hook to access user & profile data
//  - useState: toggles for mobile menu and user dropdown
//  - useEffect: "click outside" listener to close dropdown
//  - useRef: references the dropdown container for outside-click detection
//  - useNavigate: programmatic navigation (e.g., after sign out)
// ==========================================

import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  Menu,
  X,
  ArrowRight,
  User,
  LayoutDashboard,
  Ticket,
  LogOut,
  ChevronDown,
  CalendarCheck,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

// ---- Static nav links shown to all users ----
const navLinks = [
  { to: "/", label: "Events" },
];

const Navbar = () => {
  // --- State ---
  // Controls mobile hamburger menu visibility
  const [mobileOpen, setMobileOpen] = useState(false);
  // Controls user avatar dropdown visibility (desktop)
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // --- Hooks ---
  const location = useLocation();
  const navigate = useNavigate();

  // Get auth state from our context
  // "user" = Supabase Auth user (null if logged out)
  // "profile" = custom profile from "profiles" table
  // "signOut" = function to log the user out
  // "isOrganizer" / "isAttendee" = role booleans (from profile.user_type)
  const { user, profile, signOut, loading, isOrganizer, isAttendee } = useAuth();

  // --- Ref for dropdown "click outside" detection ---
  // We attach this ref to the dropdown container.
  // When user clicks anywhere OUTSIDE this element, we close the dropdown.
  const dropdownRef = useRef(null);

  // --- Click Outside Handler ---
  // This effect adds a global click listener when the dropdown is open.
  // If the click target is NOT inside the dropdown, we close it.
  useEffect(() => {
    const handleClickOutside = (event) => {
      // dropdownRef.current points to our dropdown <div>
      // .contains() checks if the clicked element is inside it
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    // Only add listener when dropdown is actually open (performance optimization)
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup: remove listener when dropdown closes or component unmounts
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // --- Sign Out Handler ---
  // Calls our signOut function from AuthContext, then redirects to home
  const handleSignOut = async () => {
    setDropdownOpen(false);  // Close dropdown first
    setMobileOpen(false);    // Close mobile menu too
    await signOut();         // Clear session from Supabase
    navigate("/");           // Redirect to landing page
  };

  // --- Helper: Get user's display name ---
  // We try the profile first (from our DB), then fall back to
  // the Supabase Auth metadata, then finally just show "User"
  const displayName = profile?.full_name
    || user?.user_metadata?.full_name
    || "User";

  // --- Helper: Get user's initials for the avatar circle ---
  // e.g., "John Doe" → "JD", "alice" → "A"
  const initials = displayName
    .split(" ")                    // Split into words
    .map((word) => word[0])        // Take first letter of each
    .join("")                      // Join them together
    .toUpperCase()                 // Make uppercase
    .slice(0, 2);                  // Max 2 characters

  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ========== LOGO ========== */}
        {/* Clicking the logo always takes you to the homepage */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Calendar className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Event<span className="text-gradient">ix</span>
          </span>
        </Link>

        {/* ========== DESKTOP NAV LINKS ========== */}
        {/* These links are hidden on mobile (md:flex shows them on medium+ screens) */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200",
                // Highlight the active link with accent colors
                location.pathname === link.to
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* Show "My Bookings" ONLY for attendees */}
          {user && isAttendee && (
            <Link
              to="/my-bookings"
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200",
                location.pathname === "/my-bookings"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              My Bookings
            </Link>
          )}

          {/* Show "My Events" ONLY for organizers — they manage events, not book them */}
          {user && isOrganizer && (
            <Link
              to="/dashboard"
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200",
                location.pathname === "/dashboard"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              My Events
            </Link>
          )}
        </div>

        {/* ========== DESKTOP RIGHT SECTION ========== */}
        <div className="hidden items-center gap-3 md:flex">
          {/* 
            Conditional rendering based on auth state:
            - If still loading → show nothing (avoid flash of wrong state)
            - If logged in → show avatar + dropdown
            - If logged out → show Log in / Get Started buttons
          */}
          {!loading && user ? (
            // ---- LOGGED IN: Avatar + Dropdown ----
            <div className="relative" ref={dropdownRef}>
              {/* Avatar button — clicking it toggles the dropdown */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted"
              >
                {/* Circular avatar with user initials */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {initials}
                </div>
                {/* User's name + chevron arrow */}
                <span className="text-sm font-medium text-foreground">
                  {displayName}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                    // Rotate the chevron when dropdown is open
                    dropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {/* ---- Dropdown Menu ---- */}
              {/* Only rendered when dropdownOpen is true */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User info header */}
                  <div className="border-b border-border px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>

                  {/* Navigation links — role-aware */}
                  <div className="py-1.5">
                    {/* Dashboard link — organizers only (attendees go directly to profile) */}
                    {isOrganizer && (
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        Dashboard
                      </Link>
                    )}

                    {/* Profile link — routes differently based on role */}
                    <Link
                      to={isAttendee ? "/profile" : "/dashboard/profile"}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      My Profile
                    </Link>

                    {/* "My Bookings" — only for attendees */}
                    {isAttendee && (
                      <Link
                        to="/my-bookings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                        My Bookings
                      </Link>
                    )}

                    {/* "My Events" — only for organizers */}
                    {isOrganizer && (
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                        My Events
                      </Link>
                    )}
                  </div>

                  {/* Sign out button with destructive red color */}
                  <div className="border-t border-border py-1.5">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : !loading ? (
            // ---- LOGGED OUT: Login + Signup buttons ----
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="gap-1.5 rounded-lg">
                  Get Started <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </>
          ) : null}
        </div>

        {/* ========== MOBILE HAMBURGER BUTTON ========== */}
        {/* Visible only on small screens (md:hidden) */}
        <button
          className="rounded-lg p-2 hover:bg-muted md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {/* Toggle between hamburger (☰) and close (✕) icons */}
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ========== MOBILE MENU ========== */}
      {/* Slides down when mobileOpen is true, hidden on desktop (md:hidden) */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {/* Nav links */}
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  location.pathname === link.to
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Logged-in mobile links — role-aware */}
            {user && (
              <>
                {/* Dashboard — only for organizers */}
                {isOrganizer && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      location.pathname === "/dashboard"
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Dashboard
                  </Link>
                )}

                {/* My Events — organizers only */}
                {isOrganizer && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    My Events
                  </Link>
                )}

                {/* Profile — routes to /profile for attendees, /dashboard/profile for organizers */}
                <Link
                  to={isAttendee ? "/profile" : "/dashboard/profile"}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    (location.pathname === "/profile" || location.pathname === "/dashboard/profile")
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  My Profile
                </Link>

                {/* My Bookings — attendees only */}
                {isAttendee && (
                  <Link
                    to="/my-bookings"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      location.pathname === "/my-bookings"
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    My Bookings
                  </Link>
                )}
              </>
            )}

            {/* Auth buttons / Sign out */}
            <div className="mt-3 border-t border-border pt-3">
              {user ? (
                // Logged in: show user info + sign out button
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{displayName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </Button>
                </div>
              ) : (
                // Logged out: show Login + Sign up buttons
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Log in</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex-1">
                    <Button size="sm" className="w-full">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
