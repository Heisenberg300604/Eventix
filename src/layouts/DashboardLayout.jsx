import { Outlet, Link, useLocation } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Calendar, LayoutDashboard, PlusCircle, ArrowLeft, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const mobileLinks = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/create", label: "Create", icon: PlusCircle },
];

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />

      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            Eventix
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {mobileOpen && (
          <div className="border-b border-border bg-card px-4 py-3 lg:hidden">
            {mobileLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                  location.pathname === link.to
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
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

        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
