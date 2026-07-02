import { useState } from 'react'
import { useI18n } from './i18n'
import { useAudit } from './data/AuditContext'
import { Header } from './components/Header'
import { KpiRow } from './components/KpiRow'
import { RadarPillars } from './components/RadarPillars'
import { AreaCompliance } from './components/AreaCompliance'
import { PillarAreaHeatmap } from './components/PillarAreaHeatmap'
import { ParetoChart } from './components/ParetoChart'
import { Filters } from './components/Filters'
import { DetailTable } from './components/DetailTable'
import { ExcelImporter } from './components/ExcelImporter'
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
  const { meta } = useAudit()
  const [tab, setTab] = useState('resumen')
  const [filters, setFilters] = useState(emptyFilters())

  return (
    <div className="shell" id="shell">
      <Header />

      <div className="toolbar">
        <ExcelImporter />
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
