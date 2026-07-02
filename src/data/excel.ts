import * as XLSX from 'xlsx'
import {
  type KpiDashboard,
  type KpiDefinition,
  type KpiMonthData,
  evalStatus,
} from './kpi'

const SHEET_NAMES: Record<string, string> = {
  'kpi publicaciones': 'publicaciones',
  "kpi 5's": '5s',
  'kpi ventas': 'ventas',
  'kpi conformidad': 'conformidad',
  'kpi accidentes': 'accidentes',
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

function cleanNum(v: any): number | null {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number' && !isNaN(v)) return v
  const s = String(v).trim().replace(',', '.')
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}

function parseThreshold(text: string): number {
  const n = parseFloat(text.replace(',', '.'))
  return isNaN(n) ? 0 : n
}

export function parseMatrixWorkbook(buf: ArrayBuffer, _filename: string): {
  dashboard: KpiDashboard | null
  errors: string[]
} {
  const errors: string[] = []
  const wb = XLSX.read(buf, { type: 'array' })

  // ── 1. Parse MATRIZ DE INDICADORES sheet ───────────────────────────
  const matrixSheet = wb.SheetNames.find(
    (n) => /matriz/i.test(n)
  )
  if (!matrixSheet) {
    errors.push('No se encontró la hoja "MATRIZ DE INDICADORES"')
    return { dashboard: null, errors }
  }

  const matrixRows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[matrixSheet], { header: 1, defval: '' })

  // Find header row with PERSPECTIVA, OBJETIVO, INDICADOR
  let headerRow = -1
  for (let r = 0; r < matrixRows.length; r++) {
    const row = matrixRows[r] || []
    for (let c = 0; c < row.length; c++) {
      if (norm(String(row[c])) === 'perspectiva') {
        headerRow = r
        break
      }
    }
    if (headerRow >= 0) break
  }

  if (headerRow < 0) {
    errors.push('No se encontraron las columnas PERSPECTIVA, OBJETIVO, INDICADOR en la matriz')
    return { dashboard: null, errors }
  }

  const defs: KpiDefinition[] = []
  let idx = 0

  for (let r = headerRow + 2; r < matrixRows.length; r++) {
    const row = matrixRows[r] || []
    const perspective = String(row[2] || '').trim()
    const objective = String(row[3] || '').trim()
    const name = String(row[4] || '').trim()
    const formula = String(row[5] || '').trim()
    const unit = String(row[6] || '').trim()
    const frequency = String(row[7] || '').trim()
    const idealDesc = String(row[8] || '').trim()
    const acceptableDesc = String(row[9] || '').trim()
    const deficientDesc = String(row[10] || '').trim()
    const responsible = String(row[11] || '').trim()

    if (!name) continue
    if (name.toLowerCase().includes('puntaje total') || name.toLowerCase().includes('indice')) continue

    idx++
    const invert = norm(name).includes('accident') || norm(name).includes('tasa')

    defs.push({
      id: idx,
      perspective,
      objective,
      name,
      formula,
      unit,
      frequency,
      idealDesc,
      acceptableDesc,
      deficientDesc,
      responsible: responsible.replace(/\n/g, ' ').trim(),
      idealThreshold: parseThreshold(idealDesc),
      acceptableThreshold: parseThreshold(acceptableDesc),
      deficientThreshold: parseThreshold(deficientDesc),
      invert,
    })
  }

  if (defs.length === 0) {
    errors.push('No se encontraron KPIs en la matriz')
    return { dashboard: null, errors }
  }

  // ── 2. Parse each KPI sheet ────────────────────────────────────────
  const kpiData: Record<number, KpiMonthData[]> = {}

  for (const def of defs) {
    const sheetId = SHEET_NAMES[norm(def.perspective)] || norm(def.name).replace(/\s/g, '_')
    const sheetName = wb.SheetNames.find((n) => {
      const nn = norm(n)
      return nn.includes(sheetId) || nn.includes(norm(def.name).slice(0, 10))
    })

    if (!sheetName) {
      kpiData[def.id] = []
      continue
    }

    const rows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: '' })

    let dataStart = -1
    let resultCol = -1
    let metaCol = -1
    let periodCol = -1

    for (let r = 0; r < Math.min(20, rows.length); r++) {
      const row = rows[r] || []
      for (let c = 0; c < row.length; c++) {
        const h = norm(String(row[c]))
        if (h === 'perido' || h === 'período' || h === 'periodo') {
          periodCol = c
          dataStart = r + 1
        }
        if (h === 'resultado %' || h === 'resultado' || h === 'resultado %') resultCol = c
        if (h === 'meta') metaCol = c
      }
    }

    const months: KpiMonthData[] = []

    if (dataStart < 0) {
      kpiData[def.id] = months
      continue
    }

    // Find result and meta columns from header if not found
    if (resultCol < 0 || metaCol < 0) {
      const headerRow = rows[dataStart - 1] || []
      for (let c = 0; c < headerRow.length; c++) {
        const h = norm(String(headerRow[c]))
        if (h.includes('resultado') || h.includes('%')) resultCol = c
        if (h === 'meta') metaCol = c
      }
    }

    for (let r = dataStart; r < rows.length; r++) {
      const row = rows[r] || []
      const period = String(row[periodCol] || '').trim()
      if (!period || period === '.' || period.length > 12) continue
      if (norm(period) === 'total' || norm(period) === 'promedio') continue

      const result = resultCol >= 0 ? cleanNum(row[resultCol]) : null
      const meta = metaCol >= 0 ? cleanNum(row[metaCol]) : null

      months.push({
        period,
        result: result ?? null,
        meta: meta ?? null,
        status: evalStatus(def, result),
        rawValues: {},
      })
    }

    kpiData[def.id] = months
  }

  // ── 3. Company info ────────────────────────────────────────────────
  let date = new Date().toISOString().slice(0, 10)

  // Find the first valid month across all KPIs to use as reference date
  for (const def of defs) {
    const months = kpiData[def.id]
    if (months && months.length > 0) {
      break
    }
  }

  return {
    dashboard: {
      meta: { company: 'Palestra Couture', date, responsible: '' },
      definitions: defs,
      data: kpiData,
    },
    errors,
  }
}
