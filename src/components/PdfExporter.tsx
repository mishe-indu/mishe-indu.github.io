import { useState } from 'react'
import { useI18n } from '../i18n'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

export function PdfExporter() {
  const { t } = useI18n()
  const [busy, setBusy] = useState(false)

  const handleExport = async () => {
    setBusy(true)
    try {
      const el = document.querySelector('.shell') as HTMLElement
      if (!el) return

      const canvas = await html2canvas(el, {
        backgroundColor: '#21282d',
        scale: 2,
        allowTaint: false,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()

      const ratio = canvas.width / canvas.height
      let renderW = pdfW
      let renderH = renderW / ratio

      if (renderH > pdfH) {
        renderH = pdfH
        renderW = renderH * ratio
      }

      pdf.addImage(imgData, 'PNG', (pdfW - renderW) / 2, (pdfH - renderH) / 2, renderW, renderH)
      pdf.save('KPI-Palestra-Couture.pdf')
    } catch (err) {
      console.error('PDF error:', err)
    }
    setBusy(false)
  }

  return (
    <button className="action-btn" onClick={handleExport} disabled={busy}>
      {busy ? '…' : t('export.pdf')}
    </button>
  )
}
