// ============================================================================
//  Internacionalización mínima ES / EN (sin dependencias).
// ============================================================================
import { createContext, useContext, useState, type ReactNode } from 'react'

export type Lang = 'es' | 'en'

type Dict = Record<string, { es: string; en: string }>

const STRINGS: Dict = {
  'app.title': { es: 'Panel de Control 5S', en: '5S Control Panel' },
  'app.subtitle': { es: 'Auditoría de metodología · Palestra Couture', en: 'Methodology audit · Palestra Couture' },
  'meta.responsible': { es: 'Responsable', en: 'Auditor' },
  'meta.date': { es: 'Fecha de auditoría', en: 'Audit date' },
  'meta.location': { es: 'Ubicación', en: 'Location' },
  'meta.standard': { es: 'Estándar de aprobación', en: 'Approval standard' },

  'kpi.global': { es: 'Cumplimiento general', en: 'Overall compliance' },
  'kpi.areas': { es: 'Áreas evaluadas', en: 'Areas audited' },
  'kpi.approved': { es: 'Áreas aprobadas', en: 'Areas passed' },
  'kpi.nc': { es: 'No conformidades', en: 'Non-conformities' },
  'kpi.approved.hint': { es: 'en banda verde (≥85%)', en: 'in green band (≥85%)' },
  'kpi.items': { es: 'ítems evaluados', en: 'items audited' },

  'chart.radar': { es: 'Rendimiento por pilar 5S', en: '5S pillar performance' },
  'chart.area': { es: 'Cumplimiento por área', en: 'Compliance by area' },
  'chart.matrix': { es: 'Matriz pilar × área', en: 'Pillar × area matrix' },
  'chart.pareto': { es: 'Pareto de no conformidades', en: 'Non-conformity Pareto' },
  'chart.pareto.bars': { es: 'No conformidades', en: 'Non-conformities' },
  'chart.pareto.line': { es: '% acumulado', en: 'Cumulative %' },
  'chart.radar.series': { es: 'Índice OK', en: 'OK index' },

  'table.title': { es: 'Detalle de la auditoría', en: 'Audit detail' },
  'table.id': { es: '#', en: '#' },
  'table.area': { es: 'Área', en: 'Area' },
  'table.pillar': { es: 'Pilar', en: 'Pillar' },
  'table.question': { es: 'Ítem evaluado', en: 'Audited item' },
  'table.response': { es: 'Resultado', en: 'Result' },
  'table.showing': { es: 'Mostrando', en: 'Showing' },
  'table.of': { es: 'de', en: 'of' },

  'filters.title': { es: 'Filtros', en: 'Filters' },
  'filters.area': { es: 'Área', en: 'Area' },
  'filters.pillar': { es: 'Pilar', en: 'Pillar' },
  'filters.response': { es: 'Resultado', en: 'Result' },
  'filters.clear': { es: 'Limpiar', en: 'Clear' },
  'filters.active': { es: 'filtros activos', en: 'active filters' },

  'resp.si': { es: 'Sí', en: 'Yes' },
  'resp.no': { es: 'No', en: 'No' },
  'resp.na': { es: 'N/A', en: 'N/A' },

  'band.good': { es: 'Conforme', en: 'Compliant' },
  'band.warning': { es: 'Observado', en: 'Watch' },
  'band.critical': { es: 'Crítico', en: 'Critical' },

  'footer.note': {
    es: 'Datos de la auditoría del 07/05/2026. Editá src/data/audit.ts para actualizar.',
    en: 'Audit data from 2026-05-07. Edit src/data/audit.ts to update.',
  },
  'legend.axis': { es: 'Eje: índice OK 0–100%', en: 'Axis: OK index 0–100%' },
}

interface I18nCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: keyof typeof STRINGS | string) => string
}

const Ctx = createContext<I18nCtx | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('es')
  const t = (key: string) => STRINGS[key]?.[lang] ?? key
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useI18n fuera de I18nProvider')
  return ctx
}
