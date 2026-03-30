import { RedirectToSignIn, SignedIn } from "@neondatabase/neon-js/auth/react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Select";
import { useState } from "react";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";
import { ArrowRight, ArrowLeft, Loader2, Dumbbell, User } from "lucide-react";
import type { UserProfile } from "../types";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const goalOptions = [
  { value: "bulk",      label: "Ganar Músculo (Volumen)" },
  { value: "cut",       label: "Perder Grasa (Definición)" },
  { value: "recomp",    label: "Recomposición Corporal" },
  { value: "strength",  label: "Ganar Fuerza" },
  { value: "endurance", label: "Mejorar Resistencia" },
];

const experienceOptions = [
  { value: "beginner",     label: "Principiante (0-1 años)" },
  { value: "intermediate", label: "Intermedio (1-3 años)" },
  { value: "advanced",     label: "Avanzado (3+ años)" },
];

const daysOptions = [
  { value: "2", label: "2 días por semana" },
  { value: "3", label: "3 días por semana" },
  { value: "4", label: "4 días por semana" },
  { value: "5", label: "5 días por semana" },
  { value: "6", label: "6 días por semana" },
];

const sessionOptions = [
  { value: "30", label: "30 minutos" },
  { value: "45", label: "45 minutos" },
  { value: "60", label: "60 minutos" },
  { value: "90", label: "90 minutos" },
];

const equipmentOptions = [
  { value: "full_gym",  label: "Gimnasio Completo" },
  { value: "home",      label: "Gimnasio en Casa" },
  { value: "dumbbells", label: "Solo Mancuernas" },
];

const splitOptions = [
  { value: "full_body",    label: "Cuerpo Completo (Full Body)" },
  { value: "upper_lower",  label: "Torso / Pierna" },
  { value: "ppl",          label: "Empuje / Tirón / Pierna (PPL)" },
  { value: "custom",       label: "Que la IA decida" },
];

