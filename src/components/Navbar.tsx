import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Brain, LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";

const NAV = [
  { to: "/" as const, label: "Home", exact: true },
  { to: "/resume-analysis" as const, label: "Resume" },
  { to: "/opportunities" as const, label: "Opportunities" },
  { to: "/market-mapping" as const, label: "Markets" },
  { to: "/confidence-coach" as const, label: "Coach" },
  { to: "/localized-intelligence" as const, label: "Local" },
  { to: "/micro-roadmap" as const, label: "Roadmap" },
  { to: "/campus-partnership" as const, label: "Campus" },
];

const AMBER = "#ffb300";

export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-9 rounded-lg gradient-cyan flex items-center justify-center glow-cyan group-hover:scale-110 transition-transform">
            <Brain className="size-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            ZeroGap<span className="text-gradient-cyan"> AI</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={n.exact ? { exact: true } : undefined}
              className="px-3 py-2 hover:text-primary transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/amd-ryzen"
            className="px-3 py-2 transition-colors hover:bg-[#ffb300]/10 rounded-md"
            style={{ color: AMBER }}
            activeProps={{ style: { color: AMBER, background: `${AMBER}14` } }}
          >
            AMD Ryzen
          </Link>
          {user && (
            <Link to="/dashboard" className="px-3 py-2 hover:text-primary transition-colors" activeProps={{ className: "text-primary" }}>
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden md:inline text-xs text-muted-foreground max-w-[180px] truncate">{user.email}</span>
              <Button size="sm" variant="ghost" onClick={logout} title="Sign out">
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Button size="sm" asChild className="gradient-cyan text-primary-foreground hover:opacity-90">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden size-9 rounded-md border border-border/60 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <nav className="container mx-auto px-4 py-3 flex flex-col">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={n.exact ? { exact: true } : undefined}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm hover:text-primary"
                activeProps={{ className: "text-primary font-semibold" }}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/amd-ryzen"
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm"
              style={{ color: AMBER }}
            >
              AMD Ryzen
            </Link>
            {user && (
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm hover:text-primary"
                activeProps={{ className: "text-primary font-semibold" }}
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
