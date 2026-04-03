import { Link, Navigate } from "react-router-dom";
import {
  Zap, Target, Calendar, ArrowRight, Sparkles,
  Dumbbell, Utensils, TrendingUp, Scale, CheckCircle2,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

const stats = [
  { value: "5+",    label: "Objetivos fitness"         },
  { value: "IA",    label: "Planes personalizados"      },
  { value: "100%",  label: "Adaptado a ti"              },
  { value: "∞",     label: "Regeneraciones del plan"    },
];

const features = [
  {
    icon: Sparkles,
    title: "Plan de entrenamiento con IA",
    description: "Genera un programa completo en segundos. La IA adapta cada ejercicio a tu nivel, equipo disponible y tiempo.",
    badge: "Núcleo",
  },
  {
    icon: Utensils,
    title: "Nutrición inteligente",
    description: "Calcula tus macros con la fórmula Mifflin-St Jeor, genera planes de comidas diarios y registra lo que comes.",
    badge: "Nuevo",
  },
  {
    icon: TrendingUp,
    title: "Seguimiento de progreso",
    description: "Registra cada sesión, ve la evolución de tus pesos por ejercicio y analiza tus tendencias semana a semana.",
    badge: "",
  },
  {
    icon: Scale,
    title: "Seguimiento corporal con IA",
    description: "Registra peso, % grasa y cintura mensualmente. La IA analiza tu progreso y da recomendaciones personalizadas.",
    badge: "IA",
  },
  {
    icon: Target,
    title: "Multi-objetivo",
    description: "Volumen, definición, fuerza, resistencia o recomposición. Cada objetivo tiene su estrategia de entrenamiento y nutrición.",
    badge: "",
  },
  {
    icon: Calendar,
    title: "Dashboard diario",
    description: "Un vistazo rápido a tus calorías del día, racha de entrenamientos, peso actual y el entrenamiento que toca hoy.",
    badge: "",
  },
];

const steps = [
  {
    num: "01",
    title: "Crea tu perfil",
    description: "Dinos tu objetivo, experiencia, días disponibles y datos físicos. Solo toma 2 minutos.",
  },
  {
    num: "02",
    title: "Recibe tu plan",
    description: "La IA genera un plan de entrenamiento y calcula tus macros personalizados al instante.",
  },
  {
    num: "03",
    title: "Entrena y registra",
    description: "Sigue el plan, registra tus sesiones y comidas. Ve cómo evolucionas semana a semana.",
  },
  {
    num: "04",
    title: "Adapta y mejora",
    description: "Regenera tu plan cuando quieras, ajusta tu nutrición y deja que la IA analice tu progreso.",
  },
];

const goals = [
  { key: "bulk",      label: "Ganar músculo",      color: "text-[var(--color-accent)]",  bg: "bg-[var(--color-accent)]/10"  },
  { key: "cut",       label: "Perder grasa",        color: "text-blue-400",               bg: "bg-blue-400/10"               },
  { key: "strength",  label: "Ganar fuerza",        color: "text-orange-400",             bg: "bg-orange-400/10"             },
  { key: "recomp",    label: "Recomposición",       color: "text-purple-400",             bg: "bg-purple-400/10"             },
  { key: "endurance", label: "Resistencia",         color: "text-pink-400",               bg: "bg-pink-400/10"               },
];

export default function Home() {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-24 px-6">
        {/* Glow de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--color-accent)]/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] mb-8">
            <Zap className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span className="text-sm text-[var(--color-muted)]">Entrenamiento + Nutrición con IA</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            Tu app fitness
            <br />
            <span className="text-[var(--color-accent)]">completa</span> con IA
          </h1>

          <p className="text-lg md:text-xl text-[var(--color-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Plan de entrenamiento personalizado, nutrición calculada, seguimiento de progreso y análisis con IA — todo en un solo lugar.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link to="/auth/sign-up">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Empezar gratis
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/auth/sign-in">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Iniciar sesión
              </Button>
            </Link>
          </div>

          {/* Objetivos pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {goals.map(g => (
              <span key={g.key} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${g.bg} ${g.color} border border-current/20`}>
                <CheckCircle2 className="w-3 h-3" />
                {g.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <section className="py-12 px-6 border-y border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-[var(--color-accent)] mb-1">{s.value}</p>
              <p className="text-sm text-[var(--color-muted)]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Todo lo que necesitas</h2>
            <p className="text-[var(--color-muted)] text-lg max-w-xl mx-auto">
              Una sola app para planificar, ejecutar y analizar tu progreso fitness.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div
                key={f.title}
                className="group relative bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 hover:border-[var(--color-accent)]/40 transition-all duration-300"
              >
                {f.badge && (
                  <span className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/30 font-medium">
                    {f.badge}
                  </span>
                )}
                <div className="w-11 h-11 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/20 transition-colors">
                  <f.icon className="w-5 h-5 text-[var(--color-accent)]" />
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[var(--color-card)]/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cómo funciona</h2>
            <p className="text-[var(--color-muted)] text-lg">En menos de 5 minutos tienes tu plan completo.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {steps.map((step,_) => (
              <div key={step.num} className="flex gap-5">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-[var(--color-accent)]">{step.num}</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lo que incluye ────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Una app. Todo tu fitness.
              </h2>
              <div className="space-y-4">
                {[
                  "Plan de entrenamiento generado por IA",
                  "Macros y calorías calculados con Mifflin-St Jeor",
                  "Plan de comidas diario con IA",
                  "Tracker de comidas con estimación automática",
                  "Registro de sesiones y progreso por ejercicio",
                  "Seguimiento mensual de peso y composición",
                  "Análisis de progreso corporal con IA",
                  "Dashboard con resumen diario completo",
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-[var(--color-accent)]" />
                    </div>
                    <span className="text-sm text-[var(--color-muted)]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini preview del dashboard */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Dumbbell className="w-4 h-4 text-[var(--color-accent)]" />
                <span className="text-sm font-medium">Dashboard diario</span>
              </div>
              {/* Calorías mini */}
              <div className="bg-[var(--color-background)] rounded-xl p-3 border border-[var(--color-border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[var(--color-muted)]">Calorías hoy</span>
                  <span className="text-xs font-medium text-[var(--color-accent)]">1,450 / 2,200</span>
                </div>
                <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-accent)] rounded-full" style={{ width: "66%" }} />
                </div>
              </div>
              {/* Racha */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[var(--color-background)] rounded-xl p-3 border border-[var(--color-border)] text-center">
                  <p className="text-2xl font-bold text-[var(--color-accent)]">7</p>
                  <p className="text-xs text-[var(--color-muted)]">días seguidos</p>
                </div>
                <div className="bg-[var(--color-background)] rounded-xl p-3 border border-[var(--color-border)] text-center">
                  <p className="text-2xl font-bold">78kg</p>
                  <p className="text-xs text-[var(--color-muted)]">peso actual</p>
                </div>
              </div>
              {/* Próximo entreno */}
              <div className="bg-[var(--color-background)] rounded-xl p-3 border border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-muted)] mb-1">Hoy entrenas</p>
                <p className="text-sm font-medium">Empuje (Pecho / Hombros)</p>
                <p className="text-xs text-[var(--color-accent)] mt-0.5">5 ejercicios · 60 min</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--color-border)] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[var(--color-accent)]" />
            <span className="font-semibold">GymAI</span>
          </div>
          <p className="text-xs text-[var(--color-muted)] text-center">
            Tu compañero de fitness inteligente. Entrenamiento y nutrición con IA.
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            © {new Date().getFullYear()} GymAI
          </p>
        </div>
      </footer>

    </div>
  );
}