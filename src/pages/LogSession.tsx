import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import PageLoader from "../components/ui/PageLoader";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Textarea } from "../components/ui/Textarea";
import { api } from "../lib/api";
import type { DaySchedule, SessionExerciseInput } from "../types";
import { CheckCircle2, ChevronDown, ChevronUp, Dumbbell } from "lucide-react";

interface ExerciseLog {
  setsCompleted: number;
  repsCompleted: string;
  weightKg: string;
  rpeActual: string;
}

function ExerciseLogRow({
  exercise,
  log,
  onChange,
}: {
  exercise: { name: string; sets: number; reps: string; rpe: number };
  log: ExerciseLog;
  onChange: (log: ExerciseLog) => void;
}) {
  return (
    <div className="border border-[var(--color-border)] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-medium">{exercise.name}</p>
        <span className="text-xs text-[var(--color-muted)] bg-[var(--color-card)] px-2 py-1 rounded-lg">
          Plan: {exercise.sets}x{exercise.reps} · RPE {exercise.rpe}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-[var(--color-muted)] mb-1 block">Series</label>
          <input
            type="number"
            min={1}
            value={log.setsCompleted}
            onChange={(e) => onChange({ ...log, setsCompleted: Number(e.target.value) })}
            className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--color-muted)] mb-1 block">Reps</label>
          <input
            type="text"
            placeholder={exercise.reps}
            value={log.repsCompleted}
            onChange={(e) => onChange({ ...log, repsCompleted: e.target.value })}
            className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--color-muted)] mb-1 block">Peso (kg)</label>
          <input
            type="number"
            min={0}
            step={0.5}
            placeholder="—"
            value={log.weightKg}
            onChange={(e) => onChange({ ...log, weightKg: e.target.value })}
            className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--color-muted)] mb-1 block">RPE real</label>
          <input
            type="number"
            min={1}
            max={10}
            placeholder={String(exercise.rpe)}
            value={log.rpeActual}
            onChange={(e) => onChange({ ...log, rpeActual: e.target.value })}
            className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      </div>
    </div>
  );
}

export default function LogSession() {
  const { user, plan, isLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<DaySchedule | null>(null);
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showDays, setShowDays] = useState(true);

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/auth/sign-in" replace />;
  if (!plan) return <Navigate to="/onboarding" replace />;

  function selectDay(day: DaySchedule) {
    setSelectedDay(day);
    setLogs(
      day.exercises.map((ex) => ({
        setsCompleted: ex.sets,
        repsCompleted: ex.reps,
        weightKg: "",
        rpeActual: "",
      }))
    );
    setShowDays(false);
    setSaved(false);
    setError("");
  }

  function updateLog(index: number, log: ExerciseLog) {
    setLogs((prev) => prev.map((l, i) => (i === index ? log : l)));
  }

  async function handleSave() {
    if (!selectedDay) return;
    setSaving(true);
    setError("");
    try {
      const exercises: SessionExerciseInput[] = selectedDay.exercises.map((ex, i) => ({
        exerciseName:  ex.name,
        setsCompleted: logs[i].setsCompleted,
        repsCompleted: logs[i].repsCompleted || ex.reps,
        weightKg:      logs[i].weightKg ? parseFloat(logs[i].weightKg) : undefined,
        rpeActual:     logs[i].rpeActual ? parseInt(logs[i].rpeActual) : undefined,
      }));

      await api.saveSession(user.id, plan.id, selectedDay.day, exercises, notes || undefined);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 page-enter">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Registrar Sesión</h1>
          <p className="text-[var(--color-muted)]">
            Selecciona el día que entrenaste hoy
          </p>
        </div>

        {/* Selector de día */}
        <Card variant="bordered" className="mb-6">
          <button
            onClick={() => setShowDays(!showDays)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <Dumbbell className="w-5 h-5 text-[var(--color-accent)]" />
              <div>
                <p className="font-medium text-sm text-[var(--color-muted)]">Día de entrenamiento</p>
                <p className="font-semibold">
                  {selectedDay ? `${selectedDay.day} — ${selectedDay.focus}` : "Selecciona un día"}
                </p>
              </div>
            </div>
            {showDays ? <ChevronUp className="w-4 h-4 text-[var(--color-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--color-muted)]" />}
          </button>

          {showDays && (
            <div className="mt-4 space-y-2">
              {plan.weeklySchedule.map((day) => (
                <button
                  key={day.day}
                  onClick={() => selectDay(day)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                    selectedDay?.day === day.day
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                      : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50"
                  }`}
                >
                  <p className="font-medium">{day.day}</p>
                  <p className="text-xs text-[var(--color-accent)] mt-0.5">{day.focus}</p>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">
                    {day.exercises.length} ejercicios
                  </p>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Ejercicios */}
        {selectedDay && (
          <>
            <div className="space-y-3 mb-6">
              {selectedDay.exercises.map((ex, i) => (
                <ExerciseLogRow
                  key={ex.name}
                  exercise={ex}
                  log={logs[i]}
                  onChange={(log) => updateLog(i, log)}
                />
              ))}
            </div>

            <Card variant="bordered" className="mb-6">
              <Textarea
                id="notes"
                label="Notas de la sesión (opcional)"
                placeholder="¿Cómo te fue? ¿Algo que quieras recordar?"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Card>

            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            {saved ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <CheckCircle2 className="w-12 h-12 text-[var(--color-accent)]" />
                <p className="font-semibold text-lg">¡Sesión guardada!</p>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => { setSelectedDay(null); setShowDays(true); setSaved(false); }}>
                    Registrar otro día
                  </Button>
                  <Button onClick={() => navigate("/progress")}>
                    Ver mi progreso
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar Sesión"}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
