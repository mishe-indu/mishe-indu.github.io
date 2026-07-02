import { useMemo } from 'react'
import { useI18n } from '../i18n'
import { useAudit } from '../data/AuditContext'
import { statusColor, statusLabel } from '../data/kpi'
import { ExecutiveSummary } from './ExecutiveSummary'

export function TabResumen() {
  const { lang } = useI18n()
  const { dashboard } = useAudit()

  const cards = useMemo(() => {
    if (!dashboard) return []
    return dashboard.definitions.map((def) => {
      const months = dashboard.data[def.id] || []
      const latest = months.filter((m) => m.result !== null).slice(-1)[0] ?? null
      const allResults = months.filter((m) => m.result !== null)
      const trend = allResults.length >= 2
        ? allResults[allResults.length - 1].result! - allResults[0].result!
        : null
      return { def, latest, months, trend }
    })
  }, [dashboard])

  if (!dashboard) return null

  return (
    <div>
      <ExecutiveSummary />
      <div className="kpi-grid">
        {cards.map(({ def, latest, months, trend }) => {
          const status = latest?.status ?? 'sin_datos'
          const color = statusColor(status)
          const val = latest?.result
          return (
            <div key={def.id} className="kpi-card" style={{ borderTopColor: color }}>
              <div className="kpi-perspective">{def.perspective}</div>
              <div className="kpi-name">{def.name}</div>
              <div className="kpi-value" style={{ color }}>
                {val !== null ? def.unit === '%' ? `${Math.round(val * 100)}%` : `${val}${def.unit}` : '—'}
              </div>
              <div className="kpi-meta-line">
                <span className="kpi-badge" style={{ background: `${color}20`, color }}>
                  {statusLabel(status, lang)}
                </span>
                {trend !== null && (
                  <span className="kpi-trend" style={{ color: trend >= 0 ? 'var(--good)' : 'var(--critical)' }}>
                    {trend >= 0 ? '↑' : '↓'} {Math.abs(Math.round(trend * 100))}%
                  </span>
                )}
              </div>
              {latest?.period && <div className="kpi-period">{latest.period}</div>}
              <div className="kpi-bars">
                {months.filter((m) => m.result !== null).slice(-6).map((m, i) => {
                  const h = def.unit === '%' ? (m.result ?? 0) * 100 : Math.min(100, (m.result ?? 0) / (def.idealThreshold || 1) * 100)
                  return (
                    <div key={i} className="kpi-bar-item" title={`${m.period}: ${m.result !== null ? Math.round(m.result * 100) : '—'}%`}>
                      <div className="kpi-bar-track">
                        <div className="kpi-bar-fill" style={{ height: `${Math.min(100, h)}%`, background: statusColor(m.status) }} />
                      </div>
                      <div className="kpi-bar-label">{m.period.slice(0, 3)}</div>
                    </div>
                  )
                })}
              </div>
              <div className="kpi-responsible">{def.responsible}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
