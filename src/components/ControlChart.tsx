// Carta de control mensual: la serie del KPI sobre bandas de semáforo
// (deficiente / aceptable / ideal como zonas de fondo), línea de meta
// punteada y puntos coloreados por el estado de cada mes.
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { KpiDefinition, KpiMonthData } from '../data/kpi'
import { statusColor, statusLabel } from '../data/kpi'

const GRID = 'rgba(247,250,252,0.07)'
const AXIS = 'rgba(247,250,252,0.22)'
const GOOD_BG = 'rgba(47,179,122,0.14)'
const WARN_BG = 'rgba(224,165,63,0.13)'
const CRIT_BG = 'rgba(229,72,77,0.11)'

interface Props {
  def: KpiDefinition
  months: KpiMonthData[]
}

export function ControlChart({ def, months }: Props) {
  const data = months.map((m) => ({
    period: m.period,
    value: m.result === null ? null : Math.round(m.result * 1000) / 10,
    meta: m.meta === null ? null : Math.round(m.meta * 100),
    status: m.status,
  }))

  const vals = data.map((d) => d.value).filter((v): v is number => v !== null)
  const idealPct = def.idealThreshold * 100
  const acceptPct = def.acceptableThreshold * 100
  const defPct = def.deficientThreshold * 100
  const rawMax = Math.max(...vals, idealPct, 10)
  const domainMax = rawMax > 60 ? 100 : Math.ceil((rawMax * 1.25) / 5) * 5
  const metaLine = data.find((d) => d.meta !== null)?.meta ?? Math.round(idealPct)

  const Dot = (props: any) => {
    const { cx, cy, payload } = props
    if (payload.value === null || cx == null) return <g />
    const c = statusColor(payload.status)
    return (
      <g>
        <circle cx={cx} cy={cy} r={6.5} fill={c} opacity={0.25} />
        <circle cx={cx} cy={cy} r={3.5} fill={c} stroke="var(--surface-1)" strokeWidth={1.5} />
      </g>
    )
  }

  return (
    <div className="chart-box" style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 14, bottom: 4, left: 0 }}>
          {/* Bandas de semáforo */}
          {def.invert ? (
            <>
              <ReferenceArea y1={0} y2={Math.min(defPct, domainMax)} fill={GOOD_BG} />
              <ReferenceArea y1={Math.min(defPct, domainMax)} y2={domainMax} fill={CRIT_BG} />
            </>
          ) : (
            <>
              <ReferenceArea y1={0} y2={Math.min(acceptPct, domainMax)} fill={CRIT_BG} />
              {acceptPct < domainMax && (
                <ReferenceArea y1={acceptPct} y2={Math.min(idealPct, domainMax)} fill={WARN_BG} />
              )}
              {idealPct < domainMax && <ReferenceArea y1={idealPct} y2={domainMax} fill={GOOD_BG} />}
            </>
          )}
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis
            dataKey="period"
            tick={{ fill: '#cbd5e1', fontSize: 10.5 }}
            axisLine={{ stroke: AXIS }}
            tickLine={false}
            interval={0}
            angle={-38}
            textAnchor="end"
            height={52}
          />
          <YAxis
            domain={[0, domainMax]}
            unit="%"
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <ReferenceLine
            y={metaLine}
            stroke="#f7fafc"
            strokeDasharray="6 4"
            opacity={0.55}
            label={{
              value: `Meta ${metaLine}%`,
              position: 'insideTopRight',
              fill: '#cbd5e1',
              fontSize: 10,
              fontFamily: 'IBM Plex Mono',
            }}
          />
          <Tooltip content={<Tip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#98d1b0"
            strokeWidth={2}
            connectNulls
            dot={<Dot />}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function Tip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  if (d.value === null) return null
  const c = statusColor(d.status)
  return (
    <div className="viz-tip">
      <div className="tip-title">{d.period}</div>
      <div className="tip-row">
        <span className="sw" style={{ background: c }} />
        Resultado: {d.value}% · {statusLabel(d.status, 'es')}
      </div>
      {d.meta !== null && (
        <div className="tip-row" style={{ marginTop: 2 }}>
          Meta: {d.meta}%
        </div>
      )}
    </div>
  )
}
