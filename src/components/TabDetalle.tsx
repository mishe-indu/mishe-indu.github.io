import { useState } from 'react'
import { useI18n } from '../i18n'
import { useAudit } from '../data/AuditContext'
import { statusColor, statusLabel } from '../data/kpi'

export function TabDetalle() {
  const { lang } = useI18n()
  const { dashboard } = useAudit()
  const [selected, setSelected] = useState<number | null>(null)

  if (!dashboard) return null

  const defs = dashboard.definitions
  const activeDef = selected !== null ? defs.find((d) => d.id === selected) : defs[0]

  if (!activeDef) return null

  const months = dashboard.data[activeDef.id] || []

  return (
    <div>
      <div className="kpi-selector">
        {defs.map((def) => (
          <button
            key={def.id}
            className={`kpi-sel-btn${activeDef.id === def.id ? ' active' : ''}`}
            onClick={() => setSelected(def.id)}
          >
            {def.name}
          </button>
        ))}
      </div>

      <div className="p">
        <div className="p-title">{activeDef.name}</div>
        <div className="detalle-meta">
          <div><strong>Perspectiva:</strong> {activeDef.perspective}</div>
          <div><strong>Objetivo:</strong> {activeDef.objective}</div>
          <div><strong>Frecuencia:</strong> {activeDef.frequency}</div>
          <div><strong>Responsable:</strong> {activeDef.responsible}</div>
        </div>

        <table className="detalle-table">
          <thead>
            <tr>
              <th>Período</th>
              <th>Resultado</th>
              <th>Meta</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {months.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>Sin datos</td></tr>
            )}
            {months.map((m, i) => {
              const c = statusColor(m.status)
              return (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{m.period}</td>
                  <td className="mono" style={{ color: m.result !== null ? c : 'var(--text-muted)' }}>
                    {m.result !== null ? `${Math.round(m.result * 100)}%` : '—'}
                  </td>
                  <td className="mono" style={{ color: 'var(--text-secondary)' }}>
                    {m.meta !== null ? `${Math.round(m.meta * 100)}%` : '—'}
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
