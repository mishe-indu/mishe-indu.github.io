// ============================================================================
//  Cálculos derivados de la auditoría. Puro: no toca el DOM ni React.
//  Todo se recalcula a partir de AUDIT_ITEMS + AUDIT_META.
// ============================================================================
import {
  AUDIT_ITEMS,
  AUDIT_META,
  AREAS,
  PILLARS,
  type AreaId,
  type PillarId,
  type AuditItem,
} from './audit'

export type Band = 'good' | 'warning' | 'critical'

export interface Tally {
  total: number
  si: number
  no: number
  na: number
  /** Índice OK = si / (total − na); null si no hay ítems evaluables. */
  index: number | null
  band: Band
}

export function band(index: number | null): Band {
  if (index === null) return 'critical'
  if (index >= AUDIT_META.standardGreen) return 'good'
  if (index >= AUDIT_META.standardYellow) return 'warning'
  return 'critical'
}

export function tally(items: AuditItem[]): Tally {
  const si = items.filter((i) => i.response === 'si').length
  const no = items.filter((i) => i.response === 'no').length
  const na = items.filter((i) => i.response === 'na').length
  const total = items.length
  const denom = total - na
  const index = denom > 0 ? si / denom : null
  return { total, si, no, na, index, band: band(index) }
}

export interface Filters {
  areas: Set<AreaId>
  pillars: Set<PillarId>
  responses: Set<'si' | 'no' | 'na'>
}

export function emptyFilters(): Filters {
  return { areas: new Set(), pillars: new Set(), responses: new Set() }
}

export function applyFilters(items: AuditItem[], f: Filters): AuditItem[] {
  return items.filter(
    (i) =>
      (f.areas.size === 0 || f.areas.has(i.area)) &&
      (f.pillars.size === 0 || f.pillars.has(i.pillar)) &&
      (f.responses.size === 0 || f.responses.has(i.response)),
  )
}

export interface AreaRow {
  id: AreaId
  es: string
  en: string
  tally: Tally
}

export function byArea(items: AuditItem[] = AUDIT_ITEMS): AreaRow[] {
  return AREAS.map((a) => ({
    id: a.id,
    es: a.es,
    en: a.en,
    tally: tally(items.filter((i) => i.area === a.id)),
  }))
}

export interface PillarRow {
  id: PillarId
  key: string
  es: string
  en: string
  jp: string
  tally: Tally
}

export function byPillar(items: AuditItem[] = AUDIT_ITEMS): PillarRow[] {
  return PILLARS.map((p) => ({
    id: p.id,
    key: p.key,
    es: p.es,
    en: p.en,
    jp: p.jp,
    tally: tally(items.filter((i) => i.pillar === p.id)),
  }))
}

/** Matriz pilar × área con el índice OK de cada celda (para el heatmap). */
export interface MatrixCell {
  pillar: PillarId
  area: AreaId
  tally: Tally
}

export function matrix(items: AuditItem[] = AUDIT_ITEMS): MatrixCell[] {
  const cells: MatrixCell[] = []
  for (const p of PILLARS) {
    for (const a of AREAS) {
      cells.push({
        pillar: p.id,
        area: a.id,
        tally: tally(items.filter((i) => i.pillar === p.id && i.area === a.id)),
      })
    }
  }
  return cells
}

/** Pareto de no conformidades por área: barras (conteo No) + % acumulado. */
export interface ParetoRow {
  id: AreaId
  es: string
  en: string
  count: number
  cumulativePct: number
}

export function paretoByArea(items: AuditItem[] = AUDIT_ITEMS): ParetoRow[] {
  const counts = AREAS.map((a) => ({
    id: a.id,
    es: a.es,
    en: a.en,
    count: items.filter((i) => i.area === a.id && i.response === 'no').length,
  })).sort((x, y) => y.count - x.count)

  const totalNo = counts.reduce((s, c) => s + c.count, 0) || 1
  let running = 0
  return counts.map((c) => {
    running += c.count
    return { ...c, cumulativePct: (running / totalNo) * 100 }
  })
}

export interface Summary {
  global: Tally
  areasEvaluated: number
  areasApproved: number // banda verde
  nonConformities: number
}

export function summary(items: AuditItem[] = AUDIT_ITEMS): Summary {
  const rows = byArea(items)
  return {
    global: tally(items),
    areasEvaluated: rows.filter((r) => r.tally.total > 0).length,
    areasApproved: rows.filter((r) => r.tally.band === 'good').length,
    nonConformities: items.filter((i) => i.response === 'no').length,
  }
}

export const pct = (v: number | null): string =>
  v === null ? '—' : `${Math.round(v * 100)}%`
