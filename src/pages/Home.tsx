import { Link, Navigate } from "react-router-dom";
import {
  Zap,
  Target,
  Calendar,
  ArrowRight,
  Sparkles,
  Clock,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: Sparkles,
    title: "Planes con IA",
    description:
      "Obtén un programa de entrenamiento adaptado a tus objetivos, experiencia y disponibilidad.",
  },
  {
    icon: Target,
    title: "Enfocado en tus metas",
    description:
      "Ya sea que quieras ganar músculo, perder grasa o ser más fuerte — optimizamos tu plan para lograrlo.",
  },
  {
    icon: Calendar,
    title: "Horarios flexibles",
    description:
      "Planes que se ajustan a tu estilo de vida. Entrena 2 o 6 días — nos adaptamos a ti.",
  },
  {
    icon: Clock,
    title: "Entrenamientos eficientes",
    description:
      "Cada sesión está diseñada para maximizar resultados en el tiempo que tienes disponible.",
  },
];

export default function Home() {
  const { user, isLoading } = useAuth();

  // Redirigir usuarios autenticados al perfil
  if (!isLoading && user) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Fondo con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-accent)]/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[var(--color-accent)]/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] mb-8">
            <Zap className="w-4 h-4 text-[var(--color-accent)]" />
            <span className="text-sm text-[var(--color-muted)]">
              Planes de entrenamiento con IA
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Tu Plan de Gimnasio
            <br />
            <span className="text-[var(--color-accent)]">Perfecto</span> en
            Segundos
          </h1>

          <p className="text-xl text-[var(--color-muted)] max-w-2xl mx-auto mb-10">
            Deja de adivinar. Obtén un programa de entrenamiento personalizado
            con IA, adaptado a tus objetivos, experiencia y tiempo disponible.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/onboarding">
              <Button size="lg" className="gap-2">
                Comenzar Gratis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/onboarding">
              <Button variant="secondary" size="lg">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de características */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Por qué GymAI?
            </h2>
            <p className="text-[var(--color-muted)] text-lg max-w-2xl mx-auto">
              Combinamos experiencia en fitness con inteligencia artificial para
              crear programas que realmente funcionan para ti.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                variant="bordered"
                className="group hover:border-[var(--color-accent)]/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-[var(--color-accent)]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-[var(--color-muted)] text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
