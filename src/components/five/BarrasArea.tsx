import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { areaCompliance, bandColor, band, C5 } from '../../data/fiveS'

const BAND_LABEL = { good: 'Conforme', warning: 'Observado', critical: 'Crítico' } as const

export function BarrasArea() {
  const data = areaCompliance().map((r) => ({ name: r.label, value: r.value, t: r.t }))
  return (
    <div className="panel">
      <div className="panel-head">
        <h3 className="panel-title">Cumplimiento por área</h3>
        <span className="panel-hint">índice OK 0–100%</span>
      </div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 46, bottom: 4, left: 8 }}
            barCategoryGap="30%"
          >
            <CartesianGrid horizontal={false} stroke={C5.grid} />
            <XAxis
              type="number"
              domain={[0, 100]}
              unit="%"
              tick={{ fill: C5.textSec, fontSize: 11, fontFamily: 'IBM Plex Mono' }}
              axisLine={{ stroke: C5.axis }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tick={{ fill: C5.textPri, fontSize: 12.5 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<Tip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={26} isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell key={i} fill={bandColor(d.value)} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                formatter={(v: number) => `${v}%`}
                style={{ fill: C5.textPri, fontSize: 12, fontFamily: 'IBM Plex Mono', fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function Tip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const b = band(d.value)
  return (
    <div className="viz-tip">
      <div className="tip-title">{d.name}</div>
      <div className="tip-row">
        <span className="sw" style={{ background: bandColor(d.value) }} />
        {BAND_LABEL[b]} — {d.value}%
      </div>
      <div className="tip-row" style={{ marginTop: 2 }}>
        {d.t.si} Sí · {d.t.no} No · {d.t.total} ítems
      </div>
    </div>
  )
}
