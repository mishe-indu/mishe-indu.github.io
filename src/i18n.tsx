import { createContext, useContext, useState, type ReactNode } from 'react'

export type Lang = 'es' | 'en'

type Dict = Record<string, { es: string; en: string }>

const STRINGS: Dict = {
  'app.title': { es: 'KPI Dashboard', en: 'KPI Dashboard' },
  'import.button': { es: '📂 Cargar Excel', en: '📂 Load Excel' },
  'export.pdf': { es: '📄 Exportar PDF', en: '📄 Export PDF' },
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
