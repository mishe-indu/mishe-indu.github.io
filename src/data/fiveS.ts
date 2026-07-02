// ============================================================================
//  Datos de la auditoría 5S (5S PALESTRA COUTURE.xlsx) — desglose por pilar y
//  área que alimenta los 4 paneles del "Análisis 5S".
//
//  Estos datos NO vienen del MATRIZ (ahí el 5S es un único valor, 62.5%). Son
//  la auditoría detallada. Para actualizar, editá AUDIT_5S: cada ítem lleva su
//  área, su pilar y la respuesta ('si' | 'no' | 'na'). Todo lo demás se calcula.
//     Índice OK = Sí / (Total − N/A)
// ============================================================================
export type Resp = 'si' | 'no' | 'na'
export type AreaId = 'corte' | 'confeccion' | 'bodega' | 'general'
export type PillarId = 'seiri' | 'seiton' | 'seiso' | 'seiketsu' | 'shitsuke'

export const AREAS_5S: { id: AreaId; label: string }[] = [
  { id: 'corte', label: 'Corte y Patronaje' },
  { id: 'confeccion', label: 'Confección' },
  { id: 'bodega', label: 'Bodega' },
  { id: 'general', label: 'General' },
]

export const PILLARS_5S: { id: PillarId; key: string; label: string; jp: string }[] = [
  { id: 'seiri', key: '1S', label: 'Clasificar', jp: 'Seiri' },
  { id: 'seiton', key: '2S', label: 'Ordenar', jp: 'Seiton' },
  { id: 'seiso', key: '3S', label: 'Limpieza', jp: 'Seiso' },
  { id: 'seiketsu', key: '4S', label: 'Estandarizar', jp: 'Seiketsu' },
  { id: 'shitsuke', key: '5S', label: 'Disciplina', jp: 'Shitsuke' },
]

interface Item {
  area: AreaId
  pillar: PillarId
  response: Resp
}

export const AUDIT_5S: Item[] = [
  // Corte y Patronaje
  { area: 'corte', pillar: 'seiri', response: 'si' },
  { area: 'corte', pillar: 'seiton', response: 'no' },
  { area: 'corte', pillar: 'seiton', response: 'si' },
  { area: 'corte', pillar: 'seiso', response: 'si' },
  { area: 'corte', pillar: 'seiso', response: 'si' },
  { area: 'corte', pillar: 'seiton', response: 'si' },
  { area: 'corte', pillar: 'seiketsu', response: 'si' },
  { area: 'corte', pillar: 'shitsuke', response: 'si' },
  // Confección
  { area: 'confeccion', pillar: 'seiri', response: 'si' },
  { area: 'confeccion', pillar: 'seiton', response: 'no' },
  { area: 'confeccion', pillar: 'seiton', response: 'si' },
  { area: 'confeccion', pillar: 'seiso', response: 'si' },
  { area: 'confeccion', pillar: 'seiton', response: 'si' },
  { area: 'confeccion', pillar: 'shitsuke', response: 'si' },
  // Bodega
  { area: 'bodega', pillar: 'seiton', response: 'si' },
  { area: 'bodega', pillar: 'seiso', response: 'no' },
  { area: 'bodega', pillar: 'seiri', response: 'no' },
  { area: 'bodega', pillar: 'seiketsu', response: 'si' },
  { area: 'bodega', pillar: 'seiri', response: 'no' },
  // General
  { area: 'general', pillar: 'seiton', response: 'si' },
  { area: 'general', pillar: 'seiso', response: 'si' },
  { area: 'general', pillar: 'seiketsu', response: 'no' },
  { area: 'general', pillar: 'seiso', response: 'no' },
  { area: 'general', pillar: 'shitsuke', response: 'si' },
  { area: 'general', pillar: 'shitsuke', response: 'no' },
  { area: 'general', pillar: 'seiketsu', response: 'no' },
  { area: 'general', pillar: 'shitsuke', response: 'no' },
  { area: 'general', pillar: 'seiketsu', response: 'no' },
  { area: 'general', pillar: 'seiketsu', response: 'si' },
  { area: 'general', pillar: 'shitsuke', response: 'si' },
  { area: 'general', pillar: 'seiketsu', response: 'si' },
  { area: 'general', pillar: 'seiketsu', response: 'no' },
]

export interface Tally {
  total: number
  si: number
  no: number
  na: number
  index: number | null // 0–1
}

function tally(items: Item[]): Tally {
  const si = items.filter((i) => i.response === 'si').length
  const no = items.filter((i) => i.response === 'no').length
  const na = items.filter((i) => i.response === 'na').length
  const denom = items.length - na
  return { total: items.length, si, no, na, index: denom > 0 ? si / denom : null }
}

export function radarByPillar() {
  return PILLARS_5S.map((p) => {
    const t = tally(AUDIT_5S.filter((i) => i.pillar === p.id))
    return { key: p.key, label: p.label, jp: p.jp, value: Math.round((t.index ?? 0) * 100), t }
  })
}

export function areaCompliance() {
  return AREAS_5S.map((a) => {
    const t = tally(AUDIT_5S.filter((i) => i.area === a.id))
    return { id: a.id, label: a.label, value: Math.round((t.index ?? 0) * 100), t }
  }).sort((x, y) => y.value - x.value)
}

export function pillarAreaMatrix() {
  return PILLARS_5S.map((p) => ({
    pillar: p,
    cells: AREAS_5S.map((a) => {
      const t = tally(AUDIT_5S.filter((i) => i.pillar === p.id && i.area === a.id))
      return { area: a, t }
    }),
  }))
}

export function paretoNC() {
  const rows = AREAS_5S.map((a) => ({
    id: a.id,
    label: a.label,
    count: AUDIT_5S.filter((i) => i.area === a.id && i.response === 'no').length,
  })).sort((x, y) => y.count - x.count)
  const total = rows.reduce((s, r) => s + r.count, 0) || 1
  let run = 0
  return rows.map((r) => {
    run += r.count
    return { ...r, cum: Math.round((run / total) * 100) }
  })
}

export function globalIndex(): number {
  const t = tally(AUDIT_5S)
  return Math.round((t.index ?? 0) * 100)
}

// Umbrales de banda para el color de estado
export function band(pct: number): 'good' | 'warning' | 'critical' {
  if (pct >= 85) return 'good'
  if (pct >= 70) return 'warning'
  return 'critical'
}

// ── Paleta de los paneles BI ────────────────────────────────────────────────
export const C5 = {
  gold: '#e8b04b',
  cyan: '#35c6e6',
  good: '#2fb37a',
  warning: '#e0a53f',
  critical: '#e5484d',
  grid: 'rgba(247,250,252,0.08)',
  axis: 'rgba(247,250,252,0.22)',
  textPri: '#f7fafc',
  textSec: '#cbd5e1',
  textMut: '#94a3b8',
}

export function bandColor(pct: number): string {
  const b = band(pct)
  return b === 'good' ? C5.good : b === 'warning' ? C5.warning : C5.critical
}

// Escala azul del heatmap: mayor cumplimiento = azul más intenso.
export function heatColor(pct: number | null): string {
  if (pct === null) return 'rgba(247,250,252,0.035)'
  const lo = [0x24, 0x34, 0x4c] // slate tenue (0%)
  const hi = [0x2f, 0x6f, 0xd6] // azul intenso (100%)
  const k = Math.min(1, Math.max(0, pct / 100))
  const c = lo.map((l, i) => Math.round(l + (hi[i] - l) * k))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}
