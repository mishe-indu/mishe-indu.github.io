import { createContext, useContext, useState, type ReactNode } from 'react'
import {
  AUDIT_ITEMS as DEFAULT_ITEMS,
  AUDIT_META as DEFAULT_META,
  type AuditItem,
  type AuditMeta,
} from './audit'

export interface AuditCtx {
  items: AuditItem[]
  meta: AuditMeta
  loadItems: (items: AuditItem[], meta: AuditMeta) => void
  reset: () => void
}

const Ctx = createContext<AuditCtx | null>(null)

export function AuditProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState(DEFAULT_ITEMS)
  const [meta, setMeta] = useState(DEFAULT_META)

  const loadItems = (newItems: AuditItem[], newMeta: AuditMeta) => {
    setItems(newItems)
    setMeta(newMeta)
  }

  const reset = () => {
    setItems(DEFAULT_ITEMS)
    setMeta(DEFAULT_META)
  }

  return <Ctx.Provider value={{ items, meta, loadItems, reset }}>{children}</Ctx.Provider>
}

export function useAudit(): AuditCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAudit fuera de AuditProvider')
  return ctx
}
