import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { radarByPillar, C5 } from '../../data/fiveS'

export function RadarPilares() {
  const data = radarByPillar()
  return (
    <div className="panel">
      <div className="panel-head">
        <h3 className="panel-title">Rendimiento por pilar 5S</h3>
        <span className="panel-hint">índice OK 0–100%</span>
      </div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke={C5.grid} />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fill: C5.textSec, fontSize: 12, fontFamily: 'IBM Plex Mono' }}
            />
            <PolarRadiusAxis
              domain={[0, 100]}
              tickCount={5}
              tick={{ fill: C5.textMut, fontSize: 9 }}
              stroke={C5.grid}
              axisLine={false}
            />
            <Radar
              name="Índice OK"
              dataKey="value"
              stroke={C5.gold}
              fill={C5.gold}
              fillOpacity={0.22}
              strokeWidth={2}
              dot={{ r: 3, fill: C5.gold, stroke: C5.gold }}
              isAnimationActive={false}
            />
            <Tooltip content={<Tip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function Tip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="viz-tip">
      <div className="tip-title">
        {d.key} · {d.label} <span style={{ color: C5.textMut }}>({d.jp})</span>
      </div>
      <div className="tip-row">
        <span className="sw" style={{ background: C5.gold }} />
        Índice OK: {d.value}%
      </div>
      <div className="tip-row" style={{ marginTop: 2 }}>
        {d.t.si}/{d.t.total} Sí · {d.t.no} No
      </div>
    </div>
  )
}
