import { useAudit } from '../data/AuditContext'
import { statusColor } from '../data/kpi'

export function TabComparar() {
  const { dashboard, history } = useAudit()

  if (!dashboard) return null

  const all = [dashboard, ...history.slice(-5).reverse().map((h) => h.dashboard)]

  if (all.length < 2) {
    return (
      <div className="p-empty">
        <div className="p-empty-icon">📂</div>
        <div className="p-empty-title">Solo hay una matriz cargada</div>
        <div className="p-empty-sub" style={{ maxWidth: 400, margin: '8px auto 0' }}>
          Carga múltiples archivos MATRIZ DE INDICADORES para comparar la evolución de los KPIs.
        </div>
      </div>
    )
  }

  return (
    <div className="p" style={{ overflowX: 'auto' }}>
      <div className="p-title">Comparativa de KPIs</div>
      <table className="compare-table">
        <thead>
          <tr>
            <th>Indicador</th>
            {all.map((d, i) => (
              <th key={i} className="compare-th">{d.meta.date || `#${i + 1}`}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dashboard.definitions.map((def) => {
            return (
              <tr key={def.id}>
                <td style={{ fontWeight: 600 }}>{def.name}</td>
                {all.map((d, i) => {
                  const months = d.data[def.id] || []
                  const latest = months.filter((m) => m.result !== null).slice(-1)[0]
                  const status = latest?.status ?? 'sin_datos'
                  const val = latest?.result
                  return (
                    <td key={i} className="compare-td" style={{ color: statusColor(status) }}>
                      {val !== null ? `${Math.round(val * 100)}%` : '—'}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
