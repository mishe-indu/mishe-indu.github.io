import { useI18n } from '../i18n'
import { useAudit } from '../data/AuditContext'

export function Header() {
  const { t, lang, setLang } = useI18n()
  const { meta } = useAudit()
  const date = new Date(meta.date + 'T00:00:00').toLocaleDateString(
    lang === 'es' ? 'es-ES' : 'en-US',
    { day: '2-digit', month: 'long', year: 'numeric' },
  )
  const std = `${Math.round(meta.standardGreen * 100)}%`

  return (
    <header>
      <div className="topbar">
        <div className="brand">
          {/* Logo placeholder — reemplazá por <img src="./logo.svg" .../> */}
          <div className="brand-mark" aria-hidden="true">
            PC
          </div>
          <div>
            <div className="eyebrow">{meta.company}</div>
            <h1>{t('app.title')}</h1>
            <p>{t('app.subtitle')}</p>
          </div>
        </div>
        <div className="topbar-right">
          <div className="seg" role="group" aria-label="Language / Idioma">
            <button data-active={lang === 'es'} onClick={() => setLang('es')}>
              ES
            </button>
            <button data-active={lang === 'en'} onClick={() => setLang('en')}>
              EN
            </button>
          </div>
        </div>
      </div>

      <div className="meta-strip">
        <div className="meta-cell">
          <div className="label">{t('meta.responsible')}</div>
          <div className="value">{meta.responsible}</div>
        </div>
        <div className="meta-cell">
          <div className="label">{t('meta.date')}</div>
          <div className="value">{date}</div>
        </div>
        <div className="meta-cell">
          <div className="label">{t('meta.location')}</div>
          <div className="value">{meta.location}</div>
        </div>
        <div className="meta-cell">
          <div className="label">{t('meta.standard')}</div>
          <div className="value mono">≥ {std}</div>
        </div>
      </div>
    </header>
  )
}
