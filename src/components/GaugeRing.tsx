// Gauge radial (arco 270°) en SVG puro. Muestra un valor 0–100% contra su
// meta: el arco se pinta del color de estado y una marca fija señala la meta.
interface Props {
  value: number | null // 0–100
  target?: number | null // 0–100, marca sobre el arco
  color: string
  size?: number
  stroke?: number
  label?: string
}

const START = 135 // grados: arco de 135° a 405° (270° útiles)
const SWEEP = 270

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx: number, cy: number, r: number, from: number, to: number) {
  const s = polar(cx, cy, r, from)
  const e = polar(cx, cy, r, to)
  const large = to - from > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
}

export function GaugeRing({ value, target, color, size = 120, stroke = 10, label }: Props) {
  const c = size / 2
  const r = c - stroke / 2 - 2
  const v = value === null ? 0 : Math.min(100, Math.max(0, value))
  const end = START + (SWEEP * v) / 100

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${label ?? 'Valor'}: ${value === null ? 'sin datos' : `${Math.round(v)}%`}`}
    >
      {/* pista */}
      <path
        d={arcPath(c, c, r, START, START + SWEEP)}
        fill="none"
        stroke="var(--surface-3)"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      {/* valor */}
      {value !== null && v > 0.5 && (
        <path
          d={arcPath(c, c, r, START, end)}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      )}
      {/* marca de meta */}
      {target !== null && target !== undefined && (
        (() => {
          const deg = START + (SWEEP * Math.min(100, Math.max(0, target))) / 100
          const p1 = polar(c, c, r - stroke / 2 - 3, deg)
          const p2 = polar(c, c, r + stroke / 2 + 3, deg)
          return (
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="var(--text-primary)"
              strokeWidth={2}
              opacity={0.85}
            />
          )
        })()
      )}
      {/* cifra central */}
      <text
        x={c}
        y={c + (label ? -2 : 4)}
        textAnchor="middle"
        fontFamily="Archivo, sans-serif"
        fontWeight={800}
        fontSize={size * 0.24}
        fill={value === null ? 'var(--text-muted)' : color}
      >
        {value === null ? '—' : `${Math.round(v)}%`}
      </text>
      {label && (
        <text
          x={c}
          y={c + size * 0.14}
          textAnchor="middle"
          fontFamily="IBM Plex Mono, monospace"
          fontSize={size * 0.075}
          letterSpacing="0.08em"
          fill="var(--text-muted)"
        >
          {label.toUpperCase()}
        </text>
      )}
    </svg>
  )
}
