import { useMemo } from 'react'
import { useI18n } from '../i18n'
import { useAudit } from '../data/AuditContext'
import { byArea, summary } from '../data/compute'
import { AREAS } from '../data/audit'
import { STATUS, AREA_COLOR } from '../theme'

export function TabComparar() {
  const { t, lang } = useI18n()
  const { items, meta, history } = useAudit()

  const current = useMemo(
    () => ({
      id: 'actual',
      label: `${meta.company} · ${meta.date}`,
      meta,
      items,
      summary: summary(items),
      areas: byArea(items),
    }),
    [items, meta],
  )

  const snapshots = useMemo(() => {
    const list = history.slice(-9).reverse()
    return list.map((h) => ({
      id: h.id,
      label: `${h.meta.company} · ${h.meta.date}`,
      meta: h.meta,
      items: h.items,
      summary: summary(h.items),
      areas: byArea(h.items),
    }))
  }, [history])

  const all = [current, ...snapshots]

  if (snapshots.length === 0) {
    return (
      <div className="p-empty">
        <div className="p-empty-icon">📂</div>
        <div className="p-empty-title">{t('compare.none')}</div>
        <div className="p-empty-sub">{t('compare.none_hint')}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="compare-kpis">
        {all.map((s) => {
          const idx = s.summary.global.index
          const band = idx !== null ? (idx >= 0.85 ? 'good' : idx >= 0.7 ? 'warning' : 'critical') : 'critical'
          return (
            <div key={s.id} className="compare-card" style={{ borderTopColor: STATUS[band] }}>
              <div className="compare-label">{s.meta.date}</div>
              <div className="compare-value" style={{ color: STATUS[band] }}>
                {idx !== null ? `${Math.round(idx * 100)}%` : '—'}
              </div>
              <div className="compare-sub">{s.meta.responsible}</div>
              <div className="compare-items">{s.items.length} ítems</div>
            </div>
          )
        })}
      </div>

      <div className="p">
        <div className="p-title">{t('compare.table')}</div>
        <table className="compare-table">
          <thead>
            <tr>
              <th>{t('table.area')}</th>
              {all.map((s) => (
                <th key={s.id} className="compare-th">{s.meta.date}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AREAS.map((area) => {
              const name = lang === 'es' ? area.es : area.en
              return (
                <tr key={area.id}>
                  <td style={{ fontWeight: 600 }}>
                    <span className="dot-inline" style={{ background: AREA_COLOR[area.id] }} />
                    {name}
                  </td>
                  {all.map((s) => {
                    const row = s.areas.find((a) => a.id === area.id)
                    const idx = row?.tally.index ?? null
                    const c = idx !== null ? (idx >= 0.85 ? STATUS.good : idx >= 0.7 ? STATUS.warning : STATUS.critical) : STATUS.critical
                    return (
                      <td key={s.id} className="compare-td" style={{ color: c }}>
                        {idx !== null ? `${Math.round(idx * 100)}%` : '—'}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            <tr className="compare-total">
              <td style={{ fontWeight: 800 }}>TOTAL</td>
              {all.map((s) => {
                const idx = s.summary.global.index
                const c = idx !== null ? (idx >= 0.85 ? STATUS.good : idx >= 0.7 ? STATUS.warning : STATUS.critical) : STATUS.critical
                return (
                  <td key={s.id} className="compare-td" style={{ color: c, fontWeight: 800 }}>
                    {idx !== null ? `${Math.round(idx * 100)}%` : '—'}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
