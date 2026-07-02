import { pillarAreaMatrix, heatColor } from '../../data/fiveS'

export function HeatmapPilarArea() {
  const rows = pillarAreaMatrix()
  const areas = rows[0].cells.map((c) => c.area)
  return (
    <div className="panel">
      <div className="panel-head">
        <h3 className="panel-title">Matriz pilar × área</h3>
        <span className="panel-hint">índice OK · celda</span>
      </div>
      <table className="heatmap">
        <thead>
          <tr>
            <th />
            {areas.map((a) => (
              <th key={a.id}>{a.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ pillar, cells }) => (
            <tr key={pillar.id}>
              <th title={pillar.jp}>
                <span className="mono" style={{ color: 'var(--warning)' }}>
                  {pillar.key}
                </span>{' '}
                {pillar.label}
              </th>
              {cells.map(({ area, t }) => {
                const pct = t.index === null ? null : Math.round(t.index * 100)
                const empty = t.total === 0
                return (
                  <td key={area.id} style={{ padding: 2 }}>
                    <div
                      className={`cell${empty ? ' empty' : ''}`}
                      style={{ background: empty ? undefined : heatColor(pct) }}
                      title={empty ? '—' : `${t.si}/${t.total} Sí`}
                    >
                      {empty ? '·' : `${pct}%`}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="heat-legend">
        <span>0%</span>
        <span className="heat-scale" style={{ background: 'linear-gradient(90deg,#24344c,#2f6fd6)' }} />
        <span>100%</span>
        <span style={{ marginLeft: 'auto' }}>· = sin ítems</span>
      </div>
    </div>
  )
}
