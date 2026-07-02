import { useState } from 'react'
import { useI18n } from '../i18n'
import { useAudit } from '../data/AuditContext'
import { statusColor, statusLabel } from '../data/kpi'
import { GaugeRing } from './GaugeRing'
import { ControlChart } from './ControlChart'

export function TabDetalle() {
  const { lang } = useI18n()
  const { dashboard } = useAudit()
  const [selected, setSelected] = useState<number | null>(null)

  if (!dashboard) return null

  const defs = dashboard.definitions
  const activeDef = selected !== null ? defs.find((d) => d.id === selected) : defs[0]
  if (!activeDef) return null

  const months = dashboard.data[activeDef.id] || []
  const withData = months.filter((m) => m.result !== null)
  const latest = withData.slice(-1)[0] ?? null
  const latestPct = latest?.result != null ? latest.result * 100 : null
  const status = latest?.status ?? 'sin_datos'
  const color = statusColor(status)
  const targetPct = Math.round(activeDef.idealThreshold * 100)

  const avg = withData.length
    ? Math.round((withData.reduce((s, m) => s + (m.result ?? 0), 0) / withData.length) * 100)
    : null
  const best = withData.length
    ? withData.reduce((a, b) => ((a.result ?? 0) >= (b.result ?? 0) ? a : b))
    : null
  const worst = withData.length
    ? withData.reduce((a, b) => ((a.result ?? 0) <= (b.result ?? 0) ? a : b))
    : null
  const inTarget = withData.filter((m) => m.status === 'ideal').length

  return (
    <div>
      <div className="kpi-selector">
        {defs.map((def) => {
          const ms = (dashboard.data[def.id] || []).filter((m) => m.result !== null)
          const st = ms.slice(-1)[0]?.status ?? 'sin_datos'
          return (
            <button
              key={def.id}
              className={`kpi-sel-btn${activeDef.id === def.id ? ' active' : ''}`}
              onClick={() => setSelected(def.id)}
            >
              <span className="sel-dot" style={{ background: statusColor(st) }} />
              {def.name}
            </button>
          )
        })}
      </div>

      {/* Ficha del indicador: gauge + carta de control */}
      <div className="detalle-hero">
        <div className="detalle-gauge">
          <GaugeRing
            value={latestPct}
            target={activeDef.invert ? null : targetPct}
            color={color}
            size={168}
            stroke={13}
            label={latest?.period ?? 'sin datos'}
          />
          <span className="badge-sm" style={{ background: `${color}20`, color }}>
            {statusLabel(status, lang)}
          </span>
          <div className="detalle-target mono">
            Meta: {activeDef.invert ? `≤ ${targetPct}%` : `≥ ${targetPct}%`}
          </div>
        </div>

        <div className="detalle-main">
          <div className="detalle-title-row">
            <div>
              <h3 className="detalle-name">{activeDef.name}</h3>
              <div className="detalle-sub">
                {activeDef.perspective} · {activeDef.frequency} · {activeDef.responsible}
              </div>
            </div>
          </div>

          <div className="stat-row">
            <div className="stat">
              <span className="stat-val mono" style={{ color }}>
                {latestPct !== null ? `${Math.round(latestPct)}%` : '—'}
              </span>
              <span className="stat-lbl">último</span>
            </div>
            <div className="stat">
              <span className="stat-val mono">{avg !== null ? `${avg}%` : '—'}</span>
              <span className="stat-lbl">promedio</span>
            </div>
            <div className="stat">
              <span className="stat-val mono" style={{ color: 'var(--good)' }}>
                {best?.result != null ? `${Math.round(best.result * 100)}%` : '—'}
              </span>
              <span className="stat-lbl">mejor ({best?.period ?? '—'})</span>
            </div>
            <div className="stat">
              <span className="stat-val mono" style={{ color: 'var(--critical)' }}>
                {worst?.result != null ? `${Math.round(worst.result * 100)}%` : '—'}
              </span>
              <span className="stat-lbl">peor ({worst?.period ?? '—'})</span>
            </div>
            <div className="stat">
              <span className="stat-val mono">
                {inTarget}/{withData.length || 0}
              </span>
              <span className="stat-lbl">meses en meta</span>
            </div>
          </div>

          <ControlChart def={activeDef} months={months} />
          <div className="control-legend mono">
            <span><i style={{ background: 'rgba(47,179,122,0.35)' }} /> zona ideal</span>
            <span><i style={{ background: 'rgba(224,165,63,0.35)' }} /> aceptable</span>
            <span><i style={{ background: 'rgba(229,72,77,0.3)' }} /> deficiente</span>
            <span><i className="dash" /> meta</span>
          </div>
        </div>
      </div>

      <div className="p">
        <div className="p-title">Registro mensual</div>
        <table className="detalle-table">
          <thead>
            <tr>
              <th>Período</th>
              <th>Resultado</th>
              <th>Meta</th>
              <th>Brecha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {months.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                  Sin datos
                </td>
              </tr>
            )}
            {months.map((m, i) => {
              const c = statusColor(m.status)
              const gap =
                m.result !== null && m.meta !== null
                  ? Math.round((m.result - m.meta) * 100)
                  : null
              return (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{m.period}</td>
                  <td className="mono" style={{ color: m.result !== null ? c : 'var(--text-muted)' }}>
                    {m.result !== null ? `${Math.round(m.result * 100)}%` : '—'}
                  </td>
                  <td className="mono" style={{ color: 'var(--text-secondary)' }}>
                    {m.meta !== null ? `${Math.round(m.meta * 100)}%` : '—'}
                  </td>
                  <td className="mono" style={{ color: gap === null ? 'var(--text-muted)' : gap >= 0 ? 'var(--good)' : 'var(--critical)' }}>
                    {gap === null ? '—' : `${gap > 0 ? '+' : ''}${gap} pts`}
                  </td>
                  <td>
                    <span className="badge-sm" style={{ background: `${c}20`, color: c }}>
                      {statusLabel(m.status, lang)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
