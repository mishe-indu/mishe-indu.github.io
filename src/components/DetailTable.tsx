import { useMemo } from 'react'
import { useI18n } from '../i18n'
import { AUDIT_ITEMS, AREAS, PILLARS, type Response } from '../data/audit'
import { applyFilters, type Filters as F } from '../data/compute'
import { AREA_COLOR, STATUS, STATUS_ICON } from '../theme'

const RESP_BAND: Record<Response, 'good' | 'critical' | 'warning'> = {
  si: 'good',
  no: 'critical',
  na: 'warning',
}

export function DetailTable({ filters }: { filters: F }) {
  const { t, lang } = useI18n()
  const rows = useMemo(() => applyFilters(AUDIT_ITEMS, filters), [filters])

  const areaLabel = (id: string) => {
    const a = AREAS.find((x) => x.id === id)!
    return lang === 'es' ? a.es : a.en
  }
  const pillar = (id: string) => PILLARS.find((x) => x.id === id)!

  return (
    <div className="table-wrap">
      <table className="detail">
        <thead>
          <tr>
            <th>{t('table.id')}</th>
            <th>{t('table.area')}</th>
            <th>{t('table.pillar')}</th>
            <th>{t('table.question')}</th>
            <th>{t('table.response')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const b = RESP_BAND[r.response]
            const p = pillar(r.pillar)
            return (
              <tr key={r.id}>
                <td className="num">{String(r.id).padStart(2, '0')}</td>
                <td>
                  <span className="pill-area">
                    <span className="dot" style={{ background: AREA_COLOR[r.area] }} />
                    {areaLabel(r.area)}
                  </span>
                </td>
                <td>
                  <span className="pill-pillar" title={p.jp}>
                    {p.key} · {lang === 'es' ? p.es : p.en}
                  </span>
                </td>
                <td className="q">{r.question}</td>
                <td>
                  <span className={`badge ${b}`}>
                    <span className="ic">{STATUS_ICON[b]}</span>
                    {t(`resp.${r.response}`)}
                  </span>
                </td>
              </tr>
            )
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                — sin resultados para los filtros seleccionados —
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="table-foot">
        {t('table.showing')} <span style={{ color: STATUS.good }}>{rows.length}</span>{' '}
        {t('table.of')} {AUDIT_ITEMS.length}
      </div>
    </div>
  )
}
