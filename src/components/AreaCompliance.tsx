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
import { useI18n } from '../i18n'
import { byArea, type Band } from '../data/compute'
import { STATUS, STATUS_ICON, GRID, AXIS, TEXT_SECONDARY, TEXT_PRIMARY } from '../theme'

export function AreaCompliance() {
  const { t, lang } = useI18n()
  const rows = byArea()
    .filter((r) => r.tally.total > 0)
    .sort((a, b) => (b.tally.index ?? 0) - (a.tally.index ?? 0))
  const data = rows.map((r) => ({
    name: lang === 'es' ? r.es : r.en,
    value: r.tally.index === null ? 0 : Math.round(r.tally.index * 100),
    band: r.tally.band,
    tally: r.tally,
  }))

  return (
    <div className="card">
      <div className="card-head">
        <h3>{t('chart.area')}</h3>
        <span className="hint">{t('legend.axis')}</span>
      </div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 44, bottom: 4, left: 8 }}
            barCategoryGap="28%"
          >
            <CartesianGrid horizontal={false} stroke={GRID} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: TEXT_SECONDARY, fontSize: 11, fontFamily: 'IBM Plex Mono' }}
              axisLine={{ stroke: AXIS }}
              tickLine={false}
              unit="%"
            />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tick={{ fill: TEXT_PRIMARY, fontSize: 12.5 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<AreaTip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={26} isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell key={i} fill={STATUS[d.band]} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                formatter={(v: number) => `${v}%`}
                style={{ fill: TEXT_PRIMARY, fontSize: 12, fontFamily: 'IBM Plex Mono', fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function AreaTip({ active, payload }: any) {
  const { t } = useI18n()
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const b = d.band as Band
  return (
    <div className="viz-tip">
      <div className="tip-title">{d.name}</div>
      <div className="tip-row">
        <span className="sw" style={{ background: STATUS[b] }} />
        {STATUS_ICON[b]} {t(`band.${b}`)} — {d.value}%
      </div>
      <div className="tip-row" style={{ marginTop: 2 }}>
        {d.tally.si} {t('resp.si')} · {d.tally.no} {t('resp.no')} · {d.tally.na} {t('resp.na')}
      </div>
    </div>
  )
}
