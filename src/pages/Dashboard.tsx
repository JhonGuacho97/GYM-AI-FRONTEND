import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/ui/PageLoader";
import { Card } from "../components/ui/Card";
import { api } from "../lib/api";
import {
  Flame,
  Dumbbell,
  Calendar,
  Scale,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Beef,
  Wheat,
  Droplets,
  Zap,
} from "lucide-react";

interface FoodLog {
  id: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}
interface Session {
  id: string;
  day_name: string;
  completed_at: string;
  exercises: { exercise_name: string }[];
}
interface NutritionGoals {
  calories_target: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}
interface Measurement {
  weight_kg: number;
  measured_at: string;
}

// ─── Mini ring ──────────────────────────────────────────────────────────────
function Ring({
  pct,
  color,
  size = 48,
}: {
  pct: number;
  color: string;
  size?: number;
}) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const filled = Math.min(pct / 100, 1) * circ;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="4"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
}

// ─── Racha de días ──────────────────────────────────────────────────────────
function calcStreak(sessions: Session[]): number {
  if (!sessions.length) return 0;
  const days = [
    ...new Set(sessions.map((s) => new Date(s.completed_at).toDateString())),
  ]
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  let expected = new Date();
  expected.setHours(0, 0, 0, 0);

  for (const day of days) {
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((expected.getTime() - d.getTime()) / 86400000);
    if (diff <= 1) {
      streak++;
      expected = d;
    } else break;
  }
  return streak;
}

