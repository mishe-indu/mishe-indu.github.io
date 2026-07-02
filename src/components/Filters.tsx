import { useI18n } from '../i18n'
import { AREAS, PILLARS, type AreaId, type PillarId, type Response } from '../data/audit'
import { AREA_COLOR, STATUS } from '../theme'
import type { Filters as F } from '../data/compute'

interface Props {
  filters: F
  setFilters: (f: F) => void
}

const RESPONSES: { id: Response; color: string }[] = [
  { id: 'si', color: STATUS.good },
  { id: 'no', color: STATUS.critical },
  { id: 'na', color: '#71736c' },
]

export function Filters({ filters, setFilters }: Props) {
  const { t } = useI18n()

  function toggle<T>(set: Set<T>, v: T): Set<T> {
    const next = new Set(set)
    next.has(v) ? next.delete(v) : next.add(v)
    return next
  }

  const active =
    filters.areas.size + filters.pillars.size + filters.responses.size

  return (
    <div className="filters" role="region" aria-label={t('filters.title')}>
      <div className="filter-group">
        <span className="glabel">{t('filters.area')}</span>
        {AREAS.map((a) => (
          <button
            key={a.id}
            className="chip"
            data-active={filters.areas.has(a.id)}
            onClick={() => setFilters({ ...filters, areas: toggle(filters.areas, a.id as AreaId) })}
          >
            <span className="dot" style={{ background: AREA_COLOR[a.id] }} />
            {a.es}
          </button>
        ))}
      </div>

      <div className="filter-group">
        <span className="glabel">{t('filters.pillar')}</span>
        {PILLARS.map((p) => (
          <button
            key={p.id}
            className="chip"
            data-active={filters.pillars.has(p.id)}
            onClick={() =>
              setFilters({ ...filters, pillars: toggle(filters.pillars, p.id as PillarId) })
            }
            title={p.jp}
          >
            {p.key}
          </button>
        ))}
      </div>

      <div className="filter-group">
        <span className="glabel">{t('filters.response')}</span>
        {RESPONSES.map((r) => (
          <button
            key={r.id}
            className="chip"
            data-active={filters.responses.has(r.id)}
            onClick={() =>
              setFilters({ ...filters, responses: toggle(filters.responses, r.id) })
            }
          >
            <span className="dot" style={{ background: r.color }} />
            {t(`resp.${r.id}`)}
          </button>
        ))}
      </div>

      {active > 0 && (
        <button
          className="filter-clear"
          onClick={() =>
            setFilters({ areas: new Set(), pillars: new Set(), responses: new Set() })
          }
        >
          {t('filters.clear')} ({active} {t('filters.active')})
        </button>
      )}
    </div>
  )
}
