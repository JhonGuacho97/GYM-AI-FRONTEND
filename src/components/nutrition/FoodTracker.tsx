import { useEffect, useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { api } from "../../lib/api";
import {
  Flame,
  Beef,
  Wheat,
  Droplets,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import type { FoodLog } from "./MealPlan";

// Re-exportar para que Nutrition.tsx pueda importarlo desde aquí también
export type { FoodLog };

const MEAL_TYPES = [
  { value: "breakfast", label: "Desayuno" },
  { value: "lunch",     label: "Almuerzo" },
  { value: "dinner",    label: "Cena" },
  { value: "snack",     label: "Merienda" },
  { value: "other",     label: "Otro" },
];

interface EstimatedFood {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  notes?: string;
}

interface MacroRingProps {
  label: string;
  current: number;
  target: number;
  color: string;
  unit?: string;
}

function MacroRing({
  label,
  current,
  target,
  color,
  unit = "g",
}: MacroRingProps) {
  const pct = Math.min((current / (target || 1)) * 100, 100);
  const r = 26;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90">
          <circle
            cx="30"
            cy="30"
            r={r}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="5"
          />
          <circle
            cx="30"
            cy="30"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={`${(pct / 100) * circ} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className="text-xs font-bold">
            {Math.round(current)}
            {unit}
          </span>
        </div>
      </div>
      <p className="text-xs font-medium">{label}</p>
      <p className="text-xs text-[var(--color-muted)]">
        / {target}
        {unit}
      </p>
    </div>
  );
}

interface FoodTrackerProps {
  userId: string;
  caloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  externalFoods?: FoodLog[];              // ← comidas añadidas desde MealPlan
  onFoodAdded?: (food: FoodLog) => void;  // ← notificar al padre al añadir manualmente
}

export function FoodTracker({
  userId,
  caloriesTarget,
  proteinTarget,
  carbsTarget,
  fatTarget,
  externalFoods = [],
  onFoodAdded,
}: FoodTrackerProps) {
  const [internalFoods, setInternalFoods] = useState<FoodLog[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [description, setDescription] = useState("");
  const [mealType, setMealType]     = useState("breakfast");
  const [estimating, setEstimating] = useState(false);
  const [estimated, setEstimated]   = useState<EstimatedFood | null>(null);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    api
      .getTodayFoods(userId)
      .then(setInternalFoods)
      .catch(() => setInternalFoods([]))
      .finally(() => setLoading(false));
  }, [userId]);

  // Combinar comidas propias con las añadidas desde el MealPlan,
  // evitando duplicados por id (por si el usuario refresca)
  const foods: FoodLog[] = [
    ...internalFoods,
    ...externalFoods.filter(ef => !internalFoods.some(f => f.id === ef.id)),
  ];

  const totals = foods.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein:  acc.protein  + f.protein_g,
      carbs:    acc.carbs    + f.carbs_g,
      fat:      acc.fat      + f.fat_g,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const calPct    = Math.min((totals.calories / (caloriesTarget || 1)) * 100, 100);
  const remaining = Math.max(caloriesTarget - totals.calories, 0);
  const isOver    = totals.calories > caloriesTarget;

  async function handleEstimate() {
    if (!description.trim()) return;
    setEstimating(true);
    setError("");
    setEstimated(null);
    try {
      const data = await api.estimateFood(description);
      setEstimated(data);
    } catch {
      setError("No se pudo estimar. Intenta con una descripción más detallada.");
    } finally {
      setEstimating(false);
    }
  }

  async function handleSave() {
    if (!estimated) return;
    setSaving(true);
    try {
      const log = await api.saveFood(userId, {
        name:      estimated.name,
        calories:  Math.round(estimated.calories),
        protein_g: estimated.protein_g,
        carbs_g:   estimated.carbs_g,
        fat_g:     estimated.fat_g,
        meal_type: mealType,
      });

      const newFood: FoodLog = {
        id:        log.id,
        name:      estimated.name,
        calories:  Math.round(estimated.calories),
        protein_g: estimated.protein_g,
        carbs_g:   estimated.carbs_g,
        fat_g:     estimated.fat_g,
        meal_type: mealType,
        logged_at: log.loggedAt,
      };

      setInternalFoods(prev => [...prev, newFood]);
      onFoodAdded?.(newFood); // notificar al padre
      setDescription("");
      setEstimated(null);
      setShowForm(false);
    } catch {
      setError("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await api.deleteFood(id).catch(() => {});
    // Eliminar de internos; si era externo, el padre lo maneja
    setInternalFoods(prev => prev.filter(f => f.id !== id));
  }

  const groupedFoods = MEAL_TYPES.map(mt => ({
    ...mt,
    items: foods.filter(f => f.meal_type === mt.value),
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-4">
      {/* Resumen del día */}
      <Card variant="bordered">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-[var(--color-muted)]">
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-bold">
                {Math.round(totals.calories)}
              </span>
              <span className="text-sm text-[var(--color-muted)]">
                / {caloriesTarget} kcal
              </span>
            </div>
            <p
              className={`text-xs mt-0.5 ${isOver ? "text-red-400" : "text-[var(--color-muted)]"}`}
            >
              {isOver
                ? `${Math.round(totals.calories - caloriesTarget)} kcal sobre el objetivo`
                : `${Math.round(remaining)} kcal restantes`}
            </p>
          </div>
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90">
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="5"
              />
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                stroke={isOver ? "#f87171" : "var(--color-accent)"}
                strokeWidth="5"
                strokeDasharray={`${(calPct / 100) * 163} 163`}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Flame
                className={`w-5 h-5 ${isOver ? "text-red-400" : "text-[var(--color-accent)]"}`}
              />
            </div>
          </div>
        </div>

        {/* Barra calorías */}
        <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${calPct}%`,
              backgroundColor: isOver ? "#f87171" : "var(--color-accent)",
            }}
          />
        </div>

        {/* Macros */}
        <div className="flex justify-around">
          <MacroRing
            label="Proteína"
            current={totals.protein}
            target={proteinTarget}
            color="var(--color-accent)"
          />
          <MacroRing
            label="Carbos"
            current={totals.carbs}
            target={carbsTarget}
            color="#60a5fa"
          />
          <MacroRing
            label="Grasas"
            current={totals.fat}
            target={fatTarget}
            color="#f97316"
          />
        </div>
      </Card>

      {/* Botón añadir / Formulario */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
        >
          <Plus className="w-4 h-4" /> Añadir comida
        </button>
      ) : (
        <Card variant="bordered" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Añadir comida</h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEstimated(null);
                setDescription("");
              }}
              className="text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            >
              Cancelar
            </button>
          </div>

          {/* Input descripción */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder='Ej: "2 huevos revueltos con tostada"'
              value={description}
              onChange={e => setDescription(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleEstimate()}
              className="flex-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)]"
            />
            <Button
              onClick={handleEstimate}
              disabled={estimating || !description.trim()}
              className="gap-1.5 shrink-0"
            >
              {estimating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {estimating ? "..." : "Estimar"}
            </Button>
          </div>

          {/* Tipo de comida */}
          <div className="flex gap-2 flex-wrap">
            {MEAL_TYPES.map(mt => (
              <button
                key={mt.value}
                onClick={() => setMealType(mt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  mealType === mt.value
                    ? "bg-[var(--color-accent)] text-[var(--color-background)]"
                    : "bg-[var(--color-card)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                }`}
              >
                {mt.label}
              </button>
            ))}
          </div>

          {/* Resultado estimación */}
          {estimated && (
            <div className="border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{estimated.name}</p>
                  {estimated.notes && (
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">
                      {estimated.notes}
                    </p>
                  )}
                </div>
                <span className="text-lg font-bold text-[var(--color-accent)]">
                  {Math.round(estimated.calories)} kcal
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {[
                  { label: "Proteína", value: estimated.protein_g, color: "var(--color-accent)" },
                  { label: "Carbos",   value: estimated.carbs_g,   color: "#60a5fa" },
                  { label: "Grasas",   value: estimated.fat_g,     color: "#f97316" },
                ].map(m => (
                  <div key={m.label} className="bg-[var(--color-card)] rounded-lg p-2">
                    <p className="font-bold" style={{ color: m.color }}>
                      {m.value.toFixed(1)}g
                    </p>
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
      )}

      {/* Lista comidas del día */}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : groupedFoods.length === 0 ? (
        <div className="text-center py-8 text-[var(--color-muted)]">
          <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Aún no has registrado comidas hoy</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groupedFoods.map(group => (
            <Card key={group.value} variant="bordered">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">{group.label}</h3>
                <span className="text-xs text-[var(--color-muted)]">
                  {group.items.reduce((s, f) => s + f.calories, 0)} kcal
                </span>
              </div>
              <div className="space-y-2">
                {group.items.map(food => (
                  <div
                    key={food.id}
                    className="flex items-center justify-between text-sm py-1.5 border-b border-[var(--color-border)] last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{food.name}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        P: {food.protein_g.toFixed(0)}g · C:{" "}
                        {food.carbs_g.toFixed(0)}g · G: {food.fat_g.toFixed(0)}g
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-[var(--color-accent)] text-sm">
                        {food.calories} kcal
                      </span>
                      <button
                        onClick={() => handleDelete(food.id)}
                        className="text-[var(--color-muted)] hover:text-red-400 transition-colors"
                      >
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
  );
}