export default function Dashboard() {
  const { user, plan, userProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [foods, setFoods] = useState<FoodLog[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [nutrition, setNutrition] = useState<NutritionGoals | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [_, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.allSettled([
      api.getTodayFoods(user.id),
      api.getSessions(user.id),
      api.getNutrition(user.id),
      api.getMeasurements(user.id),
    ])
      .then(([f, s, n, m]) => {
        if (f.status === "fulfilled") setFoods(f.value);
        if (s.status === "fulfilled") setSessions(s.value);
        if (n.status === "fulfilled") setNutrition(n.value);
        if (m.status === "fulfilled") setMeasurements(m.value);
      })
      .finally(() => setDataLoading(false));
  }, [user?.id]);

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/auth/sign-in" replace />;
  if (!plan) return <Navigate to="/onboarding" replace />;

  // Calcular datos
  const todayTotals = foods.reduce(
    (acc, f) => ({
      cal: acc.cal + f.calories,
      p: acc.p + f.protein_g,
      c: acc.c + f.carbs_g,
      g: acc.g + f.fat_g,
    }),
    { cal: 0, p: 0, c: 0, g: 0 },
  );
  const calTarget = nutrition?.calories_target ?? 2000;
  const calPct = Math.min((todayTotals.cal / calTarget) * 100, 100);
  const streak = calcStreak(sessions);
  const lastSession = sessions[0];
  const latestWeight = measurements[0]?.weight_kg ?? userProfile?.weightKg;
  const initialWeight = userProfile?.weightKg;
  const weightDiff =
    latestWeight && initialWeight ? latestWeight - initialWeight : null;

  // Próximo día del plan (el primero que no se entrenó hoy)
  const todayName = new Date().toLocaleDateString("es-ES", { weekday: "long" });
  const todayCapitalized =
    todayName.charAt(0).toUpperCase() + todayName.slice(1);
  const nextDay =
    plan.weeklySchedule.find(
      (d) => d.day.toLowerCase() === todayCapitalized.toLowerCase(),
    ) ?? plan.weeklySchedule[0];

  const firstName =
    (user as any).name?.split(" ")[0] ||
    (user as any).email?.split("@")[0] ||
    "atleta";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 page-enter">
      <div className="max-w-4xl mx-auto">
        {/* Header saludo */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">
            {greeting}, {firstName}
          </h1>
          <p className="text-[var(--color-muted)]">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        {/* Fila principal: Calorías + Racha + Peso */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Calorías del día */}
          <Link to="/nutrition" className="col-span-1">
            <Card
              variant="bordered"
              className="h-full hover:border-[var(--color-muted)] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[var(--color-muted)]">
                  Calorías hoy
                </p>
                <Flame className="w-4 h-4 text-[var(--color-accent)]" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round(todayTotals.cal)}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    / {calTarget} kcal
                  </p>
                </div>
                <Ring
                  pct={calPct}
                  color={calPct >= 100 ? "#f87171" : "var(--color-accent)"}
                />
              </div>
              <div className="mt-3 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${calPct}%`,
                    backgroundColor:
                      calPct >= 100 ? "#f87171" : "var(--color-accent)",
                  }}
                />
              </div>
            </Card>
          </Link>

          {/* Racha */}
          <Card variant="bordered" className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-[var(--color-accent)]" />
              <p className="text-xs text-[var(--color-muted)]">Racha</p>
            </div>
            <p className="text-4xl font-bold text-[var(--color-accent)]">
              {streak}
            </p>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              {streak === 1 ? "día seguido" : "días seguidos"}
            </p>
            <p className="text-xs text-[var(--color-muted)] mt-2">
              {sessions.length} sesiones totales
            </p>
          </Card>

          {/* Peso */}
          <Link to="/body" className="col-span-1">
            <Card
              variant="bordered"
              className="h-full hover:border-[var(--color-muted)] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[var(--color-muted)]">Peso actual</p>
                <Scale className="w-4 h-4 text-[var(--color-accent)]" />
              </div>
              <p className="text-2xl font-bold">
                {latestWeight ? `${latestWeight} kg` : "—"}
              </p>
              {weightDiff !== null && (
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp
                    className={`w-3 h-3 ${weightDiff >= 0 ? "text-[var(--color-accent)]" : "text-blue-400"}`}
                  />
                  <p
                    className={`text-xs font-medium ${weightDiff >= 0 ? "text-[var(--color-accent)]" : "text-blue-400"}`}
                  >
                    {weightDiff > 0 ? "+" : ""}
                    {weightDiff.toFixed(1)} kg desde inicio
                  </p>
                </div>
              )}
              <p className="text-xs text-[var(--color-muted)] mt-2">
                Objetivo:{" "}
                {userProfile?.goal === "bulk"
                  ? "ganar masa"
                  : userProfile?.goal === "cut"
                    ? "perder grasa"
                    : "recomposición"}
              </p>
            </Card>
          </Link>
        </div>

        {/* Macros del día */}
        <Link to="/nutrition">
          <Card
            variant="bordered"
            className="mb-4 hover:border-[var(--color-muted)] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Macros del día</p>
              <ArrowRight className="w-4 h-4 text-[var(--color-muted)]" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Proteína",
                  current: todayTotals.p,
                  target: nutrition?.protein_g ?? 150,
                  color: "var(--color-accent)",
                  icon: Beef,
                },
                {
                  label: "Carbos",
                  current: todayTotals.c,
                  target: nutrition?.carbs_g ?? 200,
                  color: "#60a5fa",
                  icon: Wheat,
                },
                {
                  label: "Grasas",
                  current: todayTotals.g,
                  target: nutrition?.fat_g ?? 60,
                  color: "#f97316",
                  icon: Droplets,
                },
              ].map(({ label, current, target, color, icon: Icon }) => {
                const pct = Math.min((current / (target || 1)) * 100, 100);
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                        <span className="text-xs text-[var(--color-muted)]">
                          {label}
                        </span>
                      </div>
                      <span className="text-xs font-medium">
                        {Math.round(current)}g
                      </span>
                    </div>
                    <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <p className="text-xs text-[var(--color-muted)] mt-1">
                      / {target}g
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </Link>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Próximo entrenamiento */}
          <Link to="/profile">
            <Card
              variant="bordered"
              className="hover:border-[var(--color-muted)] transition-colors cursor-pointer h-full"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-[var(--color-accent)]" />
                  <p className="text-sm font-medium">Entrenamiento de hoy</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--color-muted)]" />
              </div>
              {nextDay ? (
                <div>
                  <p className="font-semibold text-lg">{nextDay.day}</p>
                  <p className="text-sm text-[var(--color-accent)] mb-3">
                    {nextDay.focus}
                  </p>
                  <div className="space-y-1.5">
                    {nextDay.exercises.slice(0, 3).map((ex, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
                        <span className="text-[var(--color-muted)] truncate">
                          {ex.name}
                        </span>
                        <span className="text-xs text-[var(--color-muted)] shrink-0">
                          {ex.sets}x{ex.reps}
                        </span>
                      </div>
                    ))}
                    {nextDay.exercises.length > 3 && (
                      <p className="text-xs text-[var(--color-muted)] pl-3.5">
                        +{nextDay.exercises.length - 3} ejercicios más
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--color-muted)]">
                  Sin plan asignado para hoy
                </p>
              )}
            </Card>
          </Link>

          {/* Última sesión */}
          <Link to="/progress">
            <Card
              variant="bordered"
              className="hover:border-[var(--color-muted)] transition-colors cursor-pointer h-full"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--color-accent)]" />
                  <p className="text-sm font-medium">Última sesión</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--color-muted)]" />
              </div>
              {lastSession ? (
                <div>
                  <p className="font-semibold text-lg">
                    {lastSession.day_name}
                  </p>
                  <p className="text-xs text-[var(--color-muted)] mb-3">
                    {new Date(lastSession.completed_at).toLocaleDateString(
                      "es-ES",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      },
                    )}
                  </p>
                  <div className="space-y-1.5">
                    {lastSession.exercises.slice(0, 3).map((ex, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
                        <span className="text-[var(--color-muted)] truncate">
                          {ex.exercise_name}
                        </span>
                      </div>
                    ))}
                    {lastSession.exercises.length > 3 && (
                      <p className="text-xs text-[var(--color-muted)] pl-5">
                        +{lastSession.exercises.length - 3} más
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
                  <Dumbbell className="w-8 h-8 text-[var(--color-muted)]" />
                  <p className="text-sm text-[var(--color-muted)]">
                    Sin sesiones registradas aún
                  </p>
                  {/* 🔥 FIX AQUÍ */}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/log");
                    }}
                    className="text-xs text-[var(--color-accent)] hover:underline cursor-pointer"
                  >
                    Registrar primera sesión →
                  </span>
                </div>
              )}
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
