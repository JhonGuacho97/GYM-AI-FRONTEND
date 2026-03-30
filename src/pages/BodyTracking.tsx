import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/ui/PageLoader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";
import { Scale, TrendingDown, TrendingUp, Minus, Plus, Trash2, Sparkles } from "lucide-react";

interface Measurement {
  id: string;
  weight_kg: number;
  body_fat_pct: number | null;
  waist_cm: number | null;
  notes: string | null;
  measured_at: string;
}

export default function BodyTracking() {
  const { user, userProfile, isLoading } = useAuth();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loadingData, setLoadingData]   = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState("");
  const [form, setForm] = useState({
    weightKg: "", bodyFatPct: "", waistCm: "", notes: "",
  });

  useEffect(() => {
    if (!user?.id) return;
    api.getMeasurements(user.id)
      .then(setMeasurements).catch(() => setMeasurements([]))
      .finally(() => setLoadingData(false));
  }, [user?.id]);

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/auth/sign-in" replace />;

  const latest  = measurements[0];
  const initial = userProfile?.weightKg;
  const weightDiff = latest && initial ? latest.weight_kg - initial : null;

  async function handleSave() {
    if (!form.weightKg) { setError("El peso es obligatorio"); return; }
    setSaving(true); setError("");
    try {
      const saved = await api.saveMeasurement(user!.id, {
        weightKg:    parseFloat(form.weightKg),
        bodyFatPct:  form.bodyFatPct ? parseFloat(form.bodyFatPct) : undefined,
        waistCm:     form.waistCm    ? parseFloat(form.waistCm)    : undefined,
        notes:       form.notes      || undefined,
      });
      setMeasurements(prev => [{
        id:           saved.id,
        weight_kg:    parseFloat(form.weightKg),
        body_fat_pct: form.bodyFatPct ? parseFloat(form.bodyFatPct) : null,
        waist_cm:     form.waistCm    ? parseFloat(form.waistCm)    : null,
        notes:        form.notes || null,
        measured_at:  saved.measuredAt,
      }, ...prev]);
      setForm({ weightKg: "", bodyFatPct: "", waistCm: "", notes: "" });
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await api.deleteMeasurement(id).catch(() => {});
    setMeasurements(prev => prev.filter(m => m.id !== id));
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Seguimiento Corporal</h1>
            <p className="text-[var(--color-muted)]">Registro mensual de tu evolución física</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            Nueva medición
          </Button>
        </div>

        {/* Stats rápidas */}
        {(latest || initial) && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card variant="bordered" className="text-center py-4">
              <p className="text-xs text-[var(--color-muted)] mb-1">Peso inicial</p>
              <p className="text-2xl font-bold">{initial ?? "—"}</p>
              <p className="text-xs text-[var(--color-muted)]">kg</p>
            </Card>
            <Card variant="bordered" className="text-center py-4">
              <p className="text-xs text-[var(--color-muted)] mb-1">Peso actual</p>
              <p className="text-2xl font-bold text-[var(--color-accent)]">
                {latest?.weight_kg ?? "—"}
              </p>
              <p className="text-xs text-[var(--color-muted)]">kg</p>
            </Card>
            <Card variant="bordered" className="text-center py-4">
              <p className="text-xs text-[var(--color-muted)] mb-1">Cambio total</p>
              <div className="flex items-center justify-center gap-1">
                {weightDiff !== null ? (
                  <>
                    {weightDiff > 0
                      ? <TrendingUp className="w-4 h-4 text-[var(--color-accent)]" />
                      : weightDiff < 0
                      ? <TrendingDown className="w-4 h-4 text-blue-400" />
                      : <Minus className="w-4 h-4 text-[var(--color-muted)]" />}
                    <p className={`text-2xl font-bold ${
                      weightDiff > 0 ? "text-[var(--color-accent)]"
                      : weightDiff < 0 ? "text-blue-400"
                      : "text-[var(--color-muted)]"}`}>
                      {weightDiff > 0 ? "+" : ""}{weightDiff.toFixed(1)}
                    </p>
                  </>
                ) : <p className="text-2xl font-bold text-[var(--color-muted)]">—</p>}
              </div>
              <p className="text-xs text-[var(--color-muted)]">kg</p>
            </Card>
          </div>
        )}

        {/* Formulario nueva medición */}
        {showForm && (
          <Card variant="bordered" className="mb-6 space-y-4">
            <h2 className="font-semibold">Nueva medición</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Peso *", key: "weightKg",   placeholder: "75.5", unit: "kg" },
                { label: "% Grasa (opcional)", key: "bodyFatPct", placeholder: "20",   unit: "%" },
                { label: "Cintura (opcional)", key: "waistCm",    placeholder: "85",   unit: "cm" },
              ].map(({ label, key, placeholder, unit }) => (
                <div key={key}>
                  <label className="text-xs text-[var(--color-muted)] mb-1 block">{label}</label>
                  <div className="relative">
                    <input type="number" step="0.1" placeholder={placeholder}
                      value={(form as any)[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)]">{unit}</span>
                  </div>
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-xs text-[var(--color-muted)] mb-1 block">¿Cómo te sientes? (opcional)</label>
                <textarea value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Ej: Me siento con más energía, la ropa me queda mejor..."
                  rows={2}
                  className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)] resize-none"
                />
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? "Guardando..." : "Guardar medición"}
              </Button>
            </div>
          </Card>
        )}

        {/* Análisis IA — placeholder */}
        <Card variant="bordered" className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
              <h2 className="font-semibold">Análisis de progreso con IA</h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-muted)]">
              Próximamente
            </span>
          </div>
          <div className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center space-y-2">
            <p className="text-sm font-medium">Análisis personalizado con IA</p>
            <p className="text-xs text-[var(--color-muted)] max-w-xs mx-auto">
              Próximamente la IA analizará tu progreso mensual, comparará tus mediciones con tu objetivo y te dará recomendaciones personalizadas.
            </p>
          </div>
        </Card>

        {/* Historial */}
        <h2 className="font-semibold text-lg mb-4">Historial de mediciones</h2>
        {loadingData ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : measurements.length === 0 ? (
          <Card variant="bordered" className="text-center py-10">
            <Scale className="w-8 h-8 text-[var(--color-muted)] mx-auto mb-2" />
            <p className="text-sm text-[var(--color-muted)]">
              Registra tu primera medición para empezar el seguimiento
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {measurements.map((m, i) => (
              <Card key={m.id} variant="bordered">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-lg text-[var(--color-accent)]">
                        {m.weight_kg} kg
                      </p>
                      {i === 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/30">
                          Más reciente
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 text-xs text-[var(--color-muted)]">
                      {m.body_fat_pct && <span>Grasa: {m.body_fat_pct}%</span>}
                      {m.waist_cm    && <span>Cintura: {m.waist_cm}cm</span>}
                    </div>
                    {m.notes && (
                      <p className="text-xs text-[var(--color-muted)] italic mt-1">"{m.notes}"</p>
                    )}
                    <p className="text-xs text-[var(--color-muted)]">
                      {new Date(m.measured_at).toLocaleDateString("es-ES", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(m.id)}
                    className="text-[var(--color-muted)] hover:text-red-400 transition-colors mt-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
