import * as XLSX from 'xlsx'
import {
  type KpiDashboard,
  type KpiDefinition,
  type KpiMonthData,
  evalStatus,
} from './kpi'

// La hoja de datos de cada KPI se encuentra por su PERSPECTIVA (columna de la
// matriz), buscando un fragmento en el nombre de la hoja. Ej: perspectiva
// "Publicidad" -> hoja "KPI PUBLICACIONES".
const PERSPECTIVE_TO_SHEET: Record<string, string> = {
  publicidad: 'publicaciones',
  visual: "5's",
  ventas: 'ventas',
  'gestión de calidad': 'conformidad',
  'gestion de calidad': 'conformidad',
  seguridad: 'accidentes',
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Detecta si un libro es una AUDITORÍA 5S (checklist SI/NO/N/A) en vez de la
 * matriz de KPIs. Se usa para redirigir al panel /5s/ cuando alguien sube un
 * archivo tipo "Formato auditoria 5'Ss MMH" o "5S PALESTRA COUTURE".
 */
export function looksLikeAudit(buf: ArrayBuffer): boolean {
  try {
    const wb = XLSX.read(buf, { type: 'array' })
    if (wb.SheetNames.some((n) => /audit|check\s*list|checklist/i.test(n))) return true
    // Fallback: alguna hoja con encabezado SI | NO | N/A en las primeras filas
    for (const sn of wb.SheetNames.slice(0, 4)) {
      const rows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, defval: '' })
      for (const row of rows.slice(0, 15)) {
        const cells = (row || []).map((c) => String(c).trim().toUpperCase())
        if (cells.includes('SI') && cells.includes('NO') && (cells.includes('N/A') || cells.includes('NA'))) {
          return true
        }
      }
    }
  } catch {
    // archivo ilegible: no es auditoría
  }
  return false
}

function cleanNum(v: any): number | null {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number' && !isNaN(v)) return v
  const s = String(v).trim().replace(',', '.')
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}

// Todo se normaliza a FRACCIÓN (0–1). El Excel mezcla escalas: la mayoría de
// hojas guardan el resultado como fracción (0.5) pero accidentes como
// porcentaje (100). Si el valor supera 1.5 asumimos que viene en % y lo
// dividimos entre 100.
function toFraction(v: number | null): number | null {
  if (v === null) return null
  return Math.abs(v) > 1.5 ? v / 100 : v
}

// Extrae el primer número del texto de la meta ("Entre 70% y 89%..." -> 70) y
// lo pasa a fracción. parseFloat directo fallaba cuando el texto empieza con
// palabra ("Entre", "Menor", "igual").
function parseThreshold(text: string): number {
  const m = String(text).match(/(\d+(?:[.,]\d+)?)/)
  if (!m) return 0
  const n = parseFloat(m[1].replace(',', '.'))
  return isNaN(n) ? 0 : n / 100
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

  // Localizar la fila Y COLUMNA de PERSPECTIVA. Las demás columnas se leen
  // relativas a ella (persp, obj, indicador, fórmula, unidad, frecuencia,
  // ideal, aceptable, deficiente, responsable) para tolerar hojas cuyo rango
  // usado no empieza en la columna A o donde insertaron/borraron columnas
  // a la izquierda.
  let headerRow = -1
  let baseCol = -1
  for (let r = 0; r < matrixRows.length; r++) {
    const row = matrixRows[r] || []
    for (let c = 0; c < row.length; c++) {
      if (norm(String(row[c])) === 'perspectiva') {
        headerRow = r
        baseCol = c
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
    const col = (offset: number) => String(row[baseCol + offset] || '').trim()
    const perspective = col(0)
    const objective = col(1)
    const name = col(2)
    const formula = col(3)
    const unit = col(4)
    const frequency = col(5)
    const idealDesc = col(6)
    const acceptableDesc = col(7)
    const deficientDesc = col(8)
    const responsible = col(9)

    if (!name) continue
    // Saltar filas-resumen del formato de auditoría, no KPIs reales.
    const lower = name.toLowerCase()
    if (lower.includes('puntaje total') || lower.startsWith('índice ok') || lower.startsWith('indice ok')) continue

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
    const frag = PERSPECTIVE_TO_SHEET[norm(def.perspective)]
    const sheetName = frag
      ? wb.SheetNames.find((n) => norm(n).includes(frag))
      : undefined

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

      const result = toFraction(resultCol >= 0 ? cleanNum(row[resultCol]) : null)
      const meta = toFraction(metaCol >= 0 ? cleanNum(row[metaCol]) : null)

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
