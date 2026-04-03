import {
  Dumbbell, X, Menu, Home, Dumbbell as DumbbellIcon,
  TrendingUp, Utensils, Scale, User, ClipboardList,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserButton } from "@neondatabase/neon-js/auth/react";
import { useState } from "react";

const navLinks = [
  { to: "/dashboard",    label: "Inicio",    icon: Home          },
  { to: "/profile",      label: "Mi Plan",   icon: DumbbellIcon  },
  { to: "/log",          label: "Registrar", icon: ClipboardList },
  { to: "/progress",     label: "Progreso",  icon: TrendingUp    },
  { to: "/nutrition",    label: "Nutrición", icon: Utensils      },
  { to: "/body",         label: "Cuerpo",    icon: Scale         },
  { to: "/edit-profile", label: "Perfil",    icon: User          },
];

// Links que aparecen en el bottom tab bar (los 5 más usados)
const tabLinks = [
  { to: "/dashboard", icon: Home,          label: "Inicio"    },
  { to: "/profile",   icon: DumbbellIcon,  label: "Plan"      },
  { to: "/log",       icon: ClipboardList, label: "Registrar" },
  { to: "/nutrition", icon: Utensils,      label: "Nutrición" },
  { to: "/progress",  icon: TrendingUp,    label: "Progreso"  },
];

export default function Navbar() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* ── Header top ─────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-background)]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

          <Link
            to={user ? "/dashboard" : "/"}
            className="flex items-center gap-2 text-[var(--color-foreground)]"
          >
            <Dumbbell className="w-5 h-5 text-[var(--color-accent)]" />
            <span className="font-semibold">GymAI</span>
          </Link>

          {user ? (
            <>
              {/* Desktop */}
              <nav className="hidden lg:flex items-center gap-0.5">
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
                <div className="ml-2">
                  <UserButton />
                </div>
              </nav>

              {/* Mobile — solo logo + user + hamburger */}
              <div className="flex items-center gap-2 lg:hidden">
                <UserButton />
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-card)] transition-colors"
                  aria-label="Menú"
                >
                  {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </>
          ) : (
            <nav className="flex items-center gap-2">
              <Link to="/auth/sign-in"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-card)] transition-colors">
                Sign In
              </Link>
              <Link to="/auth/sign-up"
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-hover)] transition-colors">
                Sign Up
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* ── Drawer lateral mobile ──────────────────────────────────────── */}
      {user && (
        <>
          {/* Overlay */}
          <div
            className={`fixed inset-0 z-40 bg-black/60 lg:hidden transition-opacity duration-200 ${
              menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setMenuOpen(false)}
          />

          {/* Panel */}
          <div className={`fixed top-0 right-0 z-50 h-full w-64 bg-[var(--color-background)] border-l border-[var(--color-border)] lg:hidden flex flex-col transition-transform duration-250 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}>
            <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--color-border)]">
              <span className="text-sm font-medium text-[var(--color-muted)]">Menú</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1.5 rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-card)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const active = pathname === to;
                return (
                  <Link key={to} to={to} onClick={() => setMenuOpen(false)}>
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-[var(--color-accent)] text-black"
                        : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-card)]"
                    }`}>
                      <Icon className="w-4 h-4 shrink-0" />
                      {label}
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="px-4 pb-6 pt-3 border-t border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-muted)] text-center">GymAI v1.0</p>
            </div>
          </div>
        </>
      )}

      {/* ── Bottom tab bar ─────────────────────────────────────────────── */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[var(--color-background)]/95 backdrop-blur-md border-t border-[var(--color-border)]">
          <div className="flex items-stretch justify-around">
            {tabLinks.map(({ to, icon: Icon, label }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-h-[56px]"
                >
                  <div className={`p-1.5 rounded-lg transition-all ${
                    active ? "bg-[var(--color-accent)]" : ""
                  }`}>
                    <Icon className={`w-5 h-5 transition-colors ${
                      active ? "text-black" : "text-[var(--color-muted)]"
                    }`} />
                  </div>
                  <span className={`text-[10px] leading-none transition-colors ${
                    active ? "text-[var(--color-accent)] font-medium" : "text-[var(--color-muted)]"
                  }`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
