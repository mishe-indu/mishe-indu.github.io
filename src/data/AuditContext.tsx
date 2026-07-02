import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { KpiDashboard } from './kpi'

export interface HistoryEntry {
  id: string
  dashboard: KpiDashboard
  timestamp: number
}

export interface AuditCtx {
  dashboard: KpiDashboard | null
  imported: boolean
  history: HistoryEntry[]
  loadDashboard: (d: KpiDashboard) => void
  reset: () => void
  clearHistory: () => void
}

const Ctx = createContext<AuditCtx | null>(null)

export function AuditProvider({ children }: { children: ReactNode }) {
  const [dashboard, setDashboard] = useState<KpiDashboard | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const loadDashboard = useCallback((d: KpiDashboard) => {
    setDashboard(d)
    setHistory((prev) => {
      const entry: HistoryEntry = {
        id: Date.now().toString(36),
        dashboard: d,
        timestamp: Date.now(),
      }
      const merged = [...prev, entry]
      return merged.slice(-10)
    })
  }, [])

  const reset = useCallback(() => {
    setDashboard(null)
  }, [])

  const clearHistory = useCallback(() => setHistory([]), [])

  return (
    <Ctx.Provider
      value={{
        dashboard,
        imported: dashboard !== null,
        history,
        loadDashboard,
        reset,
        clearHistory,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useAudit(): AuditCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAudit fuera de AuditProvider')
  return ctx
}
