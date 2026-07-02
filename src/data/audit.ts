// ============================================================================
//  FUENTE ÚNICA DE DATOS — Auditoría 5S Palestra Couture
// ----------------------------------------------------------------------------
//  Editá SOLO este archivo para actualizar el panel. Al guardar, todos los
//  KPIs y gráficos se recalculan automáticamente.
//
//  Origen: "5S PALESTRA COUTURE.xlsx" (hoja AUDITORÍA).
//  Metodología de puntaje: formato "auditoria 5'Ss MMH".
//     Índice OK = (ítems "Sí") / (total de ítems − ítems "N/A")
//     Umbrales:  🟢 verde ≥ 85 %   🟡 amarillo 70–85 %   🔴 rojo < 70 %
//
//  El pilar 5S de cada pregunta NO viene tabulado en el Excel original
//  (la auditoría está organizada por área). Fue clasificado a partir del
//  contenido de cada ítem contra la plantilla de los 5 pilares. Si querés
//  reasignar alguno, cambiá el campo `pillar`.
// ============================================================================

export type Response = 'si' | 'no' | 'na'

export type AreaId = 'corte' | 'confeccion' | 'bodega' | 'general'

export type PillarId =
  | 'seiri' // Clasificar
  | 'seiton' // Ordenar
  | 'seiso' // Limpieza
  | 'seiketsu' // Estandarizar
  | 'shitsuke' // Disciplina

export interface AuditItem {
  id: number
  area: AreaId
  pillar: PillarId
  question: string
  response: Response
  observation?: string
}

export interface AuditMeta {
  company: string
  responsible: string
  date: string // ISO
  location: string
  standardGreen: number // umbral verde (0–1)
  standardYellow: number // umbral amarillo (0–1)
}

export const AUDIT_META: AuditMeta = {
  company: 'Palestra Couture',
  responsible: 'Mishelle Mendoza',
  date: '2026-05-07',
  location: 'Planta de confección',
  standardGreen: 0.85,
  standardYellow: 0.7,
}

// Etiquetas legibles de áreas y pilares (para el color por entidad, el orden
// es fijo — no ciclar).
export const AREAS: { id: AreaId; es: string; en: string }[] = [
  { id: 'corte', es: 'Corte y Patronaje', en: 'Cutting & Patterns' },
  { id: 'confeccion', es: 'Confección', en: 'Sewing' },
  { id: 'bodega', es: 'Bodega', en: 'Warehouse' },
  { id: 'general', es: 'General', en: 'General' },
]

export const PILLARS: {
  id: PillarId
  key: string
  es: string
  en: string
  jp: string
}[] = [
  { id: 'seiri', key: '1S', es: 'Clasificar', en: 'Sort', jp: 'Seiri' },
  { id: 'seiton', key: '2S', es: 'Ordenar', en: 'Set in order', jp: 'Seiton' },
  { id: 'seiso', key: '3S', es: 'Limpieza', en: 'Shine', jp: 'Seiso' },
  { id: 'seiketsu', key: '4S', es: 'Estandarizar', en: 'Standardize', jp: 'Seiketsu' },
  { id: 'shitsuke', key: '5S', es: 'Disciplina', en: 'Sustain', jp: 'Shitsuke' },
]

