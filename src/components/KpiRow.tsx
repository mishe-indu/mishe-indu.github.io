import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import { summary, pct } from '../data/compute'
import { AREAS } from '../data/audit'
import { STATUS, AMBER, CYAN } from '../theme'

/** Contador animado que respeta prefers-reduced-motion. */
function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0)
  const raf = useRef<number>()
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setVal(target)
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(target * eased)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    // Red de seguridad: garantiza el valor exacto aunque rAF se pause.
    const settle = window.setTimeout(() => setVal(target), duration + 80)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      clearTimeout(settle)
    }
  }, [target, duration])
  return val
}

function Kpi({
  label,
  value,
  sub,
  accent,
  fill,
}: {
  label: string
  value: string
  sub: string
  accent: string
  fill?: number // 0–1 para la barra
}) {
  return (
    <div className="kpi" style={{ ['--accent' as string]: accent }}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color: accent }}>
        {value}
      </div>
      <div className="kpi-sub">{sub}</div>
      {fill !== undefined && (
        <div className="kpi-bar" aria-hidden="true">
          <span style={{ width: `${Math.round(fill * 100)}%`, background: accent }} />
        </div>
      )}
    </div>
  )
}

export function KpiRow() {
  const { t } = useI18n()
  const s = summary()
  const gIndex = s.global.index ?? 0
  const gColor = STATUS[s.global.band]
  const animated = useCountUp(gIndex * 100)

  return (
    <section className="kpi-row" aria-label={t('kpi.global')}>
      <Kpi
        label={t('kpi.global')}
        value={`${Math.round(animated)}%`}
        sub={`${s.global.si}/${s.global.total} ${t('kpi.items')} · ${t('resp.si')}`}
        accent={gColor}
        fill={gIndex}
      />
      <Kpi
        label={t('kpi.areas')}
        value={String(s.areasEvaluated)}
        sub={AREAS.map((a) => a.es).join(' · ')}
        accent={CYAN}
      />
      <Kpi
        label={t('kpi.approved')}
        value={`${s.areasApproved}/${s.areasEvaluated}`}
        sub={t('kpi.approved.hint')}
        accent={AMBER}
        fill={s.areasEvaluated ? s.areasApproved / s.areasEvaluated : 0}
      />
      <Kpi
        label={t('kpi.nc')}
        value={String(s.nonConformities)}
        sub={`${pct(s.global.no / s.global.total)} ${t('resp.no')}`}
        accent={STATUS.critical}
        fill={s.global.total ? s.global.no / s.global.total : 0}
      />
    </section>
  )
}
