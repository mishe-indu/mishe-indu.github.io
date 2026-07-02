import { useState } from 'react'
import { useI18n } from './i18n'
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
import { emptyFilters } from './data/compute'

export default function App() {
  const { t } = useI18n()
  const [filters, setFilters] = useState(emptyFilters())

  return (
    <div className="shell" id="shell">
      <Header />
      <KpiRow />

      <div className="grid grid-2-1">
        <RadarPillars />
        <AreaCompliance />
      </div>

      <div className="grid grid-2 section-gap">
        <PillarAreaHeatmap />
        <ParetoChart />
      </div>

      <h2
        className="eyebrow"
        style={{ margin: '30px 0 12px', fontSize: 12, letterSpacing: '0.16em' }}
      >
        {t('table.title')}
      </h2>
      <Filters filters={filters} setFilters={setFilters} />
      <DetailTable filters={filters} />

      <footer className="foot">
        <span>Palestra Couture · 5S · {t('app.title')}</span>
        <span>{t('footer.note')}</span>
      </footer>

      <div className="toolbar">
        <ExcelImporter />
        <PdfExporter />
      </div>
    </div>
  )
}
