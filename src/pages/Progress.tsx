import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import PageLoader from "../components/ui/PageLoader";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { api } from "../lib/api";
import type { ProgressPoint } from "../types";
import { TrendingUp, Dumbbell, Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface SessionRecord {
  id: string;
  day_name: string;
  completed_at: string;
  notes?: string;
  exercises: {
    exercise_name: string;
    sets_completed: number;
    reps_completed: string;
    weight_kg: number | null;
    rpe_actual: number | null;
  }[];
}

// ─── Mini gráfica SVG ────────────────────────────────────────────────────────
function MiniChart({ data }: { data: ProgressPoint[] }) {
  const weights = data.map((d) => d.weightKg ?? 0).filter((w) => w > 0);
  if (weights.length < 2) {
    return (
      <p className="text-xs text-[var(--color-muted)] text-center py-6">
        Necesitas al menos 2 registros con peso para ver la gráfica
      </p>
    );
  }

  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;
  const W = 300; const H = 80; const pad = 12;

  const points = data
    .filter((d) => d.weightKg && d.weightKg > 0)
    .map((d, i, arr) => ({
      x: pad + (i / (arr.length - 1)) * (W - pad * 2),
      y: H - pad - (((d.weightKg ?? 0) - min) / range) * (H - pad * 2),
      weight: d.weightKg,
      date: new Date(d.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
    }));

  const trend = weights[weights.length - 1] - weights[0];
  const trendColor = trend >= 0 ? "var(--color-accent)" : "#f87171";

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none" stroke={trendColor} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill={trendColor} />
            <title>{`${p.date}: ${p.weight}kg`}</title>
          </g>
        ))}
      </svg>
      <div className="flex justify-between text-xs text-[var(--color-muted)] mt-1">
        <span>{points[0]?.date}</span>
        <span className="font-medium" style={{ color: trendColor }}>
          {trend >= 0 ? "+" : ""}{trend.toFixed(1)} kg
        </span>
        <span>{points[points.length - 1]?.date}</span>
      </div>
    </div>
  );
}

