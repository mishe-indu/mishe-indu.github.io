import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from 'recharts'
import { paretoNC, C5 } from '../../data/fiveS'

export function ParetoNC() {
  const data = paretoNC().map((r) => ({ name: r.label, count: r.count, cum: r.cum }))
  const maxCount = Math.max(1, ...data.map((d) => d.count))
  return (
    <div className="panel">
      <div className="panel-head">
        <h3 className="panel-title">No conformidades (Pareto)</h3>
        <span className="panel-hint">80/20 · foco de mejora</span>
      </div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 18, right: 46, bottom: 4, left: 0 }}>
            <CartesianGrid vertical={false} stroke={C5.grid} />
            <XAxis
              dataKey="name"
              tick={{ fill: C5.textSec, fontSize: 11 }}
              axisLine={{ stroke: C5.axis }}
              tickLine={false}
              interval={0}
            />
            <YAxis
              yAxisId="l"
              domain={[0, Math.ceil(maxCount * 1.2)]}
              allowDecimals={false}
              tick={{ fill: C5.textMut, fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="r"
              orientation="right"
              domain={[0, 100]}
              unit="%"
              tick={{ fill: C5.textMut, fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<Tip />} />
            <Bar
              yAxisId="l"
              dataKey="count"
              fill={C5.critical}
              radius={[4, 4, 0, 0]}
              maxBarSize={58}
              name="No conformidades"
              isAnimationActive={false}
            >
              <LabelList
                dataKey="count"
                position="top"
                style={{ fill: C5.textPri, fontSize: 12, fontFamily: 'IBM Plex Mono', fontWeight: 700 }}
              />
            </Bar>
            <Line
              yAxisId="r"
              type="monotone"
              dataKey="cum"
              stroke={C5.cyan}
              strokeWidth={2}
              dot={{ r: 4, fill: C5.cyan, stroke: C5.cyan }}
              name="% acumulado"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="heat-legend" style={{ marginTop: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: C5.critical, display: 'inline-block' }} />
          No conformidades
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 14 }}>
          <span style={{ width: 14, height: 2, background: C5.cyan, display: 'inline-block' }} />
          % acumulado
        </span>
      </div>
    </div>
  )
}

function Tip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="viz-tip">
      <div className="tip-title">{d.name}</div>
      <div className="tip-row">
        <span className="sw" style={{ background: C5.critical }} />
        No conformidades: {d.count}
      </div>
      <div className="tip-row" style={{ marginTop: 2 }}>
        <span className="sw" style={{ background: C5.cyan }} />
        Acumulado: {d.cum}%
      </div>
    </div>
  )
}
