import { useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { useAudit } from '../data/AuditContext'
import { parseExcelWorkbook, type ParseResult } from '../data/excel'

export function ExcelImporter() {
  const { t } = useI18n()
  const { loadItems, reset } = useAudit()
  const inputRef = useRef<HTMLInputElement>(null)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setResult(null)

    try {
      const buf = await file.arrayBuffer()
      const parsed = parseExcelWorkbook(buf, file.name)
      setResult(parsed)

      if (parsed.items.length > 0) {
        loadItems(parsed.items, parsed.meta)
      }
    } catch (err) {
      setResult({
        items: [],
        meta: {} as any,
        errors: [(err as Error).message],
      })
    }

    setLoading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleReset = () => {
    reset()
    setResult(null)
  }

  return (
    <div className="import-export-group">
      <label className="action-btn">
        {loading ? '…' : t('import.button')}
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFile}
          hidden
          disabled={loading}
        />
      </label>

      {result && (result.items.length > 0 || result.errors.length > 0) && (
        <div className="import-toast">
          {result.items.length > 0 && (
            <span className="import-ok">
              ✓ {result.items.length} {t('import.loaded')}
            </span>
          )}
          {result.errors.length > 0 && (
            <details className="import-errors">
              <summary>{result.errors.length} {t('import.errors')}</summary>
              <ul>
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </details>
          )}
          <button className="action-btn secondary" onClick={handleReset}>
            {t('import.reset')}
          </button>
        </div>
      )}
    </div>
  )
}
