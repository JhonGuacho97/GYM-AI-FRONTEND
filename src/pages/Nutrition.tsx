import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import PageLoader from "../components/ui/PageLoader";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";
import type { NutritionGoals } from "../types";
import {
  Flame, Beef, Wheat, Droplets, RefreshCcw,
  Info, ChevronDown, ChevronUp, UtensilsCrossed,
} from "lucide-react";

// ─── Tips y estrategia por objetivo ──────────────────────────────────────────
const goalContent: Record<string, {
  label: string;
  strategy: string;
  tips: string[];
  foods: string[];
}> = {
  bulk: {
    label: "Ganar músculo",
    strategy: "Superávit calórico de ~300 kcal sobre tu mantenimiento. El exceso moderado minimiza la ganancia de grasa mientras maximiza la síntesis muscular.",
    tips: [
      "Distribuye la proteína en 4-5 comidas a lo largo del día",
      "Consume carbohidratos antes y después del entrenamiento",
      "No saltees comidas — el músculo se construye con consistencia",
      "Prioriza alimentos densos en nutrientes sobre comida chatarra",
    ],
    foods: ["Pollo", "Arroz", "Avena", "Huevos", "Batata", "Plátano", "Leche"],
  },
  cut: {
    label: "Perder grasa",
    strategy: "Déficit calórico de ~400 kcal. Proteína alta para preservar músculo mientras pierdes grasa. La paciencia y la consistencia son clave.",
    tips: [
      "Alta proteína es esencial para no perder músculo en déficit",
      "Prioriza alimentos voluminosos y bajos en calorías para saciarte",
      "Evita líquidos calóricos — el agua y el té son tus aliados",
      "El cardio es complementario — la dieta hace el 80% del trabajo",
    ],
    foods: ["Pechuga de pollo", "Claras de huevo", "Verduras", "Frutas", "Yogur griego", "Atún"],
  },
  recomp: {
    label: "Recomposición corporal",
    strategy: "Calorías de mantenimiento. Es el proceso más lento pero más sostenible — pierdes grasa y ganas músculo simultáneamente.",
    tips: [
      "La proteína es aún más crítica en recomposición — no la descuides",
      "Cicla carbohidratos: más en días de entrenamiento, menos en descanso",
      "El progreso es más lento — mide tu cuerpo, no solo la balanza",
      "La consistencia durante meses es lo que genera resultados",
    ],
    foods: ["Proteínas magras", "Verduras", "Legumbres", "Granos integrales", "Nueces"],
  },
  strength: {
    label: "Ganar fuerza",
    strategy: "Leve superávit de ~200 kcal. La fuerza requiere energía suficiente y proteína para la recuperación muscular entre sesiones intensas.",
    tips: [
      "Carbohidratos son tu combustible principal para levantar pesado",
      "Come bien 2-3 horas antes de entrenar para máximo rendimiento",
      "La creatina monohidratada es el suplemento más respaldado científicamente",
      "Duerme 8 horas — el 70% de la recuperación ocurre mientras duermes",
    ],
    foods: ["Carne roja magra", "Pasta", "Pan integral", "Huevos", "Papas", "Avena"],
  },
  endurance: {
    label: "Resistencia",
    strategy: "Calorías de mantenimiento con énfasis en carbohidratos. Los carbos son el combustible principal del ejercicio aeróbico de larga duración.",
    tips: [
      "Prioriza carbohidratos complejos como fuente de energía sostenida",
      "Hidrátate constantemente — la deshidratación reduce el rendimiento hasta un 20%",
      "Los electrolitos son esenciales en sesiones de más de 60 minutos",
      "Recarga con carbohidratos simples inmediatamente post-entrenamiento",
    ],
    foods: ["Plátano", "Pasta", "Arroz", "Bebidas deportivas", "Gel energético", "Frutas"],
  },
};

