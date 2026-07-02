import { useState } from 'react'
import { useI18n } from '../i18n'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

interface Props {
  /** Se ejecuta antes de capturar: sirve para forzar la pestaña Dashboard
   *  (donde vive el Resumen Ejecutivo) de modo que siempre entre en el PDF. */
  prepare?: () => void
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const BG: [number, number, number] = [33, 40, 45] // var(--bg) #21282d

export function PdfExporter({ prepare }: Props) {
  const { t } = useI18n()
  const [busy, setBusy] = useState(false)

  const handleExport = async () => {
    setBusy(true)
    try {
      // 1. Asegurar que el Dashboard (con el Resumen Ejecutivo) esté montado y
      //    que su animación de entrada haya terminado antes de capturar.
      prepare?.()
      await sleep(700)

      const el = document.querySelector('.shell') as HTMLElement
      if (!el) return

      const canvas = await html2canvas(el, {
        backgroundColor: '#21282d',
        scale: 2,
        allowTaint: false,
        useCORS: true,
        logging: false,
        windowWidth: el.scrollWidth,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()

      // Ancho = página completa; alto proporcional. Si supera una hoja, se
      // reparte en varias desplazando la imagen hacia arriba (cada página
      // recorta a su propio alto).
      const imgH = (canvas.height * pdfW) / canvas.width

      const paintBg = () => {
        pdf.setFillColor(...BG)
        pdf.rect(0, 0, pdfW, pdfH, 'F')
      }

      let heightLeft = imgH
      let position = 0
      paintBg()
      pdf.addImage(imgData, 'PNG', 0, position, pdfW, imgH)
      heightLeft -= pdfH

      while (heightLeft > 0) {
        position -= pdfH
        pdf.addPage()
        paintBg()
        pdf.addImage(imgData, 'PNG', 0, position, pdfW, imgH)
        heightLeft -= pdfH
      }

      const stamp = new Date().toISOString().slice(0, 10)
      pdf.save(`KPI-Palestra-Couture-${stamp}.pdf`)
    } catch (err) {
      console.error('PDF error:', err)
    }
    setBusy(false)
  }

  return (
    <button className="action-btn" onClick={handleExport} disabled={busy}>
      <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2v8M5 7l3 3 3-3" />
        <path d="M2.5 10.5v2a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-2" />
      </svg>
      {busy ? 'Generando…' : t('export.pdf')}
    </button>
  )
}
