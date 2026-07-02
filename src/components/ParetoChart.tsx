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
import { useI18n } from '../i18n'
import { paretoByArea } from '../data/compute'
import { STATUS, CYAN, GRID, AXIS, TEXT_SECONDARY, TEXT_PRIMARY, TEXT_MUTED } from '../theme'

export function ParetoChart() {
  const { t, lang } = useI18n()
  const rows = paretoByArea()
  const data = rows.map((r) => ({
    name: lang === 'es' ? r.es : r.en,
    count: r.count,
    cum: Math.round(r.cumulativePct),
  }))
  const maxCount = Math.max(1, ...data.map((d) => d.count))

  return (
    <div className="card">
      <div className="card-head">
        <h3>{t('chart.pareto')}</h3>
        <span className="hint">80/20 · foco de mejora</span>
      </div>
      <div className="chart-box tall">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 16, right: 48, bottom: 4, left: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="name"
              tick={{ fill: TEXT_SECONDARY, fontSize: 11.5 }}
              axisLine={{ stroke: AXIS }}
              tickLine={false}
              interval={0}
            />
            <YAxis
              yAxisId="left"
              domain={[0, Math.ceil(maxCount * 1.15)]}
              allowDecimals={false}
              tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              unit="%"
              tick={{ fill: TEXT_MUTED, fontSize: 10, fontFamily: 'IBM Plex Mono' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<ParetoTip />} />
            <Bar
              yAxisId="left"
              dataKey="count"
              fill={STATUS.critical}
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
              name={t('chart.pareto.bars')}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="count"
                position="top"
                style={{ fill: TEXT_PRIMARY, fontSize: 12, fontFamily: 'IBM Plex Mono', fontWeight: 600 }}
              />
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cum"
              stroke={CYAN}
              strokeWidth={2}
              dot={{ r: 4, fill: CYAN, stroke: CYAN }}
              name={t('chart.pareto.line')}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="heat-legend" style={{ marginTop: 10 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span className="sw" style={{ width: 10, height: 10, borderRadius: 2, background: STATUS.critical, display: 'inline-block' }} />
          {t('chart.pareto.bars')}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 14 }}>
          <span style={{ width: 14, height: 2, background: CYAN, display: 'inline-block' }} />
          {t('chart.pareto.line')}
        </span>
      </div>
    </div>
  )
}

function ParetoTip({ active, payload }: any) {
  const { t } = useI18n()
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="viz-tip">
      <div className="tip-title">{d.name}</div>
      <div className="tip-row">
        <span className="sw" style={{ background: STATUS.critical }} />
        {t('chart.pareto.bars')}: {d.count}
      </div>
      <div className="tip-row" style={{ marginTop: 2 }}>
        <span className="sw" style={{ background: CYAN }} />
        {t('chart.pareto.line')}: {d.cum}%
      </div>
    </div>
  )
}
