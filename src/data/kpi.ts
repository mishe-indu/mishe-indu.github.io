export type KpiStatus = 'ideal' | 'acceptable' | 'deficient' | 'sin_datos'

export interface KpiMeta {
  company: string
  date: string
  responsible: string
}

export interface KpiDefinition {
  id: number
  perspective: string
  objective: string
  name: string
  formula: string
  unit: string
  frequency: string
  idealDesc: string
  acceptableDesc: string
  deficientDesc: string
  responsible: string
  /** umbrales numéricos parseados */
  idealThreshold: number
  acceptableThreshold: number
  deficientThreshold: number
  /** si el KPI es "menor es mejor" (ej: accidentes) */
  invert: boolean
}

export interface KpiMonthData {
  period: string
  result: number | null
  meta: number | null
  status: KpiStatus
  rawValues: Record<string, number | string | null>
}

export interface KpiDashboard {
  meta: KpiMeta
  definitions: KpiDefinition[]
  data: Record<number, KpiMonthData[]>  // keyed by definition id
}

export function evalStatus(def: KpiDefinition, value: number | null): KpiStatus {
  if (value === null || isNaN(value)) return 'sin_datos'
  if (def.invert) {
    if (value <= def.idealThreshold) return 'ideal'
    if (value <= def.acceptableThreshold) return 'acceptable'
    return 'deficient'
  }
  if (value >= def.idealThreshold) return 'ideal'
  if (value >= def.acceptableThreshold) return 'acceptable'
  return 'deficient'
}

export function statusColor(status: KpiStatus): string {
  switch (status) {
    case 'ideal': return '#98d1b0'
    case 'acceptable': return '#f0b429'
    case 'deficient': return '#e53e3e'
    case 'sin_datos': return '#94a3b8'
  }
}

export function statusLabel(status: KpiStatus, lang: 'es' | 'en'): string {
  const map = {
    ideal: { es: 'Ideal', en: 'Ideal' },
    acceptable: { es: 'Aceptable', en: 'Acceptable' },
    deficient: { es: 'Deficiente', en: 'Deficient' },
    sin_datos: { es: 'Sin datos', en: 'No data' },
  }
  return map[status][lang]
}
