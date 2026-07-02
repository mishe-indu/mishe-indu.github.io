import { useState, useRef } from 'react'
import { useAudit } from './data/AuditContext'
import { parseMatrixWorkbook } from './data/excel'
import { TabResumen } from './components/TabResumen'
import { TabDetalle } from './components/TabDetalle'
import { TabMatriz } from './components/TabMatriz'
import { TabFiveS } from './components/TabFiveS'
import { PdfExporter } from './components/PdfExporter'

const TABS = [
  { id: 'resumen', label: '📊 Dashboard' },
  { id: 'detalle', label: '📈 Detalle por KPI' },
  { id: 'matriz', label: '📋 Matriz de Indicadores' },
  { id: 'cinco', label: '🎯 Análisis 5S' },
]

export default function App() {
  const { dashboard, imported, loadDashboard } = useAudit()
  const [tab, setTab] = useState('resumen')
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
      const result = parseMatrixWorkbook(buf, file.name)
      if (result.dashboard && result.dashboard.definitions.length > 0) {
        loadDashboard(result.dashboard)
      } else {
        setError(result.errors.join('. ') || 'No se detectaron KPIs')
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
          <h1 style={{ textAlign: 'center', fontSize: 28 }}>KPI Palestra Couture</h1>
          <p className="landing-desc">
            Sube tu archivo MATRIZ DE INDICADORES PALESTRA.xlsx para visualizar los indicadores clave de gestión.
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
            <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleFile} hidden />
            <div className="landing-drop-icon">📂</div>
            <div className="landing-drop-title">
              {loading ? 'Procesando…' : 'Arrastra tu Excel aquí o haz click'}
            </div>
            <div className="landing-drop-sub">Formato: MATRIZ DE INDICADORES PALESTRA.xlsx</div>
          </div>
          {error && <div className="landing-error">{error}</div>}
        </div>
      </div>
    )
  }

  if (!dashboard) return null

  return (
    <div className="shell" id="shell">
      <header>
        <div className="topbar">
          <div className="brand">
            <img src="./logo.jpeg" alt="Palestra Couture" className="brand-logo" />
            <div>
              <div className="eyebrow">Palestra Couture</div>
              <h1>KPI Dashboard</h1>
              <p>Indicadores clave de gestión</p>
            </div>
          </div>
          <div className="toolbar">
            <label className="action-btn">
              📂 Cargar Excel
              <input type="file" accept=".xlsx,.xls" onChange={handleFile} hidden />
            </label>
            <PdfExporter prepare={() => setTab('resumen')} />
          </div>
        </div>
      </header>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'resumen' && <TabResumen />}
      {tab === 'detalle' && <TabDetalle />}
      {tab === 'matriz' && <TabMatriz />}
      {tab === 'cinco' && <TabFiveS />}

      <footer className="foot">
        <span>Palestra Couture · KPI · {dashboard.meta.date}</span>
        <span>MATRIZ DE INDICADORES CLAVES DE GESTIÓN</span>
      </footer>
    </div>
  )
}
