interface Measurement {
  weight_kg: number;
  measured_at: string;
}

interface WeightChartProps {
  measurements: Measurement[];
  initialWeight?: number;
}

export function WeightChart({ measurements, initialWeight }: WeightChartProps) {
  if (measurements.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
        <p className="text-sm text-[var(--color-muted)]">
          Necesitas al menos 2 mediciones para ver la gráfica
        </p>
        <p className="text-xs text-[var(--color-muted)]">
          Sigue registrando tu peso mensualmente
        </p>
      </div>
    );
  }

  const sorted = [...measurements].sort(
    (a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
  );

  const weights = sorted.map(m => m.weight_kg);
  const allVals = [...weights, ...(initialWeight ? [initialWeight] : [])];
  const minW    = Math.min(...allVals) - 1.5;
  const maxW    = Math.max(...allVals) + 1.5;
  const range   = maxW - minW || 1;

  const W = 560; const H = 160; const padX = 40; const padY = 16;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  const toX = (i: number) => padX + (i / (sorted.length - 1)) * innerW;
  const toY = (w: number) => padY + (1 - (w - minW) / range) * innerH;

  const linePath = sorted
    .map((m, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(m.weight_kg)}`)
    .join(" ");

  const areaPath = [
    `M ${toX(0)} ${toY(sorted[0].weight_kg)}`,
    ...sorted.map((m, i) => `L ${toX(i)} ${toY(m.weight_kg)}`),
    `L ${toX(sorted.length - 1)} ${H - padY}`,
    `L ${toX(0)} ${H - padY}`,
    "Z",
  ].join(" ");

  const diff     = sorted[sorted.length - 1].weight_kg - sorted[0].weight_kg;
  const trending = diff > 0.2 ? "up" : diff < -0.2 ? "down" : "flat";
  const accent   = "#a3e635";

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs text-[var(--color-muted)]">
        <span>Mín: <span className="text-[var(--color-foreground)] font-medium">{Math.min(...weights)}kg</span></span>
        <span className={`font-medium ${trending === "down" ? "text-blue-400" : trending === "up" ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"}`}>
          {diff > 0 ? "+" : ""}{diff.toFixed(1)}kg en total
        </span>
        <span>Máx: <span className="text-[var(--color-foreground)] font-medium">{Math.max(...weights)}kg</span></span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={accent} stopOpacity="0.25"/>
            <stop offset="100%" stopColor={accent} stopOpacity="0.02"/>
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const y   = padY + t * innerH;
          const val = (maxW - t * range).toFixed(0);
          return (
            <g key={t}>
              <line x1={padX} y1={y} x2={W - padX} y2={y}
                stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3"/>
              <text x={padX - 6} y={y} textAnchor="end" dominantBaseline="central"
                fontSize="10" fill="var(--color-muted)">{val}</text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#wg)"/>
        <path d={linePath} fill="none" stroke={accent} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"/>

        {initialWeight && (
          <>
            <line x1={padX} y1={toY(initialWeight)} x2={W - padX} y2={toY(initialWeight)}
              stroke="#60a5fa" strokeWidth="1" strokeDasharray="4 3" opacity="0.6"/>
            <text x={W - padX + 4} y={toY(initialWeight)} dominantBaseline="central"
              fontSize="9" fill="#60a5fa">inicio</text>
          </>
        )}

        {sorted.map((m, i) => (
          <g key={i}>
            <circle cx={toX(i)} cy={toY(m.weight_kg)} r="4"
              fill="var(--color-background)" stroke={accent} strokeWidth="2"/>
            <title>{`${new Date(m.measured_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}: ${m.weight_kg}kg`}</title>
          </g>
        ))}

        {sorted.map((m, i) => {
          if (sorted.length > 6 && i % 2 !== 0) return null;
          return (
            <text key={i} x={toX(i)} y={H - 2} textAnchor="middle" fontSize="10" fill="var(--color-muted)">
              {new Date(m.measured_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
            </text>
          );
        })}
      </svg>

      <p className="text-xs text-center text-[var(--color-muted)]">
        Línea azul = peso inicial del perfil
      </p>
    </div>
  );
}
