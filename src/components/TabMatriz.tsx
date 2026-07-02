import { useAudit } from '../data/AuditContext'
import { statusColor, statusLabel } from '../data/kpi'

export function TabMatriz() {
  const { dashboard } = useAudit()

  if (!dashboard) return null

  return (
    <div className="p" style={{ overflowX: 'auto' }}>
      <div className="p-title">MATRIZ INDICADORES CLAVES DE GESTIÓN PALESTRA COUTURE</div>
      <table className="matriz-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Perspectiva</th>
            <th>Objetivo</th>
            <th>Indicador</th>
            <th>Último resultado</th>
            <th>Frecuencia</th>
            <th>Criterios de evaluación</th>
            <th>Responsable</th>
          </tr>
        </thead>
        <tbody>
          {dashboard.definitions.map((def) => {
            const months = dashboard.data[def.id] || []
            const latest = months.filter((m) => m.result !== null).slice(-1)[0]
            const status = latest?.status ?? 'sin_datos'
            const c = statusColor(status)
            return (
              <tr key={def.id}>
                <td className="mono" style={{ color: 'var(--text-muted)' }}>{def.id}</td>
                <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{def.perspective}</td>
                <td style={{ fontSize: 12, maxWidth: 210, color: 'var(--text-secondary)' }}>{def.objective}</td>
                <td style={{ fontWeight: 700, minWidth: 150 }}>{def.name}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <span className="matriz-result">
                    <span className="matriz-semaforo" style={{ background: c, boxShadow: `0 0 8px ${c}66` }} />
                    <span className="mono" style={{ color: c, fontWeight: 700, fontSize: 15 }}>
                      {latest?.result != null ? `${Math.round(latest.result * 100)}%` : '—'}
                    </span>
                    <span className="badge-sm" style={{ background: `${c}1c`, color: c }}>
                      {statusLabel(status, 'es')}
                    </span>
                  </span>
                  {latest?.period && (
                    <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                      {latest.period}
                    </div>
                  )}
                </td>
                <td className="mono" style={{ fontSize: 11 }}>{def.frequency}</td>
                <td style={{ minWidth: 210 }}>
                  <div className="crit-stack">
                    <span className="crit-chip" style={{ borderColor: 'rgba(152,209,176,0.35)', color: 'var(--good)' }}>
                      <i style={{ background: 'var(--good)' }} /> {def.idealDesc}
                    </span>
                    {def.acceptableDesc && (
                      <span className="crit-chip" style={{ borderColor: 'rgba(240,180,41,0.35)', color: 'var(--warning)' }}>
                        <i style={{ background: 'var(--warning)' }} /> {def.acceptableDesc}
                      </span>
                    )}
                    <span className="crit-chip" style={{ borderColor: 'rgba(229,62,62,0.35)', color: 'var(--critical)' }}>
                      <i style={{ background: 'var(--critical)' }} /> {def.deficientDesc}
                    </span>
                  </div>
                </td>
                <td style={{ fontSize: 11.5, maxWidth: 150, color: 'var(--text-secondary)' }}>{def.responsible}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
