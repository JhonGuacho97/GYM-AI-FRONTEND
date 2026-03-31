import { useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { api } from "../../lib/api";
import {
  Sparkles, Loader2, ChevronDown, ChevronUp,
  CheckCircle2, RefreshCcw, Plus, Coffee,
  Sun, Moon, Apple,
} from "lucide-react";

const MEAL_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  breakfast: { label: "Desayuno",  icon: Coffee },
  lunch:     { label: "Almuerzo",  icon: Sun    },
  dinner:    { label: "Cena",      icon: Moon   },
  snack:     { label: "Merienda",  icon: Apple  },
};

const DAYS_OPTIONS = [1, 3, 5, 7];

interface Meal {
  type: string;
  name: string;
  description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface DayPlan {
  day: string;
  meals: Meal[];
  totals: { calories: number; protein_g: number; carbs_g: number; fat_g: number };
}

// Tipo compartido con FoodTracker
export interface FoodLog {
  id: string;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_type: string;
  logged_at: string;
}

interface MealPlanProps {
  userId: string;
  caloriesTarget: number;
  onMealAdded?: (food: FoodLog) => void; // ← callback al padre
}

function MealCard({
  meal,
  onAdd,
  added,
}: {
  meal: Meal;
  onAdd: (meal: Meal) => void;
  added: boolean;
}) {
  const meta = MEAL_LABELS[meal.type] || { label: meal.type, icon: Apple };
  const Icon = meta.icon;

  return (
    <div className={`rounded-xl border p-4 transition-all duration-300 ${
      added
        ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/5"
        : "border-[var(--color-border)] hover:border-[var(--color-border)]/80"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            added ? "bg-[var(--color-accent)]/20" : "bg-[var(--color-card)]"
          }`}>
            <Icon className={`w-3.5 h-3.5 ${added ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[var(--color-muted)] font-medium">{meta.label}</p>
            <p className="font-medium text-sm truncate">{meal.name}</p>
          </div>
        </div>
        <button
          onClick={() => !added && onAdd(meal)}
          disabled={added}
          className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            added
              ? "text-[var(--color-accent)] bg-[var(--color-accent)]/10 cursor-default"
              : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-card)] border border-[var(--color-border)]"
          }`}
        >
          {added
            ? <><CheckCircle2 className="w-3 h-3" /> Añadido</>
            : <><Plus className="w-3 h-3" /> Añadir</>}
        </button>
      </div>

      <p className="text-xs text-[var(--color-muted)] mt-2 ml-9 leading-relaxed">
        {meal.description}
      </p>

      <div className="flex gap-3 mt-2 ml-9 text-xs text-[var(--color-muted)]">
        <span className="text-[var(--color-accent)] font-medium">{meal.calories} kcal</span>
        <span>P: {meal.protein_g}g</span>
        <span>C: {meal.carbs_g}g</span>
        <span>G: {meal.fat_g}g</span>
      </div>
    </div>
  );
}

function DaySection({
  dayPlan,
  addedMeals,
  onAddMeal,
  onAddAll,
  caloriesTarget,
}: {
  dayPlan: DayPlan;
  addedMeals: Set<string>;
  onAddMeal: (meal: Meal, dayIndex: number, mealIndex: number) => void;
  onAddAll: (dayPlan: DayPlan, dayIndex: number) => void;
  caloriesTarget: number;
}) {
  const [open, setOpen] = useState(true);
  const dayIndex = parseInt(dayPlan.day.replace(/\D/g, "")) - 1;
  const allAdded = dayPlan.meals.every((_, mi) => addedMeals.has(`${dayIndex}-${mi}`));
  const calPct = Math.min((dayPlan.totals.calories / caloriesTarget) * 100, 100);
  const diff = dayPlan.totals.calories - caloriesTarget;

  return (
    <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--color-card)]/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium">{dayPlan.day}</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${calPct}%`,
                  backgroundColor: Math.abs(diff) < 100 ? "var(--color-accent)" : "#f97316",
                }}
              />
            </div>
            <span className={`text-xs ${Math.abs(diff) < 100 ? "text-[var(--color-accent)]" : "text-orange-400"}`}>
              {dayPlan.totals.calories} kcal
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!allAdded && (
            <button
              onClick={e => { e.stopPropagation(); onAddAll(dayPlan, dayIndex); }}
              className="text-xs px-2.5 py-1 rounded-lg border border-[var(--color-accent)]/50 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
            >
              Añadir todo
            </button>
          )}
          {allAdded && (
            <span className="text-xs text-[var(--color-accent)] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Completo
            </span>
          )}
          {open
            ? <ChevronUp className="w-4 h-4 text-[var(--color-muted)]" />
            : <ChevronDown className="w-4 h-4 text-[var(--color-muted)]" />}
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-2 border-t border-[var(--color-border)]">
          {dayPlan.meals.map((meal, mi) => (
            <MealCard
              key={mi}
              meal={meal}
              added={addedMeals.has(`${dayIndex}-${mi}`)}
              onAdd={m => onAddMeal(m, dayIndex, mi)}
            />
          ))}
          <div className="flex justify-around text-xs text-[var(--color-muted)] pt-2 border-t border-[var(--color-border)] mt-2">
            <span>P: <span className="text-[var(--color-foreground)] font-medium">{dayPlan.totals.protein_g}g</span></span>
            <span>C: <span className="text-[var(--color-foreground)] font-medium">{dayPlan.totals.carbs_g}g</span></span>
            <span>G: <span className="text-[var(--color-foreground)] font-medium">{dayPlan.totals.fat_g}g</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

