import { useMemo } from 'react'
import { useI18n } from '../i18n'
import { useAudit } from '../data/AuditContext'
import { statusColor, statusLabel, type KpiStatus, type KpiDefinition, type KpiMonthData } from '../data/kpi'

// Orden de atención: lo deficiente primero, lo ideal al final.
const SEVERITY: Record<KpiStatus, number> = { deficient: 0, sin_datos: 1, acceptable: 2, ideal: 3 }

interface Row {
  def: KpiDefinition
  latest: KpiMonthData | null
  trend: number | null
}

function initials(name: string): string {
  return name
    .replace(/\(.*?\)/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

/** Lectura interpretativa derivada de los datos (no texto fijo). */
function reading(row: Row, lang: 'es' | 'en'): string {
  const es = lang === 'es'
  const { def, latest, trend } = row
  if (!latest || latest.result === null) {
    return es ? 'Sin datos cargados para este período.' : 'No data loaded for this period.'
  }
  const r = latest.result
  const idealPct = Math.round(def.idealThreshold * 100)
  const valPct = Math.round(r * 100)
  const gap = Math.round(Math.abs(def.idealThreshold - r) * 100)
  const trDown = trend !== null && trend < 0
  const trPct = trend !== null ? Math.round(Math.abs(trend * 100)) : null

  if (def.invert) {
    if (latest.status === 'ideal') {
      return es ? `Incidencia ${valPct}%, dentro de la meta de ${idealPct}%.` : `Incidence ${valPct}%, within the ${idealPct}% target.`
    }
    return es
      ? `Incidencia del ${valPct}% frente a la meta de ${idealPct}%. Riesgo crítico: requiere acción inmediata.`
      : `Incidence ${valPct}% against the ${idealPct}% target. Critical risk: needs immediate action.`
  }
  if (latest.status === 'deficient') {
    return es
      ? `A ${gap} puntos de la meta (${idealPct}%), por debajo del rango aceptable.`
      : `${gap} points below the ${idealPct}% target, under the acceptable range.`
  }
  if (latest.status === 'acceptable') {
    return es
      ? `A ${gap} puntos del objetivo (${idealPct}%): dentro de rango, sin holgura.`
      : `${gap} points from the ${idealPct}% goal: within range, no margin.`
  }
  // ideal
  let base = es ? `Supera la meta de ${idealPct}%.` : `Above the ${idealPct}% target.`
  if (trPct !== null && trDown) {
    base += es
      ? ` Cae ${trPct}% frente al mes anterior; vigilar la desaceleración.`
      : ` Down ${trPct}% versus last month; watch the slowdown.`
  }
  return base
}

export function ExecutiveSummary() {
  const { lang } = useI18n()
  const { dashboard } = useAudit()

  const { rows, dist, period, total } = useMemo(() => {
    if (!dashboard) return { rows: [] as Row[], dist: {} as Record<KpiStatus, number>, period: '', total: 0 }
    const rows: Row[] = dashboard.definitions.map((def) => {
      const months = dashboard.data[def.id] || []
      const withData = months.filter((m) => m.result !== null)
      const latest = withData.slice(-1)[0] ?? null
      const trend = withData.length >= 2 ? withData[withData.length - 1].result! - withData[0].result! : null
      return { def, latest, trend }
    })
    rows.sort((a, b) => {
      const sa = SEVERITY[a.latest?.status ?? 'sin_datos']
      const sb = SEVERITY[b.latest?.status ?? 'sin_datos']
      if (sa !== sb) return sa - sb
      // dentro del mismo estado, mayor brecha contra la meta primero
      const ga = a.latest?.result != null ? Math.abs(a.def.idealThreshold - a.latest.result) : 0
      const gb = b.latest?.result != null ? Math.abs(b.def.idealThreshold - b.latest.result) : 0
      return gb - ga
    })
    const dist: Record<KpiStatus, number> = { ideal: 0, acceptable: 0, deficient: 0, sin_datos: 0 }
    for (const r of rows) dist[r.latest?.status ?? 'sin_datos']++
    const period = rows.map((r) => r.latest?.period).find(Boolean) ?? ''
    return { rows, dist, period, total: rows.length }
  }, [dashboard])

  if (!dashboard || rows.length === 0) return null

  const needAction = dist.deficient
  const onTrack = dist.ideal + dist.acceptable
  const segOrder: KpiStatus[] = ['deficient', 'acceptable', 'ideal', 'sin_datos']
  const segs = segOrder.map((status) => ({ status, n: dist[status] })).filter((s) => s.n > 0)

  return (
    <section className="exec" aria-label={lang === 'es' ? 'Resumen ejecutivo' : 'Executive summary'}>
      <div className="exec-head">
        <div className="exec-title">
          <h2>{lang === 'es' ? 'Resumen ejecutivo' : 'Executive summary'}</h2>
          <span className="exec-period">
            {period}
            <span className="exec-sep">·</span>
            {lang === 'es' ? 'priorizado por severidad' : 'ranked by severity'}
          </span>
        </div>
        <div className="exec-verdict">
          <div className="exec-dist" role="img" aria-label={`${needAction} ${lang === 'es' ? 'requieren acción' : 'need action'}, ${onTrack} ${lang === 'es' ? 'en rango' : 'on track'}`}>
            {segs.map((s) => (
              <span
                key={s.status}
                className="exec-dist-seg"
                style={{ flexGrow: s.n, background: statusColor(s.status) }}
              />
            ))}
          </div>
          <div className="exec-verdict-line">
            <strong style={{ color: needAction ? 'var(--critical)' : 'var(--good)' }}>{needAction}</strong>
            <span>{lang === 'es' ? `de ${total} requieren acción` : `of ${total} need action`}</span>
            <span className="exec-dot">·</span>
            <strong style={{ color: 'var(--good)' }}>{onTrack}</strong>
            <span>{lang === 'es' ? 'en rango' : 'on track'}</span>
          </div>
        </div>
      </div>

      <ol className="exec-list">
        {rows.map((row, i) => {
          const status = row.latest?.status ?? 'sin_datos'
          const color = statusColor(status)
          const r = row.latest?.result ?? null
          const valPct = r === null ? null : Math.round(r * 100)
          const target = Math.min(100, Math.max(0, Math.round(row.def.idealThreshold * 100)))
          const fill = valPct === null ? 0 : Math.min(100, Math.max(2, valPct))
          const trDown = row.trend !== null && row.trend < 0
          const trPct = row.trend !== null ? Math.round(Math.abs(row.trend * 100)) : null
          return (
            <li
              className="exec-row"
              key={row.def.id}
              style={{ ['--sc' as string]: color, animationDelay: `${i * 60}ms` }}
            >
              <div className="exec-rank" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </div>

              <div className="exec-glyph" style={{ background: `${color}1f`, color }}>
                <span className="exec-glyph-dot" style={{ background: color }} />
              </div>

              <div className="exec-body">
                <div className="exec-line1">
                  <span className="exec-name">{row.def.name}</span>
                  <span className="exec-persp">{row.def.perspective}</span>
                  <span className="exec-status" style={{ color }}>
                    {statusLabel(status, lang)}
                  </span>
                </div>
                <p className="exec-reading">{reading(row, lang)}</p>
              </div>

              <div className="exec-metric">
                <div className="exec-value" style={{ color }}>
                  {valPct === null ? '—' : `${valPct}%`}
                  {trPct !== null && (
                    <span className={`exec-trend ${trDown ? 'down' : 'up'}`}>
                      {trDown ? '↓' : '↑'}
                      {trPct}%
                    </span>
                  )}
                </div>
                <div className="exec-meter" title={`${valPct ?? '—'}% / meta ${target}%`}>
                  <span className="exec-meter-fill" style={{ transform: `scaleX(${fill / 100})`, background: color }} />
                  <span className="exec-meter-target" style={{ left: `${target}%` }} />
                </div>
              </div>

              <div className="exec-owner" title={row.def.responsible}>
                <span className="exec-avatar">{initials(row.def.responsible) || '—'}</span>
                <span className="exec-owner-name">{row.def.responsible.replace(/\s*\(.*?\)\s*/g, '').trim()}</span>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
