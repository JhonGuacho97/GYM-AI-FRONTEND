import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/ui/PageLoader";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";
import { CheckCircle2, RefreshCcw } from "lucide-react";

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
const daysOptions = [2,3,4,5,6].map(d => ({ value: String(d), label: `${d} días por semana` }));
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
  { value: "full_body",   label: "Cuerpo Completo (Full Body)" },
  { value: "upper_lower", label: "Torso / Pierna" },
  { value: "ppl",         label: "Empuje / Tirón / Pierna (PPL)" },
  { value: "custom",      label: "Que la IA decida" },
];

export default function EditProfile() {
  const { user, userProfile, isLoading, saveProfile, generatePlan, refreshData } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving]           = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [saved, setSaved]             = useState(false);
  const [error, setError]             = useState("");
  const [form, setForm] = useState({
    goal: "bulk", experience: "intermediate",
    daysPerWeek: "4", sessionLength: "60",
    equipment: "full_gym", preferredSplit: "upper_lower",
    injuries: "", age: "", gender: "male",
    heightCm: "", weightKg: "",
  });

  useEffect(() => {
    if (userProfile) {
      setForm({
        goal:          userProfile.goal          ?? "bulk",
        experience:    userProfile.experience    ?? "intermediate",
        daysPerWeek:   String(userProfile.daysPerWeek   ?? 4),
        sessionLength: String(userProfile.sessionLength ?? 60),
        equipment:     userProfile.equipment     ?? "full_gym",
        preferredSplit: userProfile.preferredSplit ?? "upper_lower",
        injuries:      userProfile.injuries      ?? "",
        age:           String(userProfile.age    ?? ""),
        gender:        userProfile.gender        ?? "male",
        heightCm:      String(userProfile.heightCm ?? ""),
        weightKg:      String(userProfile.weightKg ?? ""),
      });
    }
  }, [userProfile]);

  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/auth/sign-in" replace />;

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true); setError(""); setSaved(false);
    try {
      await saveProfile({
        goal:           form.goal as any,
        experience:     form.experience as any,
        daysPerWeek:    parseInt(form.daysPerWeek),
        sessionLength:  parseInt(form.sessionLength),
        equipment:      form.equipment as any,
        preferredSplit: form.preferredSplit as any,
        injuries:       form.injuries || undefined,
        age:            form.age      ? parseInt(form.age)        : undefined,
        gender:         form.gender   ? form.gender as any         : undefined,
        heightCm:       form.heightCm ? parseFloat(form.heightCm) : undefined,
        weightKg:       form.weightKg ? parseFloat(form.weightKg) : undefined,
      });
      await refreshData();
      setSaved(true);
    } catch (err: any) {
      setError(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAndRegenerate() {
    setRegenerating(true); setError("");
    try {
      await saveProfile({
        goal:           form.goal as any,
        experience:     form.experience as any,
        daysPerWeek:    parseInt(form.daysPerWeek),
        sessionLength:  parseInt(form.sessionLength),
        equipment:      form.equipment as any,
        preferredSplit: form.preferredSplit as any,
        injuries:       form.injuries || undefined,
        age:            form.age      ? parseInt(form.age)        : undefined,
        gender:         form.gender   ? form.gender as any         : undefined,
        heightCm:       form.heightCm ? parseFloat(form.heightCm) : undefined,
        weightKg:       form.weightKg ? parseFloat(form.weightKg) : undefined,
      });
      await generatePlan();
      navigate("/profile");
    } catch (err: any) {
      setError(err.message || "Error al regenerar");
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Editar Perfil</h1>
          <p className="text-[var(--color-muted)]">
            Actualiza tus datos de entrenamiento y físicos
          </p>
        </div>

        {/* Entrenamiento */}
        <Card variant="bordered" className="mb-6 space-y-5">
          <h2 className="font-semibold text-base">Entrenamiento</h2>
          <Select id="goal" label="Objetivo principal" options={goalOptions}
            value={form.goal} onChange={e => update("goal", e.target.value)} />
          <Select id="experience" label="Experiencia" options={experienceOptions}
            value={form.experience} onChange={e => update("experience", e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Select id="days" label="Días por semana" options={daysOptions}
              value={form.daysPerWeek} onChange={e => update("daysPerWeek", e.target.value)} />
            <Select id="session" label="Duración sesión" options={sessionOptions}
              value={form.sessionLength} onChange={e => update("sessionLength", e.target.value)} />
          </div>
          <Select id="equipment" label="Equipamiento" options={equipmentOptions}
            value={form.equipment} onChange={e => update("equipment", e.target.value)} />
          <Select id="split" label="División preferida" options={splitOptions}
            value={form.preferredSplit} onChange={e => update("preferredSplit", e.target.value)} />
          <Textarea id="injuries" label="Lesiones o limitaciones (opcional)"
            placeholder="Ej: problemas en la espalda baja..."
            rows={2} value={form.injuries}
            onChange={e => update("injuries", e.target.value)} />
        </Card>

        {/* Datos físicos */}
        <Card variant="bordered" className="mb-6 space-y-4">
          <h2 className="font-semibold text-base">Datos físicos</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Edad", key: "age", placeholder: "25", unit: "años" },
              { label: "Altura", key: "heightCm", placeholder: "175", unit: "cm" },
              { label: "Peso", key: "weightKg", placeholder: "75", unit: "kg" },
            ].map(({ label, key, placeholder, unit }) => (
              <div key={key}>
                <label className="text-xs text-[var(--color-muted)] mb-1 block">{label}</label>
                <div className="relative">
                  <input type="number" step="0.1" placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={e => update(key, e.target.value)}
                    className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)]">{unit}</span>
                </div>
              </div>
            ))}
            <div>
              <label className="text-xs text-[var(--color-muted)] mb-1 block">Género</label>
              <select value={form.gender} onChange={e => update("gender", e.target.value)}
                className="w-full bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)]">
                <option value="male">Hombre</option>
                <option value="female">Mujer</option>
              </select>
            </div>
          </div>
        </Card>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {saved && (
          <div className="flex items-center gap-2 text-[var(--color-accent)] text-sm mb-4">
            <CheckCircle2 className="w-4 h-4" /> Cambios guardados correctamente
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
          <Button onClick={handleSaveAndRegenerate} disabled={regenerating} className="flex-1 gap-2">
            <RefreshCcw className="w-4 h-4" />
            {regenerating ? "Generando..." : "Guardar y regenerar plan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
