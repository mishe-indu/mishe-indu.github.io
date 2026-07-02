import { RadarPilares } from './five/RadarPilares'
import { BarrasArea } from './five/BarrasArea'
import { HeatmapPilarArea } from './five/HeatmapPilarArea'
import { ParetoNC } from './five/ParetoNC'
import { globalIndex, band, bandColor, areaCompliance, paretoNC } from '../data/fiveS'

const BAND_LABEL = { good: 'Conforme', warning: 'Observado', critical: 'Crítico' } as const

export function TabFiveS() {
  const gi = globalIndex()
  const gColor = bandColor(gi)
  const areas = areaCompliance()
  const approved = areas.filter((a) => a.value >= 85).length
  const nc = paretoNC().reduce((s, r) => s + r.count, 0)

  return (
    <div>
      <div className="five-banner">
        <div className="five-banner-main">
          <span className="five-banner-label">Índice global 5S</span>
          <span className="five-banner-value" style={{ color: gColor }}>
            {gi}%
          </span>
          <span className="badge-5s" style={{ color: gColor, borderColor: gColor, background: `${gColor}1a` }}>
            {BAND_LABEL[band(gi)]}
          </span>
        </div>
        <div className="five-banner-stats">
          <div>
            <span className="fs-num">{areas.length}</span>
            <span className="fs-lbl">áreas</span>
          </div>
          <div>
            <span className="fs-num" style={{ color: 'var(--good)' }}>
              {approved}/{areas.length}
            </span>
            <span className="fs-lbl">aprobadas ≥85%</span>
          </div>
          <div>
            <span className="fs-num" style={{ color: 'var(--critical)' }}>
              {nc}
            </span>
            <span className="fs-lbl">no conformidades</span>
          </div>
        </div>
      </div>

      <div className="five-grid">
        <RadarPilares />
        <BarrasArea />
        <HeatmapPilarArea />
        <ParetoNC />
      </div>
    </div>
  )
}
