import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/ui/PageLoader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";
import { Flame, Beef, Wheat, Droplets, Plus, Trash2, Loader2, Sparkles } from "lucide-react";

const MEAL_TYPES = [
  { value: "breakfast", label: "Desayuno" },
  { value: "lunch",     label: "Almuerzo" },
  { value: "dinner",    label: "Cena" },
  { value: "snack",     label: "Merienda" },
  { value: "other",     label: "Otro" },
];

interface FoodLog {
  id: string;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_type: string;
  logged_at: string;
}

interface EstimatedFood {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  notes?: string;
}

function MacroCircle({ label, current, target, color }: {
  label: string; current: number; target: number; color: string;
}) {
  const pct = Math.min((current / target) * 100, 100);
  const r = 28; const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
          <circle cx="36" cy="36" r={r} fill="none" stroke="var(--color-border)" strokeWidth="5" />
          <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold">{Math.round(current)}g</span>
        </div>
      </div>
      <p className="text-xs text-[var(--color-muted)]">{label}</p>
      <p className="text-xs text-[var(--color-muted)]">{target}g</p>
    </div>
  );
}

export default function FoodTracker() {
  const { user, userProfile, isLoading } = useAuth();
  const [foods, setFoods]               = useState<FoodLog[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [description, setDescription]  = useState("");
  const [mealType, setMealType]         = useState("breakfast");
  const [estimating, setEstimating]     = useState(false);
  const [estimated, setEstimated]       = useState<EstimatedFood | null>(null);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState("");

  useEffect(() => {
    if (!user?.id) return;
    api.getTodayFoods(user.id)
      .then(setFoods).catch(() => setFoods([]))
      .finally(() => setLoadingFoods(false));
  }, [user?.id]);

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/auth/sign-in" replace />;

  // Totales del día
  const totals = foods.reduce((acc, f) => ({
    calories: acc.calories + f.calories,
    protein:  acc.protein  + f.protein_g,
    carbs:    acc.carbs    + f.carbs_g,
    fat:      acc.fat      + f.fat_g,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Metas del perfil (por defecto si no tiene nutrición calculada)
  const caloriesTarget = 2000;
  const proteinTarget  = userProfile?.weightKg ? Math.round(userProfile.weightKg * 2) : 150;
  const carbsTarget    = Math.round((caloriesTarget * 0.45) / 4);
  const fatTarget      = Math.round((caloriesTarget * 0.25) / 9);
  const calPct         = Math.min((totals.calories / caloriesTarget) * 100, 100);

  async function handleEstimate() {
    if (!description.trim()) return;
    setEstimating(true);
    setError("");
    setEstimated(null);
    try {
      const data = await api.estimateFood(description);
      setEstimated(data);
    } catch (err: any) {
      setError("No se pudo estimar. Intenta con una descripción más detallada.");
    } finally {
      setEstimating(false);
    }
  }

  async function handleSave() {
    if (!estimated) return;
    setSaving(true);
    try {
      const log = await api.saveFood(user!.id, {
        name:      estimated.name,
        calories:  Math.round(estimated.calories),
        protein_g: estimated.protein_g,
        carbs_g:   estimated.carbs_g,
        fat_g:     estimated.fat_g,
        meal_type: mealType,
      });
      setFoods(prev => [...prev, {
        id:        log.id,
        name:      estimated.name,
        calories:  Math.round(estimated.calories),
        protein_g: estimated.protein_g,
        carbs_g:   estimated.carbs_g,
        fat_g:     estimated.fat_g,
        meal_type: mealType,
        logged_at: log.loggedAt,
      }]);
      setDescription("");
      setEstimated(null);
    } catch (err: any) {
      setError("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await api.deleteFood(id).catch(() => {});
    setFoods(prev => prev.filter(f => f.id !== id));
  }

  const groupedFoods = MEAL_TYPES.map(mt => ({
    ...mt,
    items: foods.filter(f => f.meal_type === mt.value),
  })).filter(g => g.items.length > 0);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Tracker de Comidas</h1>
          <p className="text-[var(--color-muted)]">
            {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        {/* Resumen del día */}
        <Card variant="bordered" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-[var(--color-muted)]">Calorías consumidas</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{Math.round(totals.calories)}</span>
                <span className="text-[var(--color-muted)] text-sm">/ {caloriesTarget} kcal</span>
              </div>
            </div>
            <div className="w-14 h-14 relative">
              <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                <circle cx="28" cy="28" r="22" fill="none" stroke="var(--color-border)" strokeWidth="5"/>
                <circle cx="28" cy="28" r="22" fill="none"
                  stroke={calPct >= 100 ? "#f87171" : "var(--color-accent)"}
                  strokeWidth="5"
                  strokeDasharray={`${(calPct / 100) * 138} 138`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 0.6s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Flame className="w-5 h-5 text-[var(--color-accent)]" />
              </div>
            </div>
          </div>

          {/* Barra de calorías */}
          <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${calPct}%`,
                backgroundColor: calPct >= 100 ? "#f87171" : "var(--color-accent)"
              }}
            />
          </div>

          {/* Macros */}
          <div className="flex justify-around">
            <MacroCircle label="Proteína" current={totals.protein} target={proteinTarget} color="var(--color-accent)" />
            <MacroCircle label="Carbos"   current={totals.carbs}   target={carbsTarget}   color="#60a5fa" />
            <MacroCircle label="Grasas"   current={totals.fat}     target={fatTarget}     color="#f97316" />
          </div>
        </Card>

        {/* Formulario de registro */}
        <Card variant="bordered" className="mb-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4 text-[var(--color-accent)]" />
            Registrar comida
          </h2>

          <div>
            <label className="text-xs text-[var(--color-muted)] mb-1 block">
              Describe tu plato
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder='Ej: "arroz con pollo a la plancha, 250g"'
                value={description}
                onChange={e => setDescription(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleEstimate()}
                className="flex-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)]"
              />
              <Button onClick={handleEstimate} disabled={estimating || !description.trim()} className="gap-1.5 shrink-0">
                {estimating
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Sparkles className="w-4 h-4" />}
                {estimating ? "..." : "Estimar"}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs text-[var(--color-muted)] mb-1 block">Tipo de comida</label>
            <div className="flex gap-2 flex-wrap">
              {MEAL_TYPES.map(mt => (
                <button key={mt.value} onClick={() => setMealType(mt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    mealType === mt.value
                      ? "bg-[var(--color-accent)] text-[var(--color-background)]"
                      : "bg-[var(--color-card)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  }`}>
                  {mt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resultado de la estimación */}
          {estimated && (
            <div className="border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{estimated.name}</p>
                  {estimated.notes && (
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">{estimated.notes}</p>
                  )}
                </div>
                <span className="text-lg font-bold text-[var(--color-accent)]">
                  {Math.round(estimated.calories)} kcal
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {[
                  { label: "Proteína", value: estimated.protein_g, color: "var(--color-accent)", icon: Beef },
                  { label: "Carbos",   value: estimated.carbs_g,   color: "#60a5fa",             icon: Wheat },
                  { label: "Grasas",   value: estimated.fat_g,     color: "#f97316",             icon: Droplets },
                ].map(m => (
                  <div key={m.label} className="bg-[var(--color-card)] rounded-lg p-2">
                    <p className="font-bold" style={{ color: m.color }}>{m.value.toFixed(1)}g</p>
                    <p className="text-[var(--color-muted)]">{m.label}</p>
                  </div>
                ))}
              </div>
              <Button className="w-full" onClick={handleSave} disabled={saving}>
                {saving ? "Guardando..." : "Añadir al registro"}
              </Button>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </Card>

        {/* Lista de comidas del día */}
        {loadingFoods ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : groupedFoods.length === 0 ? (
          <Card variant="bordered" className="text-center py-10">
            <Flame className="w-8 h-8 text-[var(--color-muted)] mx-auto mb-2" />
            <p className="text-sm text-[var(--color-muted)]">No has registrado comidas hoy</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {groupedFoods.map(group => (
              <Card key={group.value} variant="bordered">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{group.label}</h3>
                  <span className="text-xs text-[var(--color-muted)]">
                    {group.items.reduce((s, f) => s + f.calories, 0)} kcal
                  </span>
                </div>
                <div className="space-y-2">
                  {group.items.map(food => (
                    <div key={food.id} className="flex items-center justify-between text-sm py-1.5 border-b border-[var(--color-border)] last:border-0">
                      <div>
                        <p className="font-medium">{food.name}</p>
                        <p className="text-xs text-[var(--color-muted)]">
                          P: {food.protein_g.toFixed(0)}g · C: {food.carbs_g.toFixed(0)}g · G: {food.fat_g.toFixed(0)}g
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-[var(--color-accent)]">{food.calories} kcal</span>
                        <button onClick={() => handleDelete(food.id)}
                          className="text-[var(--color-muted)] hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