export function MealPlan({ userId, caloriesTarget, onMealAdded }: MealPlanProps) {
  const [selectedDays, setSelectedDays] = useState(1);
  const [plan, setPlan]                 = useState<DayPlan[] | null>(null);
  const [generating, setGenerating]     = useState(false);
  const [addedMeals, setAddedMeals]     = useState<Set<string>>(new Set());
  const [_, setAddingMeal]     = useState<string | null>(null);
  const [error, setError]               = useState("");

  async function handleGenerate() {
    setGenerating(true); setError(""); setPlan(null); setAddedMeals(new Set());
    try {
      const data = await api.generateMealPlan(userId, selectedDays);
      setPlan(data.days);
    } catch (err: any) {
      setError(err.message || "Error al generar el plan");
    } finally {
      setGenerating(false);
    }
  }

  async function handleAddMeal(meal: Meal, dayIndex: number, mealIndex: number) {
    const key = `${dayIndex}-${mealIndex}`;
    setAddingMeal(key);
    try {
      const log = await api.saveFood(userId, {
        name:      meal.name,
        calories:  meal.calories,
        protein_g: meal.protein_g,
        carbs_g:   meal.carbs_g,
        fat_g:     meal.fat_g,
        meal_type: meal.type,
      });

      setAddedMeals(prev => new Set([...prev, key]));

      // Notificar al padre (Nutrition.tsx) con el food guardado
      onMealAdded?.({
        id:        log.id,
        name:      meal.name,
        calories:  meal.calories,
        protein_g: meal.protein_g,
        carbs_g:   meal.carbs_g,
        fat_g:     meal.fat_g,
        meal_type: meal.type,
        logged_at: log.loggedAt ?? new Date().toISOString(),
      });
    } catch {
      setError("Error al añadir la comida al tracker");
    } finally {
      setAddingMeal(null);
    }
  }

  async function handleAddAll(dayPlan: DayPlan, dayIndex: number) {
    for (let mi = 0; mi < dayPlan.meals.length; mi++) {
      const key = `${dayIndex}-${mi}`;
      if (!addedMeals.has(key)) {
        await handleAddMeal(dayPlan.meals[mi], dayIndex, mi);
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Configuración */}
      <Card variant="bordered" className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
          <h3 className="font-semibold">Plan de comidas con IA</h3>
        </div>

        <div>
          <p className="text-xs text-[var(--color-muted)] mb-2">¿Cuántos días quieres planificar?</p>
          <div className="flex gap-2">
            {DAYS_OPTIONS.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDays(d)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedDays === d
                    ? "bg-[var(--color-accent)] text-black"
                    : "bg-[var(--color-card)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] border border-[var(--color-border)]"
                }`}
              >
                {d === 1 ? "Hoy" : `${d} días`}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full gap-2"
        >
          {generating
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando tu plan...</>
            : plan
            ? <><RefreshCcw className="w-4 h-4" /> Regenerar plan</>
            : <><Sparkles className="w-4 h-4" /> Generar plan de comidas</>}
        </Button>

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </Card>

      {/* Skeletons mientras genera */}
      {generating && (
        <div className="space-y-3">
          {[...Array(selectedDays)].map((_, i) => (
            <div key={i} className="border border-[var(--color-border)] rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-[var(--color-border)] rounded w-24 mb-3" />
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-16 bg-[var(--color-border)] rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {plan && !generating && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--color-muted)]">
              {plan.length === 1 ? "Plan del día generado" : `Plan de ${plan.length} días generado`}
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              {addedMeals.size} / {plan.reduce((s, d) => s + d.meals.length, 0)} comidas añadidas
            </p>
          </div>

          {plan.map((dayPlan, di) => (
            <DaySection
              key={di}
              dayPlan={dayPlan}
              addedMeals={addedMeals}
              onAddMeal={handleAddMeal}
              onAddAll={handleAddAll}
              caloriesTarget={caloriesTarget}
            />
          ))}
        </div>
      )}
    </div>
  );
}