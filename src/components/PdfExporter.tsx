import { useState } from 'react'
import { useI18n } from '../i18n'
import { useAudit } from '../data/AuditContext'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

export function PdfExporter() {
  const { t } = useI18n()
  const { meta } = useAudit()
  const [busy, setBusy] = useState(false)

  const handleExport = async () => {
    setBusy(true)
    try {
      const el = document.querySelector('.shell') as HTMLElement
      if (!el) return

      const canvas = await html2canvas(el, {
        backgroundColor: '#0e0f12',
        scale: 2,
        allowTaint: false,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()

      const imgW = canvas.width
      const imgH = canvas.height
      const ratio = imgW / imgH
      let renderW = pdfW
      let renderH = renderW / ratio

      if (renderH > pdfH) {
        renderH = pdfH
        renderW = renderH * ratio
      }

      const x = (pdfW - renderW) / 2
      const y = (pdfH - renderH) / 2

      pdf.addImage(imgData, 'PNG', x, y, renderW, renderH)
      pdf.save(`5S-${meta.company.replace(/\s+/g, '-')}-${meta.date}.pdf`)
    } catch (err) {
      console.error('PDF export error:', err)
    }
    setBusy(false)
  }

  return (
    <button className="action-btn" onClick={handleExport} disabled={busy}>
      {busy ? '…' : t('export.pdf')}
    </button>
  )
}
