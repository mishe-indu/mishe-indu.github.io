// ============================================================================
//  Tokens de color para los gráficos (modo oscuro industrial · grafito).
//  Paleta validada con el validador de la skill dataviz contra la superficie
//  #16181d — ver README. Los estados llevan ícono+etiqueta, nunca color solo.
// ============================================================================
import type { AreaId } from './data/audit'
import type { Band } from './data/compute'

// Superficies / tinta (deben coincidir con las variables CSS de index.css)
export const SURFACE = '#16181d'
export const GRID = 'rgba(233,233,226,0.08)'
export const AXIS = 'rgba(233,233,226,0.22)'
export const TEXT_PRIMARY = '#ecece6'
export const TEXT_SECONDARY = '#a7a89f'
export const TEXT_MUTED = '#71736c'

// Acentos de marca (industrial: ámbar señalético + cian)
export const AMBER = '#f2a41c'
export const CYAN = '#35c6e6'

// Estados 5S (paleta de estado fija — nunca se reutiliza como serie)
export const STATUS: Record<Band, string> = {
  good: '#0ca30c',
  warning: '#fab219',
  critical: '#d03b3b',
}

export const STATUS_ICON: Record<Band, string> = {
  good: '●',
  warning: '◆',
  critical: '▲',
}

// Categórico por ÁREA (orden fijo, no ciclar) — set validado (ΔE CVD 15.7)
export const AREA_COLOR: Record<AreaId, string> = {
  corte: '#3987e5', // azul
  confeccion: '#199e70', // aqua
  bodega: '#9085e9', // violeta
  general: '#d95926', // naranja
}

// Rampa secuencial azul (para el heatmap pilar × área, magnitud del índice OK)
export const SEQ_BLUE = [
  '#0d366b',
  '#104281',
  '#184f95',
  '#1c5cab',
  '#256abf',
  '#2a78d6',
  '#3987e5',
  '#5598e7',
  '#6da7ec',
  '#86b6ef',
]

/** Devuelve el paso de la rampa azul para un índice 0–1 (ordinal, clamp). */
export function seqColor(index: number | null): string {
  if (index === null) return 'rgba(233,233,226,0.06)'
  const i = Math.min(SEQ_BLUE.length - 1, Math.max(0, Math.round(index * (SEQ_BLUE.length - 1))))
  return SEQ_BLUE[i]
}
