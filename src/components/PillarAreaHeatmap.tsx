import { useI18n } from '../i18n'
import { matrix } from '../data/compute'
import { AREAS, PILLARS } from '../data/audit'
import { seqColor } from '../theme'

export function PillarAreaHeatmap() {
  const { t, lang } = useI18n()
  const cells = matrix()
  const get = (pillar: string, area: string) =>
    cells.find((c) => c.pillar === pillar && c.area === area)!

  return (
    <div className="card">
      <div className="card-head">
        <h3>{t('chart.matrix')}</h3>
        <span className="hint">índice OK · celda</span>
      </div>
      <table className="heatmap">
        <thead>
          <tr>
            <th />
            {AREAS.map((a) => (
              <th key={a.id}>{lang === 'es' ? a.es : a.en}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PILLARS.map((p) => (
            <tr key={p.id}>
              <th title={p.jp}>
                <span className="mono" style={{ color: 'var(--amber)' }}>
                  {p.key}
                </span>{' '}
                {lang === 'es' ? p.es : p.en}
              </th>
              {AREAS.map((a) => {
                const cell = get(p.id, a.id)
                const idx = cell.tally.index
                const empty = cell.tally.total === 0
                return (
                  <td key={a.id} style={{ padding: 2 }}>
                    <div
                      className={`cell${empty ? ' empty' : ''}`}
                      style={{ background: empty ? undefined : seqColor(idx) }}
                      title={
                        empty
                          ? '—'
                          : `${cell.tally.si}/${cell.tally.total} ${t('resp.si')}`
                      }
                    >
                      {empty ? '·' : `${Math.round((idx ?? 0) * 100)}%`}
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
        <span className="heat-scale" />
        <span>100%</span>
        <span style={{ marginLeft: 'auto' }}>· = sin ítems en esa combinación</span>
      </div>
    </div>
  )
}
