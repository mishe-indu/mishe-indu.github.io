import { useAudit } from '../data/AuditContext'
import { statusColor } from '../data/kpi'

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
            <th>Unidad</th>
            <th>Frecuencia</th>
            <th>Ideal</th>
            <th>Aceptable</th>
            <th>Deficiente</th>
            <th>Responsable</th>
          </tr>
        </thead>
        <tbody>
          {dashboard.definitions.map((def) => {
            const months = dashboard.data[def.id] || []
            const latest = months.filter((m) => m.result !== null).slice(-1)[0]
            const status = latest?.status ?? 'sin_datos'
            return (
              <tr key={def.id}>
                <td className="mono" style={{ color: 'var(--text-muted)' }}>{def.id}</td>
                <td style={{ fontWeight: 600 }}>{def.perspective}</td>
                <td style={{ fontSize: 12, maxWidth: 200 }}>{def.objective}</td>
                <td style={{ fontWeight: 700, color: statusColor(status) }}>{def.name}</td>
                <td>{def.unit}</td>
                <td>{def.frequency}</td>
                <td style={{ color: '#98d1b0', fontSize: 12 }}>{def.idealDesc}</td>
                <td style={{ color: '#f0b429', fontSize: 12 }}>{def.acceptableDesc}</td>
                <td style={{ color: '#e53e3e', fontSize: 12 }}>{def.deficientDesc}</td>
                <td style={{ fontSize: 11, maxWidth: 160 }}>{def.responsible}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
