import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useI18n } from '../i18n'
import { byPillar } from '../data/compute'
import { AMBER, GRID, TEXT_SECONDARY, TEXT_MUTED, STATUS } from '../theme'
import { band } from '../data/compute'

export function RadarPillars() {
  const { t, lang } = useI18n()
  const rows = byPillar()
  const data = rows.map((r) => ({
    key: r.key,
    label: lang === 'es' ? r.es : r.en,
    jp: r.jp,
    value: r.tally.index === null ? 0 : Math.round(r.tally.index * 100),
    tally: r.tally,
  }))

  return (
    <div className="card">
      <div className="card-head">
        <h3>{t('chart.radar')}</h3>
        <span className="hint">{t('legend.axis')}</span>
      </div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke={GRID} />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fill: TEXT_SECONDARY, fontSize: 12, fontFamily: 'IBM Plex Mono' }}
            />
            <PolarRadiusAxis
              domain={[0, 100]}
              tickCount={5}
              tick={{ fill: TEXT_MUTED, fontSize: 9 }}
              stroke={GRID}
              axisLine={false}
            />
            <Radar
              name={t('chart.radar.series')}
              dataKey="value"
              stroke={AMBER}
              fill={AMBER}
              fillOpacity={0.22}
              strokeWidth={2}
              dot={{ r: 3, fill: AMBER, stroke: AMBER }}
              isAnimationActive={false}
            />
            <Tooltip content={<RadarTip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function RadarTip({ active, payload }: any) {
  const { t } = useI18n()
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const b = band(d.tally.index)
  return (
    <div className="viz-tip">
      <div className="tip-title">
        {d.key} · {d.label} <span style={{ color: TEXT_MUTED }}>({d.jp})</span>
      </div>
      <div className="tip-row">
        <span className="sw" style={{ background: STATUS[b] }} />
        {t('chart.radar.series')}: {d.value}%
      </div>
      <div className="tip-row" style={{ marginTop: 2 }}>
        {d.tally.si}/{d.tally.total} {t('resp.si')} · {d.tally.no} {t('resp.no')}
      </div>
    </div>
  )
}