export const AUDIT_ITEMS: AuditItem[] = [
  // ── CORTE Y PATRONAJE ──────────────────────────────────────────────
  { id: 1, area: 'corte', pillar: 'seiri', response: 'si', question: '¿Los retazos de tela innecesarios han sido retirados del área de corte?' },
  { id: 2, area: 'corte', pillar: 'seiton', response: 'no', question: '¿Las herramientas de corte tienen un lugar definido y están en su sitio?' },
  { id: 3, area: 'corte', pillar: 'seiton', response: 'si', question: '¿Los patrones y moldes están organizados y debidamente identificados?' },
  { id: 4, area: 'corte', pillar: 'seiso', response: 'si', question: '¿El área de corte se mantiene limpia después de cada jornada?' },
  { id: 5, area: 'corte', pillar: 'seiso', response: 'si', question: '¿Los residuos de tela se depositan en contenedores designados?' },
  { id: 6, area: 'corte', pillar: 'seiton', response: 'si', question: '¿Los cables de la máquina de corte están organizados y seguros?' },
  { id: 7, area: 'corte', pillar: 'seiketsu', response: 'si', question: '¿La operaria utiliza guante de protección durante las actividades de corte?' },
  { id: 8, area: 'corte', pillar: 'shitsuke', response: 'si', question: '¿La máquina de corte se encuentra en buen estado y funcionando correctamente?' },

  // ── CONFECCIÓN ─────────────────────────────────────────────────────
  { id: 9, area: 'confeccion', pillar: 'seiri', response: 'si', question: '¿Las máquinas de coser están libres de accesorios y materiales innecesarios?' },
  { id: 10, area: 'confeccion', pillar: 'seiton', response: 'no', question: '¿Los hilos y accesorios de costura están organizados por tipo y color?' },
  { id: 11, area: 'confeccion', pillar: 'seiton', response: 'si', question: '¿Los pasillos entre máquinas están despejados?' },
  { id: 12, area: 'confeccion', pillar: 'seiso', response: 'si', question: '¿La máquina de coser se encuentra limpia?' },
  { id: 13, area: 'confeccion', pillar: 'seiton', response: 'si', question: '¿Los cables de la máquina de coser están organizados?' },
  { id: 14, area: 'confeccion', pillar: 'shitsuke', response: 'si', question: '¿Cuenta con asientos o sillas en buen estado?' },

  // ── BODEGA ─────────────────────────────────────────────────────────
  { id: 15, area: 'bodega', pillar: 'seiton', response: 'si', question: 'El producto terminado está organizado por tipo y código.' },
  { id: 16, area: 'bodega', pillar: 'seiso', response: 'no', question: 'Los estantes y zonas de almacenamiento están limpios y ordenados.' },
  { id: 17, area: 'bodega', pillar: 'seiri', response: 'no', question: '¿El área de inspección está libre de prendas o materiales no relacionados?' },
  { id: 18, area: 'bodega', pillar: 'seiketsu', response: 'si', question: '¿Las fichas técnicas están disponibles y visibles?' },
  { id: 19, area: 'bodega', pillar: 'seiri', response: 'no', question: '¿Las prendas rechazadas están claramente identificadas y separadas?' },

  // ── GENERAL ────────────────────────────────────────────────────────
  { id: 20, area: 'general', pillar: 'seiton', response: 'si', question: '¿Los pasillos principales están libres y transitables?' },
  { id: 21, area: 'general', pillar: 'seiso', response: 'si', question: '¿Las áreas de producción están limpias y ordenadas?' },
  { id: 22, area: 'general', pillar: 'seiketsu', response: 'no', question: '¿Tienen la señalización de salida de emergencia?' },
  { id: 23, area: 'general', pillar: 'seiso', response: 'no', question: '¿Los baños están limpios, con papel higiénico y basurero con tapa?' },
  { id: 24, area: 'general', pillar: 'shitsuke', response: 'si', question: '¿Los baños se encuentran con chapa funcionando y en buen estado?' },
  { id: 25, area: 'general', pillar: 'shitsuke', response: 'no', question: '¿Existe un cronograma de limpieza?' },
  { id: 26, area: 'general', pillar: 'seiketsu', response: 'no', question: '¿El extintor está correctamente señalizado?' },
  { id: 27, area: 'general', pillar: 'shitsuke', response: 'no', question: '¿El extintor se encuentra dentro de la fecha de vigencia?' },
  { id: 28, area: 'general', pillar: 'seiketsu', response: 'no', question: '¿Existen señaléticas visibles que identifiquen claramente las áreas o puestos de trabajo?' },
  { id: 29, area: 'general', pillar: 'seiketsu', response: 'si', question: '¿La iluminación general de la planta es adecuada?' },
  { id: 30, area: 'general', pillar: 'shitsuke', response: 'si', question: '¿Los tomacorrientes están operativos (verificado con prueba de conexión)?' },
  { id: 31, area: 'general', pillar: 'seiketsu', response: 'si', question: '¿El personal de costura utiliza uniforme dotado por la empresa?' },
  { id: 32, area: 'general', pillar: 'seiketsu', response: 'no', question: '¿El botiquín se encuentra accesible, completo y correctamente señalizado?' },
]
