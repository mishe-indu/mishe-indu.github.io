import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import {
  AUDIT_ITEMS as DEFAULT_ITEMS,
  AUDIT_META as DEFAULT_META,
  type AuditItem,
  type AuditMeta,
} from './audit'

export interface HistoryEntry {
  id: string
  items: AuditItem[]
  meta: AuditMeta
  timestamp: number
}

export interface AuditCtx {
  items: AuditItem[]
  meta: AuditMeta
  history: HistoryEntry[]
  imported: boolean
  loadItems: (items: AuditItem[], meta: AuditMeta) => void
  reset: () => void
  clearHistory: () => void
}

const Ctx = createContext<AuditCtx | null>(null)

export function AuditProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState(DEFAULT_ITEMS)
  const [meta, setMeta] = useState(DEFAULT_META)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [imported, setImported] = useState(false)

  const loadItems = useCallback((newItems: AuditItem[], newMeta: AuditMeta) => {
    setItems(newItems)
    setMeta(newMeta)
    setImported(true)
    setHistory((prev) => {
      const entry: HistoryEntry = {
        id: Date.now().toString(36),
        items: newItems,
        meta: newMeta,
        timestamp: Date.now(),
      }
      const merged = [...prev, entry]
      return merged.slice(-10)
    })
  }, [])

  const reset = useCallback(() => {
    setItems(DEFAULT_ITEMS)
    setMeta(DEFAULT_META)
    setImported(false)
  }, [])

  const clearHistory = useCallback(() => setHistory([]), [])

  return (
    <Ctx.Provider value={{ items, meta, history, imported, loadItems, reset, clearHistory }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAudit(): AuditCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAudit fuera de AuditProvider')
  return ctx
}
