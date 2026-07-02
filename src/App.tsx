import { useState, useRef } from 'react'
import { useAudit } from './data/AuditContext'
import { parseMatrixWorkbook, looksLikeAudit } from './data/excel'
import { TabResumen } from './components/TabResumen'
import { TabDetalle } from './components/TabDetalle'
import { TabMatriz } from './components/TabMatriz'
import { TabFiveS } from './components/TabFiveS'
import { PdfExporter } from './components/PdfExporter'

const ico = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const IconGrid = () => (
  <svg viewBox="0 0 16 16" width="15" height="15" {...ico}><rect x="1.75" y="1.75" width="5.5" height="5.5" rx="1" /><rect x="8.75" y="1.75" width="5.5" height="5.5" rx="1" /><rect x="1.75" y="8.75" width="5.5" height="5.5" rx="1" /><rect x="8.75" y="8.75" width="5.5" height="5.5" rx="1" /></svg>
)
const IconTrend = () => (
  <svg viewBox="0 0 16 16" width="15" height="15" {...ico}><path d="M1.5 10.5 5.5 6.5 8.5 9 14 3" /><path d="M10.5 3H14v3.5" /></svg>
)
const IconTable = () => (
  <svg viewBox="0 0 16 16" width="15" height="15" {...ico}><rect x="1.5" y="2.5" width="13" height="11" rx="1.5" /><path d="M1.5 6.5h13M6 6.5v7" /></svg>
)
const IconRadar = () => (
  <svg viewBox="0 0 16 16" width="15" height="15" {...ico}><path d="M8 1.5 14 6l-2.3 7H4.3L2 6z" /><circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none" /></svg>
)
const IconUpload = () => (
  <svg viewBox="0 0 16 16" width="15" height="15" {...ico}><path d="M8 10.5V2.5M5 5l3-3 3 3" /><path d="M2.5 10.5v2a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-2" /></svg>
)

/** ArrayBuffer -> base64 en bloques (evita desbordar la pila con archivos grandes). */
function bufToB64(buf: ArrayBuffer): string {
  const u8 = new Uint8Array(buf)
  let s = ''
  const CHUNK = 0x8000
  for (let i = 0; i < u8.length; i += CHUNK) {
    s += String.fromCharCode(...u8.subarray(i, i + CHUNK))
  }
  return btoa(s)
}

const TABS = [
  { id: 'resumen', label: 'Dashboard', icon: <IconGrid /> },
  { id: 'detalle', label: 'Detalle por KPI', icon: <IconTrend /> },
  { id: 'matriz', label: 'Matriz de indicadores', icon: <IconTable /> },
  { id: 'cinco', label: 'Análisis 5S', icon: <IconRadar /> },
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
      } else if (looksLikeAudit(buf)) {
        // Es una auditoría 5S (checklist SI/NO/N/A): la entregamos al panel
        // /5s/ vía sessionStorage y redirigimos con los resultados.
        sessionStorage.setItem(
          'palestra5s.pendingFile',
          JSON.stringify({ name: file.name, b64: bufToB64(buf) }),
        )
        window.location.href = './5s/'
        return
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
            Sube tu archivo MATRIZ DE INDICADORES PALESTRA.xlsx para visualizar los indicadores
            clave de gestión. Si subes una auditoría 5S (checklist SI/NO/N/A), se abrirá
            automáticamente el panel de Auditoría 5S con sus resultados.
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
            <div className="landing-drop-sub">
              Formatos: MATRIZ DE INDICADORES (KPIs) · Auditoría 5S (SI/NO/N/A)
            </div>
          </div>
          {error && <div className="landing-error">{error}</div>}
        </div>
      </div>
    )
  }

  if (!dashboard) return null

  const reportPeriod = (() => {
    for (const d of dashboard.definitions) {
      const ms = (dashboard.data[d.id] || []).filter((m) => m.result !== null)
      if (ms.length) return `${ms[ms.length - 1].period} ${dashboard.meta.date.slice(0, 4)}`
    }
    return dashboard.meta.date
  })()

  return (
    <div className="shell" id="shell">
      <header className="topbar">
        <div className="brand">
          <img src="./logo.jpeg" alt="Palestra Couture" className="brand-logo" />
          <div className="brand-text">
            <div className="brand-name">Palestra Couture</div>
            <div className="brand-meta">
              <span>Panel de indicadores de gestión</span>
              {reportPeriod && (
                <>
                  <span className="brand-dot" aria-hidden="true">·</span>
                  <span className="report-chip">{reportPeriod}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="toolbar">
          <label className="action-btn primary">
            <IconUpload />
            Cargar Excel
            <input type="file" accept=".xlsx,.xls" onChange={handleFile} hidden />
          </label>
          <PdfExporter prepare={() => setTab('resumen')} />
        </div>
      </header>

      <nav className="tabs" aria-label="Secciones">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab${tab === t.id ? ' active' : ''}`}
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => setTab(t.id)}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>

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
