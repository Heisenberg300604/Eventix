// ==========================================
// App.jsx — Root Application Component
// ==========================================
// This is the MAIN component that defines ALL the routes in our app.
//
// Route structure:
//  /                    → Landing page (public, anyone can see)
//  /events/:id          → Event detail page (public)
//  /login               → Login page (redirects based on role after login)
//  /signup              → Signup page (redirects based on role after signup)
//  /profile             → Attendee profile page (attendee only, MainLayout)
//  /my-bookings         → My Bookings page (attendee only, NOT in dashboard)
//  /dashboard           → Dashboard (ORGANIZER ONLY — attendees are blocked)
//  /dashboard/create    → Create event form (organizer only)
//  /dashboard/edit/:id  → Edit event form (organizer only)
//  /dashboard/profile   → Organizer dashboard profile (organizer only)
//  *                    → 404 Not Found page
//
// Key concepts:
//  - <Routes> / <Route>: React Router components for defining URL → component mapping
//  - <Navigate>: programmatic redirect (e.g., logged-in users can't see /login)
//  - <ProtectedRoute>: our custom wrapper that checks auth before rendering
//  - <MainLayout>: public layout with Navbar + Footer
//  - <DashboardLayout>: dashboard layout with Sidebar (organizers only)
//  - <Outlet>: renders the matched child route inside a layout
// ==========================================

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import EventDetails from './pages/EventDetails';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import AttendeeProfile from './pages/AttendeeProfile';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';


function App() {
  // ---- Get auth state from context ----
  // "user": the logged-in user (or null if logged out)
  // "loading": true while Supabase checks for an existing session
  const { user, loading, isAttendee } = useAuth();

  return (
    <Routes>
      {/* ==============================
          PUBLIC + ATTENDEE ROUTES
          ==============================
          These routes use <MainLayout> which includes the Navbar and Footer.
          The index "/" and "/events/:id" are open to everyone.
          "/profile" and "/my-bookings" are attendee-only protected routes
          that still use the public Navbar layout (NOT the dashboard).
      */}
      <Route path="/" element={<MainLayout />}>
        {/* "index" means this renders at the exact "/" path */}
        <Route index element={<Index />} />

        {/* Dynamic route — ":id" becomes a URL parameter */}
        {/* EventCard links to /event/:id (singular), so both routes point to same component */}
        <Route path="events/:id" element={<EventDetails />} />
        <Route path="event/:id" element={<EventDetails />} />

        {/* --- Attendee Profile (Attendee Only) --- */}
        {/* Attendees see their profile in the MainLayout (Navbar + Footer) */}
        {/* They do NOT get the dashboard sidebar — it's a clean profile page */}
        <Route
          path="profile"
          element={
            <ProtectedRoute requiredRole="attend">
              <AttendeeProfile />
            </ProtectedRoute>
          }
        />

        {/* --- My Bookings (Attendee Only) --- */}
        {/* Lives at /my-bookings — completely separate from the /dashboard */}
        {/* Attendees access this from the Navbar, NOT from a dashboard sidebar */}
        <Route
          path="my-bookings"
          element={
            <ProtectedRoute requiredRole="attend">
              <MyBookings />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ==============================
          AUTH ROUTES (Login / Signup)
          ==============================
          These pages are for logged-out users only.
          If a logged-in user tries to visit /login or /signup,
          they get redirected automatically.

          We also handle the "loading" state:
          While auth is initializing, show a spinner instead of
          briefly flashing the login form and then redirecting.
      */}
      <Route
        path="/login"
        element={
          loading ? (
            // Auth still loading → show spinner (prevents flash)
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : user ? (
            // Already logged in → route by role
            // Attendees have no dashboard, send them to My Bookings
            <Navigate to={isAttendee ? "/my-bookings" : "/dashboard"} replace />
          ) : (
            // Not logged in → show login page
            <Login />
          )
        }
      />
      <Route
        path="/signup"
        element={
          loading ? (
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : user ? (
            <Navigate to={isAttendee ? "/my-bookings" : "/dashboard"} replace />
          ) : (
            <Signup />
          )
        }
      />

      {/* ==============================
          ORGANIZER-ONLY DASHBOARD ROUTES
          ==============================
          All routes under /dashboard are ORGANIZER ONLY.
          Attendees are blocked — they get an "Access Denied" screen
          if they try to navigate here directly.

          The dashboard uses <DashboardLayout> which includes:
          - A sidebar (desktop) or hamburger menu (mobile)
          - The main content area where child routes render via <Outlet />
      */}
      <Route
        path="/dashboard"
        element={
          // requiredRole="organize" → attendees are blocked here
          <ProtectedRoute requiredRole="organize">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* --- Overview (Organizer Only) --- */}
        <Route index element={<Dashboard />} />

        {/* --- Create Event (Organizer Only) --- */}
        {/* The nested <ProtectedRoute requiredRole="organize"> checks
            that the user's profile.user_type === "organize" */}
        <Route
          path="create"
          element={
            <ProtectedRoute requiredRole="organize">
              <CreateEvent />
            </ProtectedRoute>
          }
        />

        {/* --- Edit Event (Organizer Only) --- */}
        {/* ":id" is a dynamic segment → the event ID to edit */}
        <Route
          path="edit/:id"
          element={
            <ProtectedRoute requiredRole="organize">
              <EditEvent />
            </ProtectedRoute>
          }
        />

        {/* --- Organizer Dashboard Profile (Organizer Only) --- */}
        {/* Only organizers see the dashboard-style profile page */}
        <Route
          path="profile"
          element={
            <ProtectedRoute requiredRole="organize">
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ==============================
          404 — CATCH-ALL ROUTE
          ==============================
          "*" matches any URL that didn't match the routes above.
          This shows a friendly "Page Not Found" message.
      */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