// ─── Panel de un ejercicio (carga datos al montarse) ─────────────────────────
function ExercisePanel({ exerciseName, userId }: { exerciseName: string; userId: string }) {
  const [data, setData] = useState<ProgressPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getExerciseProgress(userId, exerciseName)
      .then(setData).catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [exerciseName, userId]);

  const latest = data[data.length - 1];
  const first  = data[0];

  return (
    <div className="space-y-4">
      {/* Stats del ejercicio */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[var(--color-card)] rounded-xl p-3 text-center">
          <p className="text-xs text-[var(--color-muted)] mb-1">Registros</p>
          <p className="font-bold text-lg">{data.length}</p>
        </div>
        <div className="bg-[var(--color-card)] rounded-xl p-3 text-center">
          <p className="text-xs text-[var(--color-muted)] mb-1">Último peso</p>
          <p className="font-bold text-lg text-[var(--color-accent)]">
            {latest?.weightKg ? `${latest.weightKg}kg` : "—"}
          </p>
        </div>
        <div className="bg-[var(--color-card)] rounded-xl p-3 text-center">
          <p className="text-xs text-[var(--color-muted)] mb-1">Primer peso</p>
          <p className="font-bold text-lg">
            {first?.weightKg ? `${first.weightKg}kg` : "—"}
          </p>
        </div>
      </div>

      {/* Gráfica */}
      {loading ? (
        <div className="h-20 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <MiniChart data={data} />
      )}

      {/* Tabla de registros */}
      {data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-muted)]">
                <th className="text-left px-4 py-2 font-medium">Fecha</th>
                <th className="text-center px-4 py-2 font-medium">Series</th>
                <th className="text-center px-4 py-2 font-medium">Reps</th>
                <th className="text-center px-4 py-2 font-medium">Peso</th>
                <th className="text-center px-4 py-2 font-medium">RPE</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d, i) => (
                <tr key={i} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-4 py-2 text-[var(--color-muted)]">
                    {new Date(d.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-4 py-2 text-center">{d.sets}</td>
                  <td className="px-4 py-2 text-center">{d.reps}</td>
                  <td className="px-4 py-2 text-center text-[var(--color-accent)] font-medium">
                    {d.weightKg ? `${d.weightKg}kg` : "—"}
                  </td>
                  <td className="px-4 py-2 text-center">{d.rpeActual ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Historial paginado ───────────────────────────────────────────────────────
const PAGE_SIZE = 5;

function SessionHistory({ sessions }: { sessions: SessionRecord[] }) {
  const [page, setPage] = useState(0);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const totalPages = Math.ceil(sessions.length / PAGE_SIZE);
  const paginated = sessions.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      <div className="space-y-3 mb-4">
        {paginated.map((session) => (
          <Card key={session.id} variant="bordered" className="overflow-hidden">
            <button
              className="w-full flex items-center justify-between text-left"
              onClick={() =>
                setExpandedSession(expandedSession === session.id ? null : session.id)
              }
            >
              <div>
                <p className="font-medium">{session.day_name}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {new Date(session.completed_at).toLocaleDateString("es-ES", {
                    weekday: "long", day: "numeric", month: "long",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-muted)]">
                  {session.exercises.length} ejercicios
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[var(--color-muted)] transition-transform ${
                    expandedSession === session.id ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {expandedSession === session.id && (
              <div className="mt-4 space-y-2 border-t border-[var(--color-border)] pt-4">
                {session.exercises.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-muted)]">{ex.exercise_name}</span>
                    <span>
                      {ex.sets_completed}x{ex.reps_completed}
                      {ex.weight_kg ? (
                        <span className="text-[var(--color-accent)] ml-2">{ex.weight_kg}kg</span>
                      ) : null}
                    </span>
                  </div>
                ))}
                {session.notes && (
                  <p className="text-xs text-[var(--color-muted)] pt-2 border-t border-[var(--color-border)] italic">
                    {session.notes}
                  </p>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setPage((p) => p - 1); setExpandedSession(null); }}
            disabled={page === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--color-card)] transition-colors text-[var(--color-muted)]"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          <span className="text-xs text-[var(--color-muted)]">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => { setPage((p) => p + 1); setExpandedSession(null); }}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--color-card)] transition-colors text-[var(--color-muted)]"
          >
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Progress() {
  const { user, plan, isLoading } = useAuth();
  const [sessions, setSessions]     = useState<SessionRecord[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeExercise, setActiveExercise] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    api.getSessions(user.id)
      .then(setSessions).catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/auth/sign-in" replace />;
  if (!plan) return <Navigate to="/onboarding" replace />;

  const allExercises = Array.from(
    new Set(
      sessions.flatMap((s) =>
        s.exercises.filter((e) => e.weight_kg !== null).map((e) => e.exercise_name)
      )
    )
  );

  const totalSessions = sessions.length;
  const lastSession   = sessions[0];
  const uniqueDays    = new Set(sessions.map((s) => s.day_name)).size;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Tu Progreso</h1>
          <p className="text-[var(--color-muted)]">Evolución de tus entrenamientos registrados</p>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Dumbbell,   label: "Sesiones",      value: totalSessions },
            { icon: Calendar,   label: "Días distintos", value: uniqueDays },
            { icon: TrendingUp, label: "Último entreno",
              value: lastSession
                ? new Date(lastSession.completed_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
                : "—"
            },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} variant="bordered" className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[var(--color-accent)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted)]">{label}</p>
                <p className="font-bold text-xl">{value}</p>
              </div>
            </Card>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <Card variant="bordered" className="text-center py-16">
            <Dumbbell className="w-10 h-10 text-[var(--color-muted)] mx-auto mb-3" />
            <p className="font-semibold mb-1">Sin sesiones registradas</p>
            <p className="text-sm text-[var(--color-muted)]">
              Registra tu primer entrenamiento para ver tu progreso aquí
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">

            {/* Progreso por ejercicio — tabs */}
            <div>
              <h2 className="font-semibold text-lg mb-4">Progreso por ejercicio</h2>
              {allExercises.length === 0 ? (
                <Card variant="bordered" className="text-center py-8">
                  <p className="text-sm text-[var(--color-muted)]">
                    Registra el peso usado en tus ejercicios para ver la evolución
                  </p>
                </Card>
              ) : (
                <Card variant="bordered" className="space-y-4">
                  {/* Tabs de ejercicios */}
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                    {allExercises.map((ex, i) => (
                      <button
                        key={ex}
                        onClick={() => setActiveExercise(i)}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                          activeExercise === i
                            ? "bg-[var(--color-accent)] text-[var(--color-background)]"
                            : "bg-[var(--color-card)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                        }`}
                      >
                        {ex}
                      </button>
                    ))}
                  </div>

                  {/* Panel del ejercicio activo */}
                  <ExercisePanel
                    key={allExercises[activeExercise]}
                    exerciseName={allExercises[activeExercise]}
                    userId={user.id}
                  />
                </Card>
              )}
            </div>

            {/* Historial paginado */}
            <div>
              <h2 className="font-semibold text-lg mb-4">
                Historial
                <span className="text-sm font-normal text-[var(--color-muted)] ml-2">
                  ({sessions.length} sesiones)
                </span>
              </h2>
              <SessionHistory sessions={sessions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