// ─── Indicador de pasos ───────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  const steps = [
    { icon: Dumbbell, label: "Entrenamiento" },
    { icon: User,     label: "Datos físicos" },
  ];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const done    = i < current;
        const active  = i === current;
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  done
                    ? "bg-[var(--color-accent)] text-[var(--color-background)]"
                    : active
                    ? "border-2 border-[var(--color-accent)] text-[var(--color-accent)]"
                    : "border-2 border-[var(--color-border)] text-[var(--color-muted)]"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-xs ${
                  active ? "text-[var(--color-foreground)] font-medium" : "text-[var(--color-muted)]"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < total - 1 && (
              <div
                className={`w-16 h-0.5 mb-4 transition-all ${
                  done ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Campo de input numérico reutilizable ─────────────────────────────────────
function NumberField({
  label, placeholder, value, onChange, step = "1", unit,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  step?: string;
  unit?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      <div className="relative">
        <input
          type="number"
          step={step}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)]">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Onboarding() {
  const { user, saveProfile, generatePlan } = useAuth();
  const [step, setStep]           = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError]         = useState("");
  const navigate                  = useNavigate();

  // Paso 1 — Entrenamiento
  const [training, setTraining] = useState({
    goal: "bulk",
    experience: "intermediate",
    daysPerWeek: "4",
    sessionLength: "60",
    equipment: "full_gym",
    injuries: "",
    preferredSplit: "upper_lower",
  });

  // Paso 2 — Datos físicos
  const [body, setBody] = useState({
    age: "",
    gender: "male",
    heightCm: "",
    weightKg: "",
  });

  function updateTraining(field: string, value: string) {
    setTraining((prev) => ({ ...prev, [field]: value }));
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleFinish(e: React.FormEvent) {
    e.preventDefault();
    if (!body.age || !body.heightCm || !body.weightKg) {
      setError("Por favor completa todos los campos físicos");
      return;
    }
    setError("");

    const profile: Omit<UserProfile, "userId" | "updatedAt"> = {
      goal:           training.goal as UserProfile["goal"],
      experience:     training.experience as UserProfile["experience"],
      daysPerWeek:    parseInt(training.daysPerWeek),
      sessionLength:  parseInt(training.sessionLength),
      equipment:      training.equipment as UserProfile["equipment"],
      injuries:       training.injuries || undefined,
      preferredSplit: training.preferredSplit as UserProfile["preferredSplit"],
      age:            parseInt(body.age),
      gender:         body.gender as "male" | "female",
      heightCm:       parseFloat(body.heightCm),
      weightKg:       parseFloat(body.weightKg),
    };

    try {
      await saveProfile(profile);
      // Calcular macros automáticamente al terminar onboarding
      await api.calculateNutrition(user!.id).catch(() => {});
      setIsGenerating(true);
      await generatePlan();
      navigate("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el perfil");
      setIsGenerating(false);
    }
  }

  if (!user) return <RedirectToSignIn />;

  return (
    <SignedIn>
      <div className="min-h-screen pt-24 pb-12 px-6">
        <div className="max-w-xl mx-auto">

          {isGenerating ? (
            <Card variant="bordered" className="text-center py-16">
              <Loader2 className="w-12 h-12 text-[var(--color-accent)] mx-auto mb-6 animate-spin" />
              <h1 className="text-2xl font-bold mb-2">Creando tu Plan</h1>
              <p className="text-[var(--color-muted)]">
                Nuestra IA está diseñando tu programa de entrenamiento personalizado...
              </p>
            </Card>
          ) : (
            <>
              <div className="text-center mb-2">
                <h1 className="text-3xl font-bold mb-1">Cuéntanos sobre ti</h1>
                <p className="text-[var(--color-muted)]">
                  Ayúdanos a crear el plan perfecto para tus necesidades
                </p>
              </div>

              <StepIndicator current={step} total={2} />

              {error && (
                <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
              )}

              {/* ── PASO 1: Entrenamiento ─────────────────────────────────── */}
              {step === 0 && (
                <Card variant="bordered">
                  <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-[var(--color-accent)]" />
                    Tu entrenamiento
                  </h2>
                  <form onSubmit={handleStep1} className="space-y-5">
                    <Select
                      id="goal"
                      label="¿Cuál es tu objetivo principal?"
                      options={goalOptions}
                      value={training.goal}
                      onChange={(e) => updateTraining("goal", e.target.value)}
                    />
                    <Select
                      id="experience"
                      label="Experiencia de entrenamiento"
                      options={experienceOptions}
                      value={training.experience}
                      onChange={(e) => updateTraining("experience", e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        id="daysPerWeek"
                        label="Días por semana"
                        options={daysOptions}
                        value={training.daysPerWeek}
                        onChange={(e) => updateTraining("daysPerWeek", e.target.value)}
                      />
                      <Select
                        id="sessionLength"
                        label="Duración sesión"
                        options={sessionOptions}
                        value={training.sessionLength}
                        onChange={(e) => updateTraining("sessionLength", e.target.value)}
                      />
                    </div>
                    <Select
                      id="equipment"
                      label="Equipamiento disponible"
                      options={equipmentOptions}
                      value={training.equipment}
                      onChange={(e) => updateTraining("equipment", e.target.value)}
                    />
                    <Select
                      id="preferredSplit"
                      label="División de entrenamiento preferida"
                      options={splitOptions}
                      value={training.preferredSplit}
                      onChange={(e) => updateTraining("preferredSplit", e.target.value)}
                    />
                    <Textarea
                      id="injuries"
                      label="¿Alguna lesión o limitación? (opcional)"
                      placeholder="Ej: problemas en la espalda baja, pinzamiento en el hombro..."
                      rows={3}
                      value={training.injuries}
                      onChange={(e) => updateTraining("injuries", e.target.value)}
                    />
                    <Button type="submit" className="w-full gap-2">
                      Siguiente <ArrowRight className="w-4 h-4" />
                    </Button>
                  </form>
                </Card>
              )}

              {/* ── PASO 2: Datos físicos ─────────────────────────────────── */}
              {step === 1 && (
                <Card variant="bordered">
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <User className="w-5 h-5 text-[var(--color-accent)]" />
                    Datos físicos
                  </h2>
                  <p className="text-sm text-[var(--color-muted)] mb-5">
                    Usamos estos datos para calcular tus calorías y macros personalizados con la fórmula Mifflin-St Jeor.
                  </p>
                  <form onSubmit={handleFinish} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <NumberField
                        label="Edad"
                        placeholder="25"
                        value={body.age}
                        onChange={(v) => setBody((b) => ({ ...b, age: v }))}
                        unit="años"
                      />
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Género</label>
                        <select
                          value={body.gender}
                          onChange={(e) => setBody((b) => ({ ...b, gender: e.target.value }))}
                          className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                        >
                          <option value="male">Hombre</option>
                          <option value="female">Mujer</option>
                        </select>
                      </div>
                      <NumberField
                        label="Altura"
                        placeholder="175"
                        value={body.heightCm}
                        onChange={(v) => setBody((b) => ({ ...b, heightCm: v }))}
                        unit="cm"
                      />
                      <NumberField
                        label="Peso"
                        placeholder="75"
                        step="0.1"
                        value={body.weightKg}
                        onChange={(v) => setBody((b) => ({ ...b, weightKg: v }))}
                        unit="kg"
                      />
                    </div>

                    {/* Preview de lo que se calculará */}
                    <div className="bg-[var(--color-card)] rounded-xl p-4 border border-[var(--color-border)]">
                      <p className="text-xs text-[var(--color-muted)] mb-2">Al finalizar se calculará automáticamente:</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-[var(--color-accent)] font-medium">🔥 Calorías diarias</span>
                        <span className="text-[var(--color-muted)]">•</span>
                        <span className="font-medium">🥩 Proteína</span>
                        <span className="text-[var(--color-muted)]">•</span>
                        <span className="font-medium">🌾 Carbos</span>
                        <span className="text-[var(--color-muted)]">•</span>
                        <span className="font-medium">🫒 Grasas</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        className="gap-2"
                        onClick={() => { setStep(0); setError(""); }}
                      >
                        <ArrowLeft className="w-4 h-4" /> Atrás
                      </Button>
                      <Button type="submit" className="flex-1 gap-2">
                        Generar mi plan completo <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </SignedIn>
  );
}
