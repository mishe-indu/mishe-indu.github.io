import { useState, useRef } from 'react'
import { useI18n } from './i18n'
import { useAudit } from './data/AuditContext'
import { parseExcelWorkbook } from './data/excel'
import { Header } from './components/Header'
import { KpiRow } from './components/KpiRow'
import { RadarPillars } from './components/RadarPillars'
import { AreaCompliance } from './components/AreaCompliance'
import { PillarAreaHeatmap } from './components/PillarAreaHeatmap'
import { ParetoChart } from './components/ParetoChart'
import { Filters } from './components/Filters'
import { DetailTable } from './components/DetailTable'
import { PdfExporter } from './components/PdfExporter'
import { TabComparar } from './components/TabComparar'
import { emptyFilters } from './data/compute'

const TABS = [
  { id: 'resumen', label: '📊 Resumen' },
  { id: 'radar', label: '🕸️ Radar' },
  { id: 'barras', label: '📶 Barras' },
  { id: 'checklist', label: '📝 Checklist' },
  { id: 'comparar', label: '📈 Comparar' },
]

export default function App() {
  const { t } = useI18n()
  const { meta, imported, loadItems } = useAudit()
  const [tab, setTab] = useState('resumen')
  const [filters, setFilters] = useState(emptyFilters())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const buf = await file.arrayBuffer()
      const result = parseExcelWorkbook(buf, file.name)
      if (result.items.length > 0) {
        loadItems(result.items, result.meta)
      } else {
        setError(result.errors.join('. ') || 'No se detectaron ítems 5S')
      }
    } catch (err) {
      setError((err as Error).message)
    }
    setLoading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  if (!imported) {
    return (
      <div className="shell" id="shell">
        <div className="landing">
          <div className="landing-icon">📊</div>
          <div className="tag" style={{ textAlign: 'center' }}>Panel de Control</div>
          <h1 style={{ textAlign: 'center', fontSize: 28 }}>Auditoría 5S</h1>
          <p className="landing-desc">
            Sube tu archivo Excel de auditoría y el sistema calculará automáticamente los índices, generará las gráficas y te permitirá exportar el reporte en PDF.
          </p>
          <div
            className="landing-drop"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragover') }}
            onDragLeave={(e) => e.currentTarget.classList.remove('dragover')}
            onDrop={(e) => {
              e.preventDefault()
              e.currentTarget.classList.remove('dragover')
              if (e.dataTransfer.files[0]) {
                const dt = new DataTransfer()
                dt.items.add(e.dataTransfer.files[0])
                if (inputRef.current) inputRef.current.files = dt.files
                handleFile({ target: inputRef.current } as any)
              }
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFile}
              hidden
            />
            <div className="landing-drop-icon">📂</div>
            <div className="landing-drop-title">
              {loading ? 'Procesando…' : 'Arrastra tu Excel aquí o haz click para seleccionar'}
            </div>
            <div className="landing-drop-sub">Formatos: .xlsx · .xls</div>
            <div className="landing-drop-hint">
              Acepta formato checkboxes (SI/NO/N/A) o texto (si/no/na)
            </div>
          </div>
          {error && <div className="landing-error">{error}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="shell" id="shell">
      <Header />

      <div className="toolbar">
        <label className="action-btn">
          📂 Importar Excel
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFile}
            hidden
          />
        </label>
        <PdfExporter />
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'resumen' && (
        <>
          <KpiRow />
          <div className="grid grid-2-1">
            <RadarPillars />
            <AreaCompliance />
          </div>
          <div className="grid grid-2 section-gap">
            <PillarAreaHeatmap />
            <ParetoChart />
          </div>
        </>
      )}

      {tab === 'radar' && (
        <div className="grid grid-2 section-gap">
          <RadarPillars />
          <PillarAreaHeatmap />
        </div>
      )}

      {tab === 'barras' && (
        <>
          <KpiRow />
          <div className="grid grid-2 section-gap">
            <AreaCompliance />
            <ParetoChart />
          </div>
        </>
      )}

      {tab === 'checklist' && (
        <>
          <h2 className="eyebrow" style={{ margin: '0 0 12px', fontSize: 12, letterSpacing: '0.16em' }}>
            {t('table.title')}
          </h2>
          <Filters filters={filters} setFilters={setFilters} />
          <DetailTable filters={filters} />
        </>
      )}

      {tab === 'comparar' && <TabComparar />}

      <footer className="foot">
        <span>{meta.company} · 5S · {t('app.title')}</span>
        <span>{t('footer.note')}</span>
      </footer>
    </div>
  )
}