// ─── Barra de macro ───────────────────────────────────────────────────────────
function MacroBar({
  label, grams, calories, total, color, icon: Icon,
}: {
  label: string; grams: number; calories: number;
  total: number; color: string; icon: React.ElementType;
}) {
  const pct = Math.round((calories / total) * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="font-medium text-sm">{label}</span>
        </div>
        <div className="text-right flex items-center gap-2">
          <span className="font-bold">{grams}g</span>
          <span className="text-xs text-[var(--color-muted)] bg-[var(--color-card)] px-2 py-0.5 rounded-full">
            {pct}%
          </span>
        </div>
      </div>
      <div className="h-2.5 bg-[var(--color-border)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-[var(--color-muted)]">
        {calories} kcal · {grams}g
      </p>
    </div>
  );
}

// ─── Tips colapsables ─────────────────────────────────────────────────────────
function TipsSection({ content }: { content: typeof goalContent[string] }) {
  const [open, setOpen] = useState(false);
  return (
    <Card variant="bordered" className="mb-6">
      <button
        className="w-full flex items-center justify-between"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="font-semibold">Estrategia y consejos</span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-[var(--color-muted)]" />
          : <ChevronDown className="w-4 h-4 text-[var(--color-muted)]" />
        }
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-[var(--color-muted)] leading-relaxed border-l-2 border-[var(--color-accent)] pl-3">
            {content.strategy}
          </p>

          <div>
            <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider mb-2">
              Consejos clave
            </p>
            <ul className="space-y-2">
              {content.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-[var(--color-accent)] mt-0.5 shrink-0">✓</span>
                  <span className="text-[var(--color-muted)]">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider mb-2">
              Alimentos recomendados
            </p>
            <div className="flex flex-wrap gap-2">
              {content.foods.map((food) => (
                <span
                  key={food}
                  className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-muted)]"
                >
                  {food}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Nutrition() {
  const { user, plan, userProfile, isLoading } = useAuth();
  const [goals, setGoals] = useState<NutritionGoals | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [missingData, setMissingData] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ age: "", gender: "male", heightCm: "", weightKg: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    api.getNutrition(user.id)
      .then((data) => {
        setGoals({
          caloriesTarget: data.calories_target,
          proteinG: data.protein_g,
          carbsG: data.carbs_g,
          fatG: data.fat_g,
          calculatedAt: data.calculated_at,
        });
      })
      .catch(() => setMissingData(true))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/auth/sign-in" replace />;
  if (!plan) return <Navigate to="/onboarding" replace />;

  const goalKey = (userProfile?.goal && goalContent[userProfile.goal])
    ? userProfile.goal
    : Object.keys(goalContent).find((k) =>
      plan.overview.goal?.toLowerCase().includes(k)
    ) ?? "recomp";
  const content = goalContent[goalKey];

  async function handleCalculate() {
    setCalculating(true);
    setError("");
    try {
      const data = await api.calculateNutrition(user!.id);
      setGoals({
        caloriesTarget: data.calories_target,
        proteinG: data.protein_g,
        carbsG: data.carbs_g,
        fatG: data.fat_g,
        calculatedAt: data.calculated_at,
      });
      setMissingData(false);
    } catch (err: any) {
      if (err.message?.includes("Completa tu perfil")) setMissingData(true);
      setError(err.message || "Error al calcular");
    } finally {
      setCalculating(false);
    }
  }

  async function handleSaveBodyData() {
    if (!form.age || !form.heightCm || !form.weightKg) {
      setError("Completa todos los campos");
      return;
    }
    setSavingProfile(true);
    setError("");
    try {
      await api.updateBodyData(user!.id, {
        age: parseInt(form.age),
        gender: form.gender,
        heightCm: parseFloat(form.heightCm),
        weightKg: parseFloat(form.weightKg),
      });
      await handleCalculate();
    } catch (err: any) {
      setError(err.message || "Error al guardar");
    } finally {
      setSavingProfile(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Nutrición</h1>
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-muted)] text-sm">Objetivo:</span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/30">
              {content.label}
            </span>
          </div>
        </div>

        {/* Formulario si faltan datos */}
        {missingData && !goals && (
          <Card variant="bordered" className="mb-6 space-y-4">
            <div>
              <h2 className="font-semibold mb-1">Completa tu perfil físico</h2>
              <p className="text-sm text-[var(--color-muted)]">
                Necesitamos estos datos para calcular tus calorías y macros con la fórmula Mifflin-St Jeor.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Edad", key: "age", placeholder: "25", unit: "años" },
                { label: "Altura", key: "heightCm", placeholder: "175", unit: "cm" },
                { label: "Peso", key: "weightKg", placeholder: "75", unit: "kg" },
              ].map(({ label, key, placeholder, unit }) => (
                <div key={key}>
                  <label className="text-xs text-[var(--color-muted)] mb-1 block">{label}</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder={placeholder}
                      value={(form as any)[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)]">{unit}</span>
                  </div>
                </div>
              ))}
              <div>
                <label className="text-xs text-[var(--color-muted)] mb-1 block">Género</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                  className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="male">Hombre</option>
                  <option value="female">Mujer</option>
                </select>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button className="w-full" onClick={handleSaveBodyData} disabled={savingProfile}>
              {savingProfile ? "Calculando..." : "Calcular mis macros"}
            </Button>
          </Card>
        )}

        {/* Resultados */}
        {goals && (
          <>
            {/* Calorías */}
            <Card variant="bordered" className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/15 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-muted)]">Calorías diarias objetivo</p>
                    <p className="text-4xl font-bold">{goals.caloriesTarget}</p>
                    <p className="text-xs text-[var(--color-muted)]">kcal / día</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="gap-1.5 text-xs"
                  onClick={handleCalculate}
                  disabled={calculating}
                >
                  <RefreshCcw className="w-3 h-3" />
                  {calculating ? "..." : "Recalcular"}
                </Button>
              </div>
            </Card>

            {/* Macros */}
            <Card variant="bordered" className="mb-6 space-y-5">
              <h2 className="font-semibold">Distribución de macros</h2>
              <MacroBar label="Proteína" grams={goals.proteinG} calories={goals.proteinG * 4} total={goals.caloriesTarget} color="var(--color-accent)" icon={Beef} />
              <MacroBar label="Carbohidratos" grams={goals.carbsG} calories={goals.carbsG * 4} total={goals.caloriesTarget} color="#60a5fa" icon={Wheat} />
              <MacroBar label="Grasas" grams={goals.fatG} calories={goals.fatG * 9} total={goals.caloriesTarget} color="#f97316" icon={Droplets} />
            </Card>

            {/* Cards de macros */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Proteína", value: goals.proteinG, color: "var(--color-accent)", desc: "2g / kg" },
                { label: "Carbos", value: goals.carbsG, color: "#60a5fa", desc: "~50%" },
                { label: "Grasas", value: goals.fatG, color: "#f97316", desc: "~25%" },
              ].map((m) => (
                <Card key={m.label} variant="bordered" className="text-center py-4">
                  <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}g</p>
                  <p className="text-xs font-medium mt-0.5">{m.label}</p>
                  <p className="text-xs text-[var(--color-muted)]">{m.desc}</p>
                </Card>
              ))}
            </div>

            {/* Tips colapsables */}
            <TipsSection content={content} />

            {/* Placeholder tracker de comidas */}
            <Card variant="bordered" className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-[var(--color-muted)]" />
                  <h2 className="font-semibold">Registro de comidas</h2>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-muted)]">
                  Próximamente
                </span>
              </div>
              <div className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[var(--color-card)] flex items-center justify-center mx-auto">
                  <UtensilsCrossed className="w-5 h-5 text-[var(--color-muted)]" />
                </div>
                <p className="text-sm font-medium">Tracker de comidas con IA</p>
                <p className="text-xs text-[var(--color-muted)] max-w-xs mx-auto">
                  Próximamente podrás registrar tus comidas y ver en tiempo real cuántas calorías y macros llevas en el día.
                </p>
              </div>
            </Card>

            <p className="text-xs text-center text-[var(--color-muted)]">
              Calculado el{" "}
              {new Date(goals.calculatedAt).toLocaleDateString("es-ES", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
