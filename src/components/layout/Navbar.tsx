import { Dumbbell, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserButton } from "@neondatabase/neon-js/auth/react";
import { useState } from "react";

const navLinks = [
  { to: "/dashboard", label: "Inicio"     },
  { to: "/profile",   label: "Mi Plan"    },
  { to: "/log",       label: "Registrar"  },
  { to: "/progress",  label: "Progreso"   },
  { to: "/nutrition", label: "Nutrición"  },
  { to: "/body",      label: "Cuerpo"     },
];

export default function Navbar() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-[var(--color-foreground)]">
          <Dumbbell className="w-6 h-6 text-[var(--color-accent)]" />
          <span className="font-semibold text-lg">GymAI</span>
        </Link>

        {user ? (
          <>
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to}>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    pathname === to
                      ? "nav-link-active"
                      : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-card)]"
                  }`}>
                    {label}
                  </span>
                </Link>
              ))}
              <Link to="/edit-profile">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === "/edit-profile"
                    ? "nav-link-active"
                    : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-card)]"
                }`}>
                  Perfil
                </span>
              </Link>
              <div className="ml-2">
                <UserButton className="bg-(--color-accent)" />
              </div>
            </nav>

            {/* Mobile: hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <UserButton className="bg-(--color-accent)" />
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)]">
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </>
        ) : (
          <nav className="flex items-center gap-2">
            <Link to="/auth/sign-in"
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-card)] transition-colors">
              Sign In
            </Link>
            <Link to="/auth/sign-up"
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-accent)] text-[var(--color-background)] hover:bg-[var(--color-accent-hover)] transition-colors">
              Sign Up
            </Link>
          </nav>
        )}
      </div>

      {/* Mobile menu */}
      {menuOpen && user && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-background)] px-6 py-4 space-y-1">
          {[...navLinks, { to: "/edit-profile", label: "Perfil" }].map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}>
              <div className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                pathname === to
                  ? "bg-[var(--color-accent)] text-black"
                  : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-card)]"
              }`}>
                {label}
              </div>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
