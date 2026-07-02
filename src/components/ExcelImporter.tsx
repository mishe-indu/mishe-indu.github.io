import { useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { useAudit } from '../data/AuditContext'
import { parseMatrixWorkbook } from '../data/excel'

export function ExcelImporter() {
  const { t } = useI18n()
  const { loadDashboard } = useAudit()
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const buf = await file.arrayBuffer()
      const result = parseMatrixWorkbook(buf, file.name)
      if (result.dashboard && result.dashboard.definitions.length > 0) {
        loadDashboard(result.dashboard)
      } else {
        setError(result.errors.join('. ') || 'No se detectaron KPIs en el archivo')
      }
    } catch (err) {
      setError((err as Error).message)
    }
    setLoading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <label className="action-btn">
      {loading ? '…' : t('import.button')}
      {error && <span style={{ color: 'var(--critical)', marginLeft: 8, fontSize: 11 }}>{error}</span>}
      <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleFile} hidden disabled={loading} />
    </label>
  )
}